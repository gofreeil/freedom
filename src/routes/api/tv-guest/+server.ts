// ============================================================
// /api/tv-guest — Freedom TV למי שאינו בצוות הרשת (דף /admin/tv).
//   GET  → { columns, mine, others } — כותרות, השורות שהמשתמש עצמו הוסיף, וכמה שורות
//          יש לאחרים (בלי תוכן; הדף מציג אותן ככוכביות)
//   POST { id, cells } → מוסיף שורה בשם המשתמש
// הסינון נעשה בבאקאנד (/api/network-board/guest) — תוכן של אחרים לא מגיע לכאן בכלל.
// ============================================================
import { json } from '@sveltejs/kit';
import { STRAPI_URL } from '$lib/server/strapiAuth';
import type { RequestHandler } from './$types';

async function jwtOf(locals: App.Locals): Promise<string | null> {
	const session = await locals.auth();
	return (session?.user as { strapiJwt?: string } | undefined)?.strapiJwt || null;
}

const NEED_LOGIN = () => json({ error: 'צריך להתחבר' }, { status: 401 });

export const GET: RequestHandler = async ({ locals, setHeaders }) => {
	const jwt = await jwtOf(locals);
	if (!jwt) return NEED_LOGIN();
	setHeaders({ 'cache-control': 'no-store' });
	try {
		const res = await fetch(`${STRAPI_URL}/api/network-board/guest`, {
			headers: { Authorization: `Bearer ${jwt}` },
			signal: AbortSignal.timeout(10_000)
		});
		if (!res.ok) return json({ error: `שגיאה בטעינה (${res.status})` }, { status: 502 });
		return json(await res.json());
	} catch {
		return json({ error: 'תקלה בשרת — נסו שוב' }, { status: 502 });
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const jwt = await jwtOf(locals);
	if (!jwt) return NEED_LOGIN();
	let body: { id?: unknown; cells?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'בקשה לא תקינה' }, { status: 400 });
	}
	try {
		const res = await fetch(`${STRAPI_URL}/api/network-board/guest`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: body.id, cells: body.cells }),
			signal: AbortSignal.timeout(15_000)
		});
		if (res.ok) return json({ ok: true });
		const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } | string };
		const msg = typeof err.error === 'string' ? err.error : err.error?.message;
		return json({ error: msg || 'השמירה נכשלה — נסו שוב' }, { status: res.status === 400 ? 400 : 502 });
	} catch {
		return json({ error: 'תקלה בשרת — נסו שוב' }, { status: 502 });
	}
};
