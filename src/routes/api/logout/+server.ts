import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * ניתוק אמיתי. signOut של Auth.js מוחק רק את עוגיית הסשן המקומית — העוגייה
 * המשותפת gofreeil-auth (httpOnly, על .gofreeil.com) נשארת, ואיתה אתרי-אח
 * ממשיכים לזהות את המשתמש אוטומטית (ובלחיצת SSO אחת הוא חוזר גם כאן) — מסוכן
 * במיוחד במחשב משותף. הקליינט קורא לכאן לפני signOut. אותו דפוס כמו באתר הקהילה.
 */
export const POST: RequestHandler = async ({ cookies }) => {
	// העוגייה נכתבת עם domain בפרודקשן — המחיקה חייבת domain זהה.
	// מוחקים גם וריאנט host-only ליתר ביטחון (dev / עוגיות ישנות).
	cookies.delete('gofreeil-auth', { path: '/', domain: '.gofreeil.com' });
	cookies.delete('gofreeil-auth', { path: '/' });
	return json({ ok: true });
};
