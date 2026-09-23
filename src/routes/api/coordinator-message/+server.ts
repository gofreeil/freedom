// POST /api/coordinator-message — "השאירו הודעה" לרכז מרשימת צוות הרכזים ב-/about.
// למחוברים בלבד: השולח מזוהה (שם + אימייל להשבה), וזה גם הבלם העיקרי נגד הצפה
// של SMS לרכזים. הלוגיקה עצמה ב-$lib/server/coordinatorMessage.ts.
import { json } from '@sveltejs/kit';
import { sendCoordinatorMessage, ContactError } from '$lib/server/coordinatorMessage';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	const email = session?.user?.email ?? '';
	if (!email) return json({ error: 'צריך להתחבר כדי להשאיר הודעה' }, { status: 401 });

	let body: { siteId?: unknown; text?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'בקשה לא תקינה' }, { status: 400 });
	}

	try {
		await sendCoordinatorMessage({
			siteId: String(body.siteId ?? ''),
			text: String(body.text ?? ''),
			from: { name: session?.user?.name ?? '', email }
		});
		return json({ ok: true });
	} catch (e) {
		if (e instanceof ContactError) return json({ error: e.message }, { status: e.status });
		console.error('[coordinator-message] failed:', e);
		return json({ error: 'שליחת ההודעה נכשלה — נסו שוב' }, { status: 502 });
	}
};
