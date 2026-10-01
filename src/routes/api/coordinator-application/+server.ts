// POST /api/coordinator-application — "הגשת מועמדות" לתפקיד רכז, מהקישור "דרוש רכז"
// ברשימת צוות הרכזים ב-/about. פתוח גם למי שלא מחובר; הריסון וההגנות נגד הצפת SMS
// יושבים ב-$lib/server/coordinatorApplication.ts, יחד עם הלוגיקה עצמה.
import { json } from '@sveltejs/kit';
import { submitCoordinatorApplication } from '$lib/server/coordinatorApplication';
import { ContactError } from '$lib/server/coordinatorMessage';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'בקשה לא תקינה' }, { status: 400 });
	}
	if (!body || typeof body !== 'object') return json({ error: 'בקשה לא תקינה' }, { status: 400 });

	let clientKey = 'unknown';
	try {
		clientKey = getClientAddress();
	} catch {
		// מאחורי פרוקסי בלי כתובת — כולם באותו דלי, ועדיין חלה התקרה הכללית
	}

	try {
		await submitCoordinatorApplication(body, clientKey);
		return json({ ok: true });
	} catch (e) {
		if (e instanceof ContactError) return json({ error: e.message }, { status: e.status });
		console.error('[coordinator-application] failed:', e);
		return json({ error: 'הגשת המועמדות נכשלה — נסו שוב' }, { status: 502 });
	}
};
