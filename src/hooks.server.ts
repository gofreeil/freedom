import { handle as authHandle } from './auth';
import type { Handle } from '@sveltejs/kit';

/**
 * עוטפים את ה-handle של Auth.js ב-try/catch: אם ה-JWT בעוגייה לא תקין
 * (למשל AUTH_SECRET שונה) @auth/sveltekit עלול לזרוק ולהפיל את כל הדפים.
 * הפתרון: אם זרק — ממשיכים כמשתמש אנונימי.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// melecshop.com — הדומיין הישן של התנועה, מחובר כדומיין נוסף לפרויקט הזה ב-Vercel.
	// 301 קבוע מעביר לגוגל את הוותק והקישורים שנצברו שם אל gofreeil.com.
	// לדפי החנות הישנים אין מקבילה באתר החדש, ולכן כל נתיב מופנה לדף הבית.
	if (event.url.hostname.endsWith('melecshop.com')) {
		return new Response(null, {
			status: 301,
			headers: { location: 'https://gofreeil.com/' },
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
