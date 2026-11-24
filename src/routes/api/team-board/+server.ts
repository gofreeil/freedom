// ============================================================
// /api/team-board — לוח המשימות והדיווחים של צוות הרשת (דף /admin).
//   GET  → { me, team, board, rev }
//   POST { op } → { board, rev } — מחיל פעולה אחת (ראו BoardOp ב-$lib/teamBoard)
// פתוח לסופר-אדמין ולאדמיני אתרי הרשת בלבד; הבאקאנד אוכף את אותו כלל שוב.
// ============================================================
import { json, type Cookies } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin, normalizePhone } from '$lib/server/siteAdmins';
import { friendlyName } from '$lib/server/strapiAuth';
import { readBoard, mutateBoard, teamRoster, BoardStorageError } from '$lib/server/teamBoard';
import { BoardError, type Actor, type BoardOp, type BoardTask, type Member } from '$lib/teamBoard';
import type { RequestHandler } from './$types';

type Auth = { actor: Actor; jwt: string } | { error: Response };

async function authorize(locals: App.Locals, cookies?: Cookies): Promise<Auth> {
	const session = await locals.auth();
	const email = session?.user?.email?.trim().toLowerCase() ?? '';
	if (!email) return { error: json({ error: 'צריך להתחבר' }, { status: 401 }) };
	const isRealSuper = isSuperAdmin(email);
	const viewRole = isRealSuper && cookies ? cookies.get('super_view_role') : null;

	if (isRealSuper && (viewRole === 'user' || viewRole === 'guest')) {
		return { error: json({ error: 'אין הרשאה לאזור הניהול' }, { status: 403 }) };
	}

	const isSuper = isRealSuper && viewRole !== 'admin';
	if (!isSuper && !(await isNetworkAdmin(email)) && !isRealSuper)
		return { error: json({ error: 'לוח הצוות פתוח לצוות הרשת בלבד' }, { status: 403 }) };
	const jwt = (session!.user as { strapiJwt?: string }).strapiJwt ?? '';
	if (!jwt)
		return {
			error: json(
				{ error: 'חסר אישור מול השרת המשותף — יש להתנתק ולהתחבר מחדש' },
				{ status: 401 }
			)
		};
	return {
		jwt,
		actor: {
			id: email,
			name: friendlyName(session!.user!.name, email),
			image: session!.user!.image ?? '',
			isSuper
		}
	};
}

function failure(e: unknown): Response {
	if (e instanceof BoardError || e instanceof BoardStorageError)
		return json({ error: e.message }, { status: e.status });
	console.error('[team-board] failed:', e);
	return json({ error: 'תקלה בשרת — נסו שוב' }, { status: 502 });
}

function filterTasksForCoordinator(
	tasks: BoardTask[],
	actorId: string,
	team: Member[]
): BoardTask[] {
	const actorPhone = actorId.endsWith('@phone.gofreeil.com')
		? normalizePhone(actorId.split('@')[0])
		: '';
	const me = team.find(
		(m) =>
			m.id === actorId ||
			(actorPhone && normalizePhone(m.phone) === actorPhone) ||
			(actorPhone && m.id === `${actorPhone}@phone.gofreeil.com`)
	);
	const myIds = new Set([actorId, ...(me ? [me.id] : [])]);
	const siteIds = new Set(me?.siteIds ?? []);
	return tasks.filter((t) => {
		// שויך מפורשות לרכז
		if (t.assignees.some((a) => myIds.has(a))) return true;
		// שויך לתפקיד רכז האתר שהרכז מנהל (למשל site:freedom_club)
		if (t.assignees.some((a) => a.startsWith('site:') && siteIds.has(a.slice(5)))) return true;
		// נוצר על ידי הרכז, ובלבד שלא שויך למישהו אחר
		if (t.createdBy === actorId && (!t.assignees.length || t.assignees.some((a) => myIds.has(a)))) return true;
		return false;
	});
}

export const GET: RequestHandler = async ({ locals, setHeaders, cookies }) => {
	const auth = await authorize(locals, cookies);
	if ('error' in auth) return auth.error;
	setHeaders({ 'cache-control': 'no-store' });
	try {
		const { board, rev } = await readBoard(auth.jwt);
		const team = await teamRoster(board);
		if (!auth.actor.isSuper) {
			board.tasks = filterTasksForCoordinator(board.tasks, auth.actor.id, team);
		}
		return json({ me: auth.actor, team, board, rev });
	} catch (e) {
		return failure(e);
	}
};

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
	const auth = await authorize(locals, cookies);
	if ('error' in auth) return auth.error;
	let op: BoardOp;
	try {
		op = ((await request.json()) as { op: BoardOp }).op;
	} catch {
		return json({ error: 'בקשה לא תקינה' }, { status: 400 });
	}
	try {
		const { board, rev } = await mutateBoard(auth.jwt, op, auth.actor);
		if (!auth.actor.isSuper) {
			const team = await teamRoster(board);
			board.tasks = filterTasksForCoordinator(board.tasks, auth.actor.id, team);
		}
		return json({ board, rev });
	} catch (e) {
		return failure(e);
	}
};
