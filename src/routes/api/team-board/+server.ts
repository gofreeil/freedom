// ============================================================
// /api/team-board — לוח המשימות והדיווחים של צוות הרשת (דף /admin).
//   GET  → { me, team, board, rev }
//   POST { op } → { board, rev } — מחיל פעולה אחת (ראו BoardOp ב-$lib/teamBoard)
// פתוח לסופר-אדמין ולאדמיני אתרי הרשת בלבד; הבאקאנד אוכף את אותו כלל שוב.
// ============================================================
import { json } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import { friendlyName } from '$lib/server/strapiAuth';
import { readBoard, mutateBoard, teamRoster, BoardStorageError } from '$lib/server/teamBoard';
import { BoardError, type Actor, type BoardOp, type BoardTask, type Member } from '$lib/teamBoard';
import type { RequestHandler } from './$types';

type Auth = { actor: Actor; jwt: string } | { error: Response };

async function authorize(locals: App.Locals): Promise<Auth> {
	const session = await locals.auth();
	const email = session?.user?.email?.trim().toLowerCase() ?? '';
	if (!email) return { error: json({ error: 'צריך להתחבר' }, { status: 401 }) };
	const isSuper = isSuperAdmin(email);
	if (!isSuper && !(await isNetworkAdmin(email)))
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
	const me = team.find((m) => m.id === actorId);
	const siteIds = new Set(me?.siteIds ?? []);
	return tasks.filter((t) => {
		// שויך מפורשות לרכז
		if (t.assignees.includes(actorId)) return true;
		// נוצר על ידי הרכז
		if (t.createdBy === actorId) return true;
		// שייך לאתר שהרכז מנהל
		if (t.siteId && siteIds.has(t.siteId)) return true;
		// שויך לתפקיד רכז האתר (למשל site:freedom_club)
		if (t.assignees.some((a) => a.startsWith('site:') && siteIds.has(a.slice(5)))) return true;
		return false;
	});
}

export const GET: RequestHandler = async ({ locals, setHeaders }) => {
	const auth = await authorize(locals);
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

export const POST: RequestHandler = async ({ locals, request }) => {
	const auth = await authorize(locals);
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
