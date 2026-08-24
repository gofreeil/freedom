// ============================================================
// אחסון מינויי האדמינים לאתרי הרשת — ב-Strapi המשותף (api.gofreeil.com).
//
// למה לא קובץ מקומי: האתר רץ על Vercel שבו מערכת הקבצים לקריאה בלבד —
// כתיבה לקובץ נכשלת (500). הנתונים נשמרים ב-core_store של Strapi דרך
// נקודות הקצה GET/PUT /api/site-admins (סופר-אדמין בלבד, לפי ה-JWT).
//
// המבנה בשרת: { [siteId]: SiteAdmin }
// ============================================================

import { STRAPI_URL } from './strapiAuth';

export interface SiteAdmin {
	/** אימייל האדמין שמונה לאתר (זהות אחידה מול ה-Strapi המשותף) */
	adminEmail: string;
	/** שם תצוגה */
	adminName: string;
	/** תפקיד / הערה חופשית (למשל "רכז ראשי", "ממלא מקום") */
	role?: string;
	/** טלפון (לכפתור וואטסאפ) */
	phone?: string;
	/** מזהה המשתמש בקהילה בשכונה (id מספרי או external_id) — לכפתור הצ'אט */
	communityId?: string;
	/** קישור לתמונת אווטאר מפורשת או data URL מהקרופר; אם ריק — נגזר מהאימייל (Gravatar) */
	avatarUrl?: string;
	/** מתי מונה (ISO) */
	updatedAt: string;
	/** מי מינה (אימייל הסופר-אדמין) */
	updatedBy: string;
}

export type SiteAdminsMap = Record<string, SiteAdmin>;

function authHeaders(jwt: string): Record<string, string> {
	return { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' };
}

// מטמון קצר גם למפה המלאה (הפאנל): הנתונים זהים לכל סופר-אדמין ומשתנים רק
// בשמירה מהפאנל עצמו — ושם מרוקנים את המטמון. בלעדיו כל פתיחה של /admin המתינה
// לסיבוב שלם מול ה-Strapi (חצי שנייה עד שתיים), וזה כל זמן ההמתנה של הדף.
const FULL_CACHE_TTL_MS = 60_000;
let fullCache: { at: number; data: { admins: SiteAdminsMap; order: string[] } } | null = null;

/** מרוקן את שני המטמונים (הפאנל והתצוגה הציבורית) — נקרא אחרי כל כתיבה */
function invalidateCaches(): void {
	fullCache = null;
	cache = null;
}

/** קריאת כל המינויים + סדר ההצגה (זורק בשגיאת שרת/הרשאה) */
export async function getSiteAdmins(
	jwt: string
): Promise<{ admins: SiteAdminsMap; order: string[] }> {
	if (fullCache && Date.now() - fullCache.at < FULL_CACHE_TTL_MS) return fullCache.data;
	const res = await fetch(`${STRAPI_URL}/api/site-admins`, {
		headers: authHeaders(jwt),
		signal: AbortSignal.timeout(10_000)
	});
	if (!res.ok) throw new Error(`site-admins GET failed: ${res.status}`);
	const json = (await res.json()) as { data?: SiteAdminsMap; order?: string[] };
	const data = {
		admins: json.data && typeof json.data === 'object' ? json.data : {},
		order: Array.isArray(json.order) ? json.order : []
	};
	fullCache = { at: Date.now(), data };
	return data;
}

/**
 * שמירת סדר הצגת האתרים (מערך של siteId).
 * בשרת ולא בדפדפן — כדי שהסידור יהיה זהה בכל מכשיר ולכל המבקרים.
 */
export async function setSiteAdminsOrder(jwt: string, order: string[]): Promise<void> {
	const res = await fetch(`${STRAPI_URL}/api/site-admins`, {
		method: 'PUT',
		headers: authHeaders(jwt),
		body: JSON.stringify({ order })
	});
	if (!res.ok) throw new Error(`site-admins order PUT failed: ${res.status}`);
	invalidateCaches(); // הסדר החדש צריך להופיע מיד בפאנל וגם בתצוגה הציבורית
}

/** עדכון מינוי לאתר בודד (admin=null מוחק) */
async function putSiteAdmin(jwt: string, siteId: string, admin: SiteAdmin | null): Promise<void> {
	const res = await fetch(`${STRAPI_URL}/api/site-admins`, {
		method: 'PUT',
		headers: authHeaders(jwt),
		body: JSON.stringify({ siteId, admin })
	});
	if (!res.ok) throw new Error(`site-admins PUT failed: ${res.status}`);
	invalidateCaches();
}

/** מינוי/עדכון אדמין לאתר */
export async function setSiteAdmin(jwt: string, siteId: string, admin: SiteAdmin): Promise<void> {
	await putSiteAdmin(jwt, siteId, admin);
}

/** ביטול מינוי אדמין לאתר */
export async function removeSiteAdmin(jwt: string, siteId: string): Promise<void> {
	await putSiteAdmin(jwt, siteId, null);
}

// ============================================================
// תצוגה ציבורית — כרטיסיית "ניהול הרשת" בדף /about.
// נקודת קצה פתוחה (GET /api/site-admins/public) שמחזירה רק שדות תצוגה
// ויצירת קשר. את המפה המלאה (כולל communityId ונתוני ביקורת) אפשר לקרוא
// רק עם JWT של סופר-אדמין, דרך getSiteAdmins.
// ============================================================

export interface PublicSiteAdmin {
	adminName: string;
	role?: string;
	adminEmail?: string;
	phone?: string;
	avatarUrl?: string;
}

export type PublicSiteAdminsMap = Record<string, PublicSiteAdmin>;

interface PublicSiteAdminsPayload {
	admins: PublicSiteAdminsMap;
	/** סדר ההצגה שקבע הסופר-אדמין (מערך siteId); ריק = הסדר של sitesData */
	order: string[];
}

// מטמון קצר בזיכרון השרת: הדף פתוח לכולם והנתונים משתנים לעיתים רחוקות —
// אין טעם לפנות ל-Strapi בכל טעינה. גם משמש כרשת ביטחון אם Strapi נופל רגעית.
const CACHE_TTL_MS = 60_000;
let cache: { at: number; data: PublicSiteAdminsPayload } | null = null;

/** קריאת המינויים לתצוגה ציבורית (ממוטמן ל-60 שניות). זורק רק אם אין גם מטמון. */
export async function getPublicSiteAdmins(): Promise<PublicSiteAdminsPayload> {
	if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;
	try {
		const res = await fetch(`${STRAPI_URL}/api/site-admins/public`, {
			signal: AbortSignal.timeout(10_000)
		});
		if (!res.ok) throw new Error(`site-admins public GET failed: ${res.status}`);
		const json = (await res.json()) as { data?: PublicSiteAdminsMap; order?: string[] };
		const data: PublicSiteAdminsPayload = {
			admins: json.data && typeof json.data === 'object' ? json.data : {},
			order: Array.isArray(json.order) ? json.order : []
		};
		cache = { at: Date.now(), data };
		return data;
	} catch (e) {
		// מטמון ישן עדיף על כרטיסייה ריקה
		if (cache) return cache.data;
		throw e;
	}
}
