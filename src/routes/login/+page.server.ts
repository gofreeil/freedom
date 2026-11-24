import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { oauthEnabled } from '../../auth';
import { getStrapiMe, bestStrapiName, friendlyName } from '$lib/server/strapiAuth';
import { isSuperAdmin } from '$lib/server/superAdmin';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	const session = await locals.auth();
	// ברירת מחדל אחרי התחברות: האזור האישי (/profile) — שם סופר-אדמין מנותב אוטומטית ל"ניהול הרשת" (/admin)
	const redirectTo = url.searchParams.get('redirect') ?? '/profile';
	if (session?.user) throw redirect(302, redirectTo);

	// זיהוי מראש דרך העוגייה המשותפת gofreeil-auth (.gofreeil.com): מי שכבר מחובר
	// באתר אחר של יוצאים לחירות רואה "המשך כ-<שם>" בלחיצה אחת. עוגייה מתה או
	// חסרה → null, וכפתור ה-SSO מוצג כאפשרות משנית בלבד (לא כהבטחה שתיכשל).
	let ssoName: string | null = null;
	let isSuperAdminUser = false;
	const sharedJwt = cookies.get('gofreeil-auth');
	if (sharedJwt) {
		try {
			const me = await getStrapiMe(sharedJwt);
			if (me?.email) {
				ssoName = friendlyName(bestStrapiName(me), me.email) || 'חבר הקהילה';
				if (isSuperAdmin(me.email)) {
					isSuperAdminUser = true;
				}
			}
		} catch {
			/* Strapi לא זמין — מציגים את הדף הרגיל */
		}
	}

	const simActive = cookies.get('role_sim_active') === '1';
	const showSuperRoleSelect = isSuperAdminUser || simActive || url.searchParams.get('super') === '1';

	// האתר שממנו הגיעו דרך גשר ה-SSO (/sso) - רק תחת gofreeil.com, לתצוגה בלבד
	const rawVia = (url.searchParams.get('via') ?? '').trim().toLowerCase();
	const via =
		rawVia === 'gofreeil.com' || (rawVia.endsWith('.gofreeil.com') && /^[a-z0-9.-]+$/.test(rawVia))
			? rawVia
			: null;

	// כפתור Google/Facebook מוצג רק אם הספק באמת מוגדר (מפתחות ב-env)
	return { redirectTo, error: url.searchParams.get('error') ?? null, oauth: oauthEnabled, ssoName, via, showSuperRoleSelect };
};
