// ============================================================
// תמונות האדמינים — הגשה ככתובת תמונה במקום data URL בתוך הדף.
//
// למה: התמונות נשמרות ב-Strapi כ-data URL (base64) בתוך רשומת האדמין. כשהן
// נשלחות בגוף הדף/ה-JSON, כל טעינה של הפאנל או של כרטיסיית "ניהול הרשת" גוררת
// מאות קילובייט חוסמים — הדפדפן לא מציג כלום עד שהכול הגיע, ואין שום מטמון
// (data URL לא נשמר במטמון הדפדפן, ולכן משלמים את המחיר בכל ניווט מחדש).
//
// הפתרון: הדף מקבל כתובת קצרה — /api/site-avatar/<siteId>?v=<חתימה> — והתמונה
// עצמה נטענת במקביל, אחרי שהדף כבר על המסך, ונשמרת במטמון הדפדפן לצמיתות.
// ה-?v= הוא חתימה של התמונה עצמה, כך שתמונה חדשה = כתובת חדשה = בלי תמונה תקועה.
// ============================================================
import { createHash } from 'crypto';

/** האם הערך הוא תמונה מוטמעת (data URL) ולא קישור רגיל (Gravatar / http) */
export function isDataImage(url: string | undefined | null): boolean {
	return /^data:image\//i.test((url ?? '').trim());
}

/** חתימה קצרה של התמונה — מזהה גרסה בכתובת הפרוקסי */
export function avatarVersion(dataUrl: string): string {
	return createHash('sha1').update(dataUrl).digest('hex').slice(0, 12);
}

/**
 * הכתובת להצגה: תמונה מוטמעת → דרך הפרוקסי; קישור רגיל → כמו שהוא.
 * מחזיר מחרוזת ריקה כשאין תמונה כלל.
 */
export function displayAvatarUrl(siteId: string, url: string | undefined | null): string {
	const v = (url ?? '').trim();
	if (!v) return '';
	if (!isDataImage(v)) return v;
	return `/api/site-avatar/${encodeURIComponent(siteId)}?v=${avatarVersion(v)}`;
}

/** מפרק data URL לבייטים + סוג תוכן (null אם אינו data URL תקין) */
export function decodeDataImage(dataUrl: string): { bytes: Buffer; type: string } | null {
	const m = /^data:(image\/[a-z.+-]+);base64,(.+)$/is.exec(dataUrl.trim());
	if (!m) return null;
	try {
		return { type: m[1].toLowerCase(), bytes: Buffer.from(m[2], 'base64') };
	} catch {
		return null;
	}
}
