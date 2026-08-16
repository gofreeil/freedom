import { createHash } from 'crypto';

// ה-Strapi המשותף של יוצאים לחירות — רשימת המשתמשים המאוחדת לכל האתרים.
export const STRAPI_URL = 'https://api.gofreeil.com';

export interface StrapiUser {
	id: number;
	username: string;
	email: string;
	// שדות שם אפשריים — רק אם ה-Strapi המשותף שומר שם אמיתי (לא מובטחים)
	name?: string;
	displayName?: string;
	firstname?: string;
	lastname?: string;
}

/**
 * האם המחרוזת היא מזהה־מכונה של ספק OAuth (google_1164…, facebook_123…) ולא שם אמיתי.
 * ה-Strapi המשותף יוצר למשתמשי OAuth username בצורת "<provider>_<id>" — אסור להציג אותו.
 */
export function isMachineUsername(name: string): boolean {
	return /^[a-z][a-z0-9]*[_-]\d{5,}$/i.test(name.trim());
}

/** בוחר את השם האמיתי הטוב ביותר שקיים על רשומת ה-Strapi (username כברירת מחדל) */
export function bestStrapiName(u: Partial<StrapiUser>): string {
	const full = [u.firstname, u.lastname].filter(Boolean).join(' ').trim();
	return (u.name || u.displayName || full || u.username || '').trim();
}

/**
 * שם תצוגה ידידותי: שם אמיתי אם קיים; אחרת נגזר מהאימייל (החלק שלפני ה-@).
 * לעולם לא מחזיר מזהה־מכונה כמו google_1164… .
 */
export function friendlyName(rawName: string | null | undefined, email: string | null | undefined): string {
	const name = (rawName ?? '').trim();
	if (name && !name.includes('@') && !isMachineUsername(name)) return name;
	const local = (email ?? '').split('@')[0] ?? '';
	if (!local) return '';
	return local
		.split(/[._-]+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

/** מפענח מקומית (בלי רשת) את שדה ה-exp מ-JWT של Strapi. null אם לא ניתן לפענוח. */
export function jwtExpSeconds(jwt: unknown): number | null {
	if (typeof jwt !== 'string') return null;
	try {
		const part = jwt.split('.')[1];
		if (!part) return null;
		const json = Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
		const payload = JSON.parse(json);
		return typeof payload?.exp === 'number' ? payload.exp : null;
	} catch {
		return null;
	}
}

/** קריאת ערך עוגייה מתוך כותרת Cookie גולמית */
export function readCookie(cookieHeader: string | null | undefined, name: string): string | null {
	if (!cookieHeader) return null;
	for (const part of cookieHeader.split(';')) {
		const idx = part.indexOf('=');
		if (idx === -1) continue;
		if (part.slice(0, idx).trim() === name) {
			return decodeURIComponent(part.slice(idx + 1).trim());
		}
	}
	return null;
}

/** לוגין מול ה-Strapi המשותף */
export async function strapiLogin(identifier: string, password: string): Promise<{ jwt: string; user: StrapiUser }> {
	const res = await fetch(STRAPI_URL + '/api/auth/local', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ identifier, password }),
		signal: AbortSignal.timeout(10_000)
	});
	if (!res.ok) throw new Error('login failed');
	return res.json();
}

/** הרשמה ל-Strapi המשותף */
export async function strapiRegister(username: string, email: string, password: string): Promise<{ jwt: string; user: StrapiUser }> {
	const res = await fetch(STRAPI_URL + '/api/auth/local/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, email, password }),
		signal: AbortSignal.timeout(10_000)
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error('register failed: ' + text);
	}
	return res.json();
}

/** אימות JWT מול ה-Strapi המשותף (משמש את כניסת ה-SSO) */
export async function getStrapiMe(jwt: string): Promise<StrapiUser | null> {
	if (!jwt) return null;
	try {
		const res = await fetch(STRAPI_URL + '/api/users/me', {
			headers: { Authorization: `Bearer ${jwt}` },
			signal: AbortSignal.timeout(10_000)
		});
		if (!res.ok) return null;
		return (await res.json()) as StrapiUser;
	} catch {
		return null;
	}
}

// טוקן שרת מול ה-Strapi המשותף (Full Access). סוד — נקרא מ-env בלבד, לעולם לא
// נכתב בקוד/גיט ולעולם לא מגיע לדפדפן. בלעדיו מסלול ההנפקה מהבאקאנד כבוי בשקט.
const STRAPI_TOKEN = process.env.STRAPI_TOKEN ?? '';

/**
 * הנפקת JWT ישירות מהבאקאנד (POST /api/sso/issue-jwt, מאומת ב-STRAPI_TOKEN) —
 * עבור משתמש קיים שאין לו סיסמה דטרמיניסטית תואמת (OAuth/מיזוג/חשבון ישן).
 * זו הדרך היחידה שעובדת למשתמשים כאלה: איפוס-סיסמה דרך REST ב-Strapi 5 מחזיר
 * 200 אך login עוקב נכשל 400. מחזיר null אם אין STRAPI_TOKEN / הנתיב לא פרוס / כשל.
 */
let warnedNoStrapiToken = false;

export async function issueSsoJwtViaBackend(email: string): Promise<string | null> {
	if (!STRAPI_TOKEN) {
		// אזהרה חד-פעמית ולא שקט: בלי הטוקן, רענון JWT למשתמשים קיימים (OAuth/מיזוג)
		// ייכשל תמיד — והעוגייה המשותפת תישאר בלי טוקן חי.
		if (!warnedNoStrapiToken) {
			warnedNoStrapiToken = true;
			console.warn('[strapiAuth] STRAPI_TOKEN לא מוגדר בסביבה — הנפקת JWT מהבאקאנד כבויה, רענון טוקנים למשתמשים קיימים ייכשל');
		}
		return null;
	}
	try {
		const res = await fetch(STRAPI_URL + '/api/sso/issue-jwt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${STRAPI_TOKEN}`
			},
			body: JSON.stringify({ email }),
			signal: AbortSignal.timeout(10_000)
		});
		if (!res.ok) return null;
		const data = (await res.json()) as { jwt?: string };
		return data?.jwt ?? null;
	} catch {
		return null;
	}
}

/**
 * מחזיר JWT של ה-Strapi המשותף למשתמש ברשימה המאוחדת, בלי סיסמה שהמשתמש מקליד.
 * שלושה מסלולים, מהזול ליקר (אותו דפוס כמו באתר הקהילה):
 *   1. login עם seed דטרמיניסטי — עובד אם החשבון נוצר תחת אותו stableId.
 *   2. register — עובד אם האימייל עדיין לא קיים ב-Strapi.
 *   3. הנפקה ישירה מהבאקאנד — משתמש קיים בלי סיסמה תואמת (דורש STRAPI_TOKEN).
 */
export async function getOrCreateStrapiJwt(email: string | null | undefined, stableId: string, secret: string): Promise<string | null> {
	if (!email) return null;
	const password = createHash('sha256').update(stableId + secret).digest('hex').slice(0, 32);
	const username = (email.split('@')[0] || stableId).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 24) + '_' + stableId.slice(-4);
	try {
		const { jwt } = await strapiLogin(email, password);
		return jwt;
	} catch {
		try {
			const { jwt } = await strapiRegister(username, email, password);
			return jwt;
		} catch {
			return issueSsoJwtViaBackend(email);
		}
	}
}
