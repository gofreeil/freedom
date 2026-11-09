import { handle as authHandle } from './auth';
import { jwtExpSeconds } from '$lib/server/strapiAuth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

// נתיבי סריקה של בוטים — לאתר SvelteKit אין אף קובץ כזה (מפעילים כאן רק אחרי בדיקת melecshop,
// כי לדומיין הישן היו כתובות .php אמיתיות שגוגל זוכר, והן צריכות לקבל 301 ולא 404).
const JUNK_PATH =
	/\.(?:php\d*|aspx?|jsp|cgi)$|^\/(?:wp-[^/]*|wordpress|phpmyadmin|cgi-bin|\.env[^/]*|\.git|\.aws|\.ssh)(?:\/|$)/i;

// עוגיית הסשן של Auth.js (גם בגרסה המאובטחת __Secure-, וגם כשהיא מפוצלת ל-.0/.1)
const SESSION_COOKIE = /(?:^|;\s*)[^=;\s]*session-token[^=;]*=/;

/**
 * מבקר בלי עוגיית סשן הוא אנונימי בהכרח, ו-Auth.js היה מחזיר לו null בכל מקרה — אבל רק אחרי
 * שבנה את כל ההגדרות מחדש. הקריאה ל-auth() רצה כאן ב-hook ושוב ב-layout, כלומר פעמיים בכל בקשה,
 * ורוב הבקשות (בוטים וזרים) אנונימיות. מקצרים: בלי עוגייה — null מיד, בלי לגעת ב-Auth.js.
 */
const skipAuthWhenAnonymous: Handle = async ({ event, resolve }) => {
	if (!SESSION_COOKIE.test(event.request.headers.get('cookie') ?? '')) {
		event.locals.auth = async () => null;
	}
	return resolve(event);
};

/**
 * עוטפים את ה-handle של Auth.js ב-try/catch: אם ה-JWT בעוגייה לא תקין
 * (למשל AUTH_SECRET שונה) @auth/sveltekit עלול לזרוק ולהפיל את כל הדפים.
 * הפתרון: אם זרק — ממשיכים כמשתמש אנונימי.
 */
const authWrapped: Handle = async ({ event, resolve }) => {
	// melecshop.com — הדומיין הישן של התנועה, מחובר כדומיין נוסף לפרויקט הזה ב-Vercel.
	// 301 קבוע מעביר לגוגל את הוותק והקישורים שנצברו שם אל gofreeil.com.
	// לדפי החנות הישנים אין מקבילה באתר החדש, ולכן כל נתיב מופנה לדף הבית.
	if (event.url.hostname.endsWith('melecshop.com')) {
		return new Response(null, {
			status: 301,
			headers: { location: 'https://gofreeil.com/' },
		});
	}
	// בוטים סורקים נתיבים של וורדפרס/PHP/קבצי סודות שלא קיימים באתר. בלי זה כל בדיקה
	// כזו מרנדרת את דף ה-404 המלא (כולל ה-layout) ועולה זמן CPU; כאן עונים בשורה אחת,
	// ו-s-maxage נותן ל-CDN של Vercel לזכור את התשובה, כך שחזרה על אותו נתיב לא מגיעה לפונקציה.
	if (event.request.method === 'GET' && JUNK_PATH.test(event.url.pathname)) {
		return new Response('Not found', {
			status: 404,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'public, s-maxage=86400',
			},
		});
	}
	try {
		return await authHandle({ event, resolve });
	} catch (err) {
		console.warn('[hooks] auth handle threw - continuing anonymously:', err);
		if (!event.locals.auth) {
			event.locals.auth = async () => null;
		}
		return await resolve(event);
	}
};

/**
 * העוגייה המשותפת לכל אתרי gofreeil.com: זיהוי מאוחד מול רשימת המשתמשים האחת
 * ב-Strapi המשותף. כל אתר תחת .gofreeil.com קורא אותה ומזהה את המשתמש ישירות —
 * בלי redirect ובלי הקלדת פרטים. עד עכשיו האתר הראשי רק *קרא* אותה (הספק
 * gofreeil-sso) אבל אף פעם לא *כתב* אותה — מי שהתחבר כאן נשאר בלתי-מזוהה בשאר
 * הרשת. אותו hook כמו באתר הקהילה: כל בקשה עם סשן חי מרעננת את העוגייה.
 *
 * רענון ולא רק יצירה: משווים את ערך העוגייה לטוקן שבסשן ומעדכנים בכל אי-התאמה,
 * כך שטוקן שהתרענן בסשן (jwt callback) מוחלף גם בעוגייה ולא נשאר שם מת.
 */
const setSharedSsoCookie: Handle = async ({ event, resolve }) => {
	const isProd = process.env.NODE_ENV === 'production';
	try {
		const session = await event.locals.auth();
		const jwt = (session?.user as { strapiJwt?: string } | undefined)?.strapiJwt;
		// שותלים רק טוקן חי: כשהרענון בסשן נכשל (backend מושבת/קירור) הסשן עדיין
		// נושא טוקן פג — כתיבה שלו הייתה דורסת עוגייה טרייה שאתר-אח שתל, ושוברת
		// את הזיהוי בכל הרשת עד הביקור הבא שם. פג/לא-ניתן-לפענוח → מדלגים בשקט.
		const exp = jwtExpSeconds(jwt);
		const alive = exp !== null && exp * 1000 > Date.now();
		if (isProd && jwt && alive && event.cookies.get('gofreeil-auth') !== jwt) {
			event.cookies.set('gofreeil-auth', jwt, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/',
				domain: '.gofreeil.com',
				maxAge: 60 * 60 * 24 * 90, // 90 ימים
			});
		}
	} catch { /* ignore - session unavailable */ }
	return resolve(event);
};

export const handle: Handle = sequence(authWrapped, skipAuthWhenAnonymous, setSharedSsoCookie);
