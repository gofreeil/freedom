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

/** קריאת כל המינויים (זורק בשגיאת שרת/הרשאה) */
export async function getSiteAdmins(jwt: string): Promise<SiteAdminsMap> {
	const res = await fetch(`${STRAPI_URL}/api/site-admins`, { headers: authHeaders(jwt) });
	if (!res.ok) throw new Error(`site-admins GET failed: ${res.status}`);
	const json = (await res.json()) as { data?: SiteAdminsMap };
	return json.data && typeof json.data === 'object' ? json.data : {};
}

/** עדכון מינוי לאתר בודד (admin=null מוחק) */
async function putSiteAdmin(jwt: string, siteId: string, admin: SiteAdmin | null): Promise<void> {
	const res = await fetch(`${STRAPI_URL}/api/site-admins`, {
		method: 'PUT',
		headers: authHeaders(jwt),
		body: JSON.stringify({ siteId, admin })
	});
	if (!res.ok) throw new Error(`site-admins PUT failed: ${res.status}`);
}

/** מינוי/עדכון אדמין לאתר */
export async function setSiteAdmin(jwt: string, siteId: string, admin: SiteAdmin): Promise<void> {
	await putSiteAdmin(jwt, siteId, admin);
}

/** ביטול מינוי אדמין לאתר */
export async function removeSiteAdmin(jwt: string, siteId: string): Promise<void> {
	await putSiteAdmin(jwt, siteId, null);
}
