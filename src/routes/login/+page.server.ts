import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { oauthEnabled } from '../../auth';
import { getStrapiMe, bestStrapiName, friendlyName } from '$lib/server/strapiAuth';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	const session = await locals.auth();
	// ברירת מחדל אחרי התחברות: האזור האישי (/profile) — שם סופר-אדמין מנותב אוטומטית ל-/admin
	const redirectTo = url.searchParams.get('redirect') ?? '/profile';
	if (session?.user) throw redirect(302, redirectTo);

	// זיהוי מראש דרך העוגייה המשותפת gofreeil-auth (.gofreeil.com): מי שכבר מחובר
	// באתר אחר של יוצאים לחירות רואה "המשך כ-<שם>" בלחיצה אחת. עוגייה מתה או
	// חסרה → null, וכפתור ה-SSO מוצג כאפשרות משנית בלבד (לא כהבטחה שתיכשל).
	let ssoName: string | null = null;
	const sharedJwt = cookies.get('gofreeil-auth');
	if (sharedJwt) {
		try {
			const me = await getStrapiMe(sharedJwt);
			if (me?.email) ssoName = friendlyName(bestStrapiName(me), me.email) || 'חבר הקהילה';
		} catch {
			/* Strapi לא זמין — מציגים את הדף הרגיל */
		}
	}

	// האתר שממנו הגיעו דרך גשר ה-SSO (/sso) - רק תחת gofreeil.com, לתצוגה בלבד
	const rawVia = (url.searchParams.get('via') ?? '').trim().toLowerCase();
	const via =
		rawVia === 'gofreeil.com' || (rawVia.endsWith('.gofreeil.com') && /^[a-z0-9.-]+$/.test(rawVia))
			? rawVia
			: null;

	// כפתור Google/Facebook מוצג רק אם הספק באמת מוגדר (מפתחות ב-env)
	return { redirectTo, error: url.searchParams.get('error') ?? null, oauth: oauthEnabled, ssoName, via };
};
