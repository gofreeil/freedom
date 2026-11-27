// ============================================================
// GET /api/network-admins — אדמיני אתרי הרשת לתצוגה ציבורית.
//
// למה נקודת קצה ולא load של הדף: רשימת הרכזים ב-/about מושכת אותה
// רק כשפותחים אותה, כך שדף האודות עצמו נשאר קל.
//
// התמונות עצמן לא נשלחות כאן (הן data URL של מאות קילובייט) אלא ככתובת
// /api/site-avatar/<siteId> — כך התשובה קטנה, והתמונות נטענות במקביל ונשמרות
// במטמון הדפדפן במקום להיטען מחדש בכל ניווט.
// ============================================================
import { json } from '@sveltejs/kit';
import { getPublicSiteAdmins, DEFAULT_SITE_AVATARS } from '$lib/server/siteAdmins';
import { displayAvatarUrl } from '$lib/server/avatarProxy';
import { SITES, type FreedomSite } from '$lib/sitesData';
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
		Object.entries(payload.admins)
			.filter(([, a]) => a.adminName?.trim() || a.adminEmail?.trim() || a.phone?.trim())
			.map(([siteId, a]) => [
			siteId,
			{
				name: a.adminName ?? '',
				role: a.role ?? '',
				email: a.adminEmail ?? '',
				phone: a.phone ?? '',
				// התמונה האפקטיבית: מפורשת אם הוגדרה (ככתובת, לא כ-data URL), אחרת תמונת ברירת מחדל
				avatar:
					a.avatarUrl && !a.avatarUrl.includes('googleusercontent')
						? displayAvatarUrl(siteId, a.avatarUrl)
						: DEFAULT_SITE_AVATARS[siteId] || ''
			}
		])
	);

	const knownIds = new Set(SITES.map((s) => s.id));
	const customSites: FreedomSite[] = [];
	for (const [siteId, a] of Object.entries(payload.admins)) {
		if (knownIds.has(siteId) || !a) continue;
		const meta = a.siteMeta;
		customSites.push({
			id: siteId,
			name: meta?.name?.trim() || a.role?.trim() || siteId,
			description: meta?.description?.trim() || '',
			url: meta?.url?.trim() || '',
			image: meta?.image?.trim() || undefined,
			category: meta?.category || 'קהילה'
		});
	}

	setHeaders({ 'cache-control': 'public, max-age=60' });
	return json({ admins, order: payload.order, customSites });
};
