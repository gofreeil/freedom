// ============================================================
// budgetAccess.ts — מי רשאי להיכנס לדף "ניהול תקציב" (/budget) ולהצביע בו:
// סופר-אדמין, אדמין של אתר ברשת, וכל רכז שכונה בקהילה בשכונה
// (app_role = neighborhood_admin או coordinator_of לא ריק ב-Strapi המשותף).
// ============================================================
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import { findUserByEmail } from '$lib/server/coordinatorMessage';

// מטמון בזיכרון: הבדיקה רצה ב-layout לכל משתמש מחובר שאינו אדמין, ואין טעם
// לפנות ל-Strapi בכל טעינת דף. תפקיד רכז משתנה לעיתים רחוקות.
const TTL_MS = 10 * 60_000;
const MAX_ENTRIES = 500;
const coordinatorCache = new Map<string, { at: number; value: boolean }>();

/** האם האימייל שייך לרכז שכונה. תקלה מול Strapi = לא רכז (ולא נשמר במטמון). */
export async function isNeighborhoodCoordinator(email: string | null | undefined): Promise<boolean> {
	const e = email?.trim().toLowerCase();
	if (!e) return false;
	const hit = coordinatorCache.get(e);
	if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
	try {
		const u = await findUserByEmail(e);
		const value =
			!!u &&
			!u.blocked &&
			(String(u.app_role ?? '') === 'neighborhood_admin' ||
				(Array.isArray(u.coordinator_of) && u.coordinator_of.length > 0));
		if (coordinatorCache.size >= MAX_ENTRIES) coordinatorCache.clear();
		coordinatorCache.set(e, { at: Date.now(), value });
		return value;
	} catch {
		return false;
	}
}

/** הרשאת כניסה והצבעה בדף התקציב */
export async function canVoteBudget(email: string | null | undefined): Promise<boolean> {
	if (isSuperAdmin(email) || (await isNetworkAdmin(email))) return true;
	return isNeighborhoodCoordinator(email);
}
