import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStrapiMe, getOrCreateStrapiJwt } from '$lib/server/strapiAuth';

/**
 * גשר SSO לכל אתרי gofreeil.com — אותו חוזה כמו /sso באתר הקהילה.
 * אתר-אח מפנה לכאן עם ?callback=<url> כשאין לו עוגייה משותפת (למשל מיד אחרי
 * התנתקות שמחקה אותה), בתקווה שהמשתמש עדיין מחובר כאן באתר הראשי.
 *
 * - מחובר כאן → קובעים את העוגייה המשותפת `gofreeil-auth` על `.gofreeil.com`
 *   (רק טוקן שאומת חי מול Strapi; פג → מנפיקים חדש) וחוזרים ל-callback.
 * - לא מחובר / אין טוקן חי → חוזרים ל-callback עם ?error=not_registered.
 *
 * ה-callback חייב להיות https תחת gofreeil.com (הגנה מ-open-redirect).
 */

const SHARED_COOKIE = 'gofreeil-auth';
const AUTH_SECRET = process.env.AUTH_SECRET ?? '';

function isAllowedCallback(raw: string | null): URL | null {
	if (!raw) return null;
	let u: URL;
	try {
		u = new URL(raw);
	} catch {
		return null;
	}
	if (u.protocol !== 'https:') return null;
	if (u.hostname !== 'gofreeil.com' && !u.hostname.endsWith('.gofreeil.com')) return null;
	return u;
}

export const GET: RequestHandler = async ({ locals, url, cookies }) => {
	const callback = isAllowedCallback(url.searchParams.get('callback'));
	if (!callback) throw error(400, 'callback לא חוקי — חייב להיות כתובת תחת gofreeil.com');

	let session: Awaited<ReturnType<typeof locals.auth>> = null;
	try {
		session = await locals.auth();
	} catch {
		session = null;
	}
	const user = session?.user as
		| { strapiJwt?: string; email?: string | null; id?: string | null }
		| undefined;

	// 1. הטוקן שבסשן — רק אם עדיין חי מול Strapi (סשן חי שנה, הטוקן פג קודם)
	let jwt: string | undefined = user?.strapiJwt;
	if (jwt) {
		try {
			const me = await getStrapiMe(jwt);
			if (!me) jwt = undefined;
		} catch {
			jwt = undefined;
		}
	}

	// 2. חסר או פג → מנפיקים חדש לפי הזהות שבסשן (seed → register → backend)
	if (!jwt && user?.email) {
		const stableId = user.id || `credentials_${user.email.trim().toLowerCase()}`;
		try {
			jwt = (await getOrCreateStrapiJwt(user.email, stableId, AUTH_SECRET)) ?? undefined;
		} catch {
			jwt = undefined;
		}
	}

	if (jwt) {
		cookies.set(SHARED_COOKIE, jwt, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			domain: '.gofreeil.com',
			maxAge: 60 * 60 * 24 * 90, // 90 ימים
		});
		throw redirect(302, callback.toString());
	}

	callback.searchParams.set('error', 'not_registered');
	throw redirect(302, callback.toString());
};
