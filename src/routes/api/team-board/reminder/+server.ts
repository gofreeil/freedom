// ============================================================
// /api/team-board/reminder — שליחת סמס תזכורת על משימה למנהל/רכז.
//   POST { taskId: string, phone?: string } → { ok: true, phone: string }
// ============================================================
import { json } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin, normalizePhone, getPublicSiteAdmins } from '$lib/server/siteAdmins';
import { STRAPI_URL } from '$lib/server/strapiAuth';
import { readBoard, teamRoster } from '$lib/server/teamBoard';
import { sendSms } from '$lib/server/coordinatorMessage';
import { getSite } from '$lib/sitesData';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request, url, cookies }) => {
	const session = await locals.auth();
	const email = session?.user?.email?.trim().toLowerCase() ?? '';
	if (!email) return json({ error: 'צריך להתחבר' }, { status: 401 });

	const isRealSuper = isSuperAdmin(email);
	const viewRole = isRealSuper ? cookies.get('super_view_role') : null;
	const isSuper = isRealSuper && viewRole !== 'admin';
	if (!isSuper && !(await isNetworkAdmin(email)) && !isRealSuper) {
		return json({ error: 'שליחת תזכורות מותרת לצוות הרשת בלבד' }, { status: 403 });
	}

	const jwt = (session!.user as { strapiJwt?: string }).strapiJwt ?? '';
	if (!jwt) {
		return json(
			{ error: 'חסר אישור מול השרת המשותף — יש להתנתק ולהתחבר מחדש' },
			{ status: 401 }
		);
	}

	let taskId = '';
	let customPhone = '';
	try {
		const body = (await request.json()) as { taskId?: string; phone?: string };
		taskId = String(body.taskId ?? '').trim();
		customPhone = String(body.phone ?? '').trim();
	} catch {
		return json({ error: 'בקשה לא תקינה' }, { status: 400 });
	}

	if (!taskId) return json({ error: 'חסר מזהה משימה' }, { status: 400 });

	let boardData;
	try {
		boardData = await readBoard(jwt);
	} catch (e) {
		return json({ error: 'שגיאה בטעינת לוח המשימות' }, { status: 502 });
	}

	const task = boardData.board.tasks.find((t) => t.id === taskId);
	if (!task) return json({ error: 'המשימה לא נמצאה' }, { status: 404 });

	let targetPhone = normalizePhone(customPhone);

	// 1. נסה למצוא טלפון בצוות
	if (!targetPhone) {
		try {
			const team = await teamRoster(boardData.board);
			const me = team.find((m) => m.id === email || m.email === email);
			if (me?.phone) targetPhone = normalizePhone(me.phone);
		} catch {}
	}

	// 2. נסה למצוא טלפון במפת האדמינים הציבורית
	if (!targetPhone) {
		try {
			const { admins } = await getPublicSiteAdmins().catch(() => ({ admins: {} }));
			const adm = Object.values(admins).find(
				(a) => a.adminEmail?.trim().toLowerCase() === email
			);
			if (adm?.phone) targetPhone = normalizePhone(adm.phone);
		} catch {}
	}

	// 3. נסה למשוך טלפון ממשתמש ה-Strapi
	if (!targetPhone) {
		try {
			const q = new URLSearchParams({
				'filters[email][$eqi]': email,
				'fields[0]': 'phone',
				'pagination[limit]': '1'
			});
			const res = await fetch(`${STRAPI_URL}/api/users?${q}`, {
				headers: { Authorization: `Bearer ${jwt}` },
				signal: AbortSignal.timeout(8_000)
			});
			if (res.ok) {
				const rows = (await res.json()) as Array<{ phone?: string | null }>;
				if (rows?.[0]?.phone) targetPhone = normalizePhone(rows[0].phone);
			}
		} catch {}
	}

	if (!targetPhone || targetPhone.length < 9) {
		return json(
			{
				error: 'לא מוגדר מספר טלפון לחשבונך. נא להזין מספר לקבלת הסמס.',
				needPhone: true
			},
			{ status: 400 }
		);
	}

	const site = task.siteId ? getSite(task.siteId) : null;
	const lines = [
		`🔔 תזכורת למשימה: ${task.title}`,
		site ? `אתר: ${site.name}` : '',
		task.due ? `יעד: ${task.due}` : '',
		task.priority === 'urgent' ? 'עדיפות: דחופה' : '',
		`קישור: ${url.origin}/admin?task=${task.id}`
	].filter(Boolean);

	const message = lines.join('\n');

	try {
		await sendSms(targetPhone, message, jwt);
		return json({ ok: true, phone: targetPhone });
	} catch (e) {
		console.error('[team-board/reminder] sms failed:', e);
		const errStr = e instanceof Error ? e.message : 'תקלה';
		return json({ error: `שליחת הסמס נכשלה (${errStr})` }, { status: 502 });
	}
};
