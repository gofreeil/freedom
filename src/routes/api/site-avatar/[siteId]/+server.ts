// ============================================================
// GET /api/site-avatar/<siteId>?v=<חתימה> — תמונת האחראי על אתר ברשת.
//
// התמונה שמורה ב-Strapi כ-data URL; כאן היא מוגשת כקובץ תמונה רגיל, כדי שהדף
// עצמו יישאר קל והתמונה תיטען במקביל ותישמר במטמון הדפדפן. ראו avatarProxy.ts.
// ============================================================
import { error } from '@sveltejs/kit';
import { getPublicSiteAdmins } from '$lib/server/siteAdmins';
import { avatarVersion, decodeDataImage, isDataImage } from '$lib/server/avatarProxy';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, request }) => {
	let admins: Awaited<ReturnType<typeof getPublicSiteAdmins>>['admins'];
	try {
		({ admins } = await getPublicSiteAdmins());
	} catch {
		throw error(502, 'שגיאה בטעינת תמונת האחראי');
	}

	const raw = (admins[params.siteId]?.avatarUrl ?? '').trim();
	if (!raw) throw error(404, 'אין תמונה');
	// קישור חיצוני (Gravatar וכו') — מפנים אליו במקום להגיש אותו
	if (!isDataImage(raw)) return new Response(null, { status: 302, headers: { location: raw } });

	const decoded = decodeDataImage(raw);
	if (!decoded) throw error(404, 'אין תמונה');

	const version = avatarVersion(raw);
	const etag = `"${version}"`;
	if (request.headers.get('if-none-match') === etag) {
		return new Response(null, { status: 304, headers: { etag } });
	}

	// הכתובת נושאת את חתימת התמונה — לכן כשהיא תואמת אפשר לשמור אותה לנצח;
	// כתובת עם חתימה ישנה מקבלת מטמון קצר בלבד (התמונה כבר התחלפה).
	const exact = url.searchParams.get('v') === version;
	return new Response(new Uint8Array(decoded.bytes), {
		headers: {
			'content-type': decoded.type,
			etag,
			'cache-control': exact
				? 'public, max-age=31536000, immutable'
				: 'public, max-age=60, stale-while-revalidate=86400'
		}
	});
};
