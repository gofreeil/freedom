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
// בשמירה מהפאנל עצמו — ושם מרוקנים את המטמון. בלעדיו כל פתיחה של הפאנל המתינה
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
// תצוגה ציבורית — רשימת צוות הרכזים בדף /about.
// נקודת קצה פתוחה (GET /api/site-admins/public) שמחזירה רק שדות תצוגה
// ויצירת קשר. את המפה המלאה (כולל communityId ונתוני ביקורת) אפשר לקרוא
// רק עם JWT של סופר-אדמין, דרך getSiteAdmins.
// ============================================================

export const DEFAULT_SITE_AVATARS: Record<string, string> = {
	state_auditor: '/images/admins/state_auditor.jpg',
	courts_reconciliation: '/images/admins/courts_reconciliation.jpg'
};

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
		const admins = json.data && typeof json.data === 'object' ? json.data : {};
		// שמירה על תמונות ברירת מחדל לאתרים עם תמונות קבועות
		for (const [siteId, fallbackUrl] of Object.entries(DEFAULT_SITE_AVATARS)) {
			if (admins[siteId] && !admins[siteId].avatarUrl) {
				admins[siteId].avatarUrl = fallbackUrl;
			}
		}
		const data: PublicSiteAdminsPayload = {
			admins,
			order: Array.isArray(json.order) ? json.order : []
		};
		cache = { at: Date.now(), data };
		return data;
	} catch (e) {
		// מטמון ישן עדיף על רשימה ריקה
		if (cache) return cache.data;
		throw e;
	}
}

/**
 * תפקיד אדמין של אתר ברשת (idx_admin, ch_admin, avd_admin...) — כל *_admin חוץ
 * מ-neighborhood_admin (רכזי שכונות: אוכלוסייה גדולה עם מסלול משלהם, הצבעה
 * בתקציב לפי coordinator_of) ומ-super_admin (נבדק בנפרד). חייב להישאר זהה ל-
 * isSiteAdminUser בבאקאנד (extensions/users-permissions/strapi-server.ts) —
 * שם נאכפת הגישה ללוח הצוות.
 */
export function isSiteAdminRole(role: string | null | undefined): boolean {
	const r = String(role ?? '').trim();
	if (!r || r === 'neighborhood_admin' || r === 'super_admin') return false;
	return /^[a-z0-9]+(?:_[a-z0-9]+)*_admin$/.test(r);
}

// מטמון קצר: הבדיקה רצה בכל טעינת דף של משתמש מחובר, ותפקיד משתנה לעיתים רחוקות
const ROLE_TTL_MS = 5 * 60_000;
const ROLE_MAX_ENTRIES = 500;
const roleCache = new Map<string, { at: number; value: boolean }>();

/** האם משתמש ה-Strapi המשותף של האימייל הוא אדמין של אתר ברשת (לפי app_role). תקלה = לא. */
async function hasSiteAdminRole(email: string): Promise<boolean> {
	const hit = roleCache.get(email);
	if (hit && Date.now() - hit.at < ROLE_TTL_MS) return hit.value;
	try {
		const q = new URLSearchParams({
			'filters[email][$eqi]': email,
			'fields[0]': 'app_role',
			'fields[1]': 'blocked',
			'pagination[limit]': '1'
		});
		const res = await fetch(`${STRAPI_URL}/api/users?${q}`, {
			headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN ?? ''}` },
			signal: AbortSignal.timeout(8_000)
		});
		if (!res.ok) return false; // תקלה לא נשמרת במטמון
		const rows = (await res.json()) as Array<{ app_role?: string | null; blocked?: boolean | null }>;
		const u = Array.isArray(rows) ? rows[0] : null;
		const value = !!u && !u.blocked && isSiteAdminRole(u.app_role);
		if (roleCache.size >= ROLE_MAX_ENTRIES) roleCache.clear();
		roleCache.set(email, { at: Date.now(), value });
		return value;
	} catch {
		return false;
	}
}

/** נירמול טלפון ישראלי להשוואה (למשל 0549081004 או 972549081004 או 054-908-1004) */
export function normalizePhone(p: string | null | undefined): string {
	if (!p) return '';
	const digits = p.replace(/\D/g, '');
	if (digits.startsWith('972') && digits.length >= 11) return '0' + digits.slice(3);
	return digits;
}

/**
 * האם האימייל שייך לאדמין של אחד מאתרי הרשת: מונה במפת האדמינים ב-Strapi (דרך
 * המטמון הציבורי, לפי אימייל או טלפון), או שתפקידו ב-Strapi המשותף הוא אדמין של אתר (idx_admin וכו') —
 * מי שאדמין באתר אחד ברשת הוא חבר צוות הרשת גם באתר הראשי, בלי מינוי ידני נוסף.
 * משמש להצגת כפתור "ניהול הרשת", ללוח המשימות ולהצבעה. תקלה = לא אדמין.
 */
export async function isNetworkAdmin(
	email: string | null | undefined,
	phone?: string | null | undefined
): Promise<boolean> {
	const e = email?.trim().toLowerCase();
	const userDigits = normalizePhone(
		phone || (e?.endsWith('@phone.gofreeil.com') ? e.split('@')[0] : '')
	);
	if (!e && !userDigits) return false;
	try {
		const { admins } = await getPublicSiteAdmins();
		const matchedInMap = Object.values(admins).some((a) => {
			if (e && a.adminEmail?.trim().toLowerCase() === e) return true;
			const aDigits = normalizePhone(a.phone);
			if (userDigits && aDigits && aDigits === userDigits) return true;
			return false;
		});
		if (matchedInMap) return true;
	} catch {
		/* בלי המפה ממשיכים לבדיקת התפקיד */
	}
	if (e) return hasSiteAdminRole(e);
	return false;
}
