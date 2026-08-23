// ============================================================
// GET /api/network-admins — אדמיני אתרי הרשת לתצוגה ציבורית.
//
// למה נקודת קצה ולא load של הדף: התמונות נשמרות כ-data URL בתוך הרשומה,
// והמטען כבד. הכרטיסייה "ניהול הרשת" ב-/about מושכת אותו רק כשפותחים אותה,
// כך שדף האודות עצמו נשאר קל.
// ============================================================
import { json } from '@sveltejs/kit';
import { getPublicSiteAdmins } from '$lib/server/siteAdmins';
import { gravatarUrl } from '$lib/server/gravatar';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ setHeaders }) => {
	let map: Awaited<ReturnType<typeof getPublicSiteAdmins>>;
	try {
		map = await getPublicSiteAdmins();
	} catch (e) {
		console.error('public site-admins load failed:', e);
		return json({ error: 'שגיאה בטעינת אדמיני הרשת' }, { status: 502 });
	}

	const admins = Object.fromEntries(
		Object.entries(map).map(([siteId, a]) => [
			siteId,
			{
				name: a.adminName ?? '',
				role: a.role ?? '',
				email: a.adminEmail ?? '',
				phone: a.phone ?? '',
				// התמונה האפקטיבית: מפורשת אם הוגדרה, אחרת נגזרת מהאימייל
				avatar: a.avatarUrl?.trim() || (a.adminEmail ? gravatarUrl(a.adminEmail) : '')
			}
		])
	);

	setHeaders({ 'cache-control': 'public, max-age=60' });
	return json({ admins });
};
