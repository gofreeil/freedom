// ============================================================
// לוח הצוות (/admin) — קריאה וכתיבה מול ה-Strapi המשותף.
//
// האחסון: GET/PUT /api/network-board (הרחבת users-permissions ב-community-backend).
// הבאקאנד רק שומר ומגן (צוות הרשת בלבד, compare-and-swap לפי rev); הלוגיקה —
// מה מותר ולמי — יושבת ב-lib/teamBoard.ts ומוחלת כאן לפני כל שמירה.
// אם מישהו אחר שמר בין הקריאה לכתיבה (409), קוראים שוב ומחילים את הפעולה מחדש.
// ============================================================
import { STRAPI_URL } from './strapiAuth';
import { getPublicSiteAdmins } from './siteAdmins';
import { superAdminEmails } from './superAdmin';
import { gravatarUrl } from './gravatar';
import { displayAvatarUrl } from './avatarProxy';
import { friendlyName } from './strapiAuth';
import { applyOp, normalizeBoard, type Actor, type BoardData, type BoardOp, type Member } from '$lib/teamBoard';

function headers(jwt: string): Record<string, string> {
	return { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' };
}

export class BoardStorageError extends Error {
	constructor(
		message: string,
		public status = 502
	) {
		super(message);
	}
}

/** קריאת הלוח מהשרת המשותף */
export async function readBoard(jwt: string): Promise<{ board: BoardData; rev: number }> {
	const res = await fetch(`${STRAPI_URL}/api/network-board`, {
		headers: headers(jwt),
		signal: AbortSignal.timeout(10_000)
	});
	if (res.status === 401 || res.status === 403)
		throw new BoardStorageError('אין הרשאה ללוח הצוות — נסו להתנתק ולהתחבר מחדש', 403);
	if (!res.ok) throw new BoardStorageError(`שגיאה בטעינת הלוח (${res.status})`);
	const json = (await res.json()) as { data?: unknown; rev?: number };
	return { board: normalizeBoard(json.data), rev: Number(json.rev ?? 0) };
}

/** מחיל פעולה ושומר. זורק BoardError (קלט/הרשאה) או BoardStorageError (שרת). */
export async function mutateBoard(
	jwt: string,
	op: BoardOp,
	actor: Actor
): Promise<{ board: BoardData; rev: number }> {
	for (let attempt = 0; attempt < 5; attempt++) {
		const { board, rev } = await readBoard(jwt);
		applyOp(board, op, actor, new Date().toISOString());
		const res = await fetch(`${STRAPI_URL}/api/network-board`, {
			method: 'PUT',
			headers: headers(jwt),
			body: JSON.stringify({ data: board, rev }),
			signal: AbortSignal.timeout(15_000)
		});
		if (res.status === 409) continue; // מישהו שמר בדיוק עכשיו — מנסים שוב על הגרסה החדשה
		if (!res.ok) {
			console.error('[team-board] save failed:', res.status, await res.text().catch(() => ''));
			throw new BoardStorageError('השמירה בשרת המשותף נכשלה — נסו שוב');
		}
		const json = (await res.json()) as { rev?: number };
		return { board, rev: Number(json.rev ?? rev + 1) };
	}
	throw new BoardStorageError('הלוח עמוס כרגע — נסו שוב בעוד רגע', 503);
}

/**
 * רשימת חברי הצוות: הרכזים שמונו לאתרי הרשת (אדם אחד יכול לרכז כמה אתרים)
 * ובראשם הסופר-אדמינים. רכז בלי אימייל מזוהה כ-site:<siteId>.
 */
export async function teamRoster(board: BoardData): Promise<Member[]> {
	const { admins, order } = await getPublicSiteAdmins().catch(() => ({
		admins: {} as Awaited<ReturnType<typeof getPublicSiteAdmins>>['admins'],
		order: [] as string[]
	}));
	const pos = new Map(order.map((id, i) => [id, i]));
	const siteIds = Object.keys(admins).sort(
		(a, b) => (pos.get(a) ?? Infinity) - (pos.get(b) ?? Infinity)
	);

	const byId = new Map<string, Member>();
	for (const siteId of siteIds) {
		const a = admins[siteId];
		if (!a?.adminName && !a?.adminEmail) continue;
		const email = (a.adminEmail ?? '').trim().toLowerCase();
		const id = email || `site:${siteId}`;
		const existing = byId.get(id);
		if (existing) {
			existing.siteIds.push(siteId);
			existing.phone ||= a.phone ?? '';
			continue;
		}
		byId.set(id, {
			id,
			email,
			name: a.adminName || friendlyName(null, email),
			role: a.role ?? '',
			phone: a.phone ?? '',
			avatar: displayAvatarUrl(siteId, a.avatarUrl) || (email ? gravatarUrl(email) : ''),
			siteIds: [siteId],
			isSuper: false
		});
	}

	const supers: Member[] = superAdminEmails().map((email) => {
		const m = byId.get(email);
		byId.delete(email);
		const known = board.people[email];
		return {
			id: email,
			email,
			name: m?.name || known?.name || friendlyName(null, email),
			role: m?.role || 'מנהל הרשת',
			phone: m?.phone ?? '',
			avatar: m?.avatar || known?.image || gravatarUrl(email),
			siteIds: m?.siteIds ?? [],
			isSuper: true
		};
	});

	return [...supers, ...byId.values()];
}
