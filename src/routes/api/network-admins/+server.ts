// ============================================================
// GET /api/network-admins — אדמיני אתרי הרשת לתצוגה ציבורית.
//
// למה נקודת קצה ולא load של הדף: הכרטיסייה "ניהול הרשת" ב-/about מושכת אותה
// רק כשפותחים אותה, כך שדף האודות עצמו נשאר קל.
//
// התמונות עצמן לא נשלחות כאן (הן data URL של מאות קילובייט) אלא ככתובת
// /api/site-avatar/<siteId> — כך התשובה קטנה, והתמונות נטענות במקביל ונשמרות
// במטמון הדפדפן במקום להיטען מחדש בכל ניווט.
// ============================================================
import { json } from '@sveltejs/kit';
import { getPublicSiteAdmins } from '$lib/server/siteAdmins';
import { gravatarUrl } from '$lib/server/gravatar';
import { displayAvatarUrl } from '$lib/server/avatarProxy';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ setHeaders }) => {
	let payload: Awaited<ReturnType<typeof getPublicSiteAdmins>>;
	try {
		payload = await getPublicSiteAdmins();
	} catch (e) {
		console.error('public site-admins load failed:', e);
		return json({ error: 'שגיאה בטעינת אדמיני הרשת' }, { status: 502 });
	}

	const admins = Object.fromEntries(
		Object.entries(payload.admins).map(([siteId, a]) => [
			siteId,
			{
				name: a.adminName ?? '',
				role: a.role ?? '',
				email: a.adminEmail ?? '',
				phone: a.phone ?? '',
				// התמונה האפקטיבית: מפורשת אם הוגדרה (ככתובת, לא כ-data URL), אחרת נגזרת מהאימייל
				avatar: displayAvatarUrl(siteId, a.avatarUrl) || (a.adminEmail ? gravatarUrl(a.adminEmail) : '')
			}
		])
	);

	setHeaders({ 'cache-control': 'public, max-age=60' });
	return json({ admins, order: payload.order });
};
