import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import Facebook from '@auth/sveltekit/providers/facebook';
import Credentials from '@auth/sveltekit/providers/credentials';
import type { Handle } from '@sveltejs/kit';
import {
	strapiLogin,
	getStrapiMe,
	getOrCreateStrapiJwt,
	jwtExpSeconds,
	readCookie,
	bestStrapiName,
	friendlyName
} from '$lib/server/strapiAuth';

const AUTH_SECRET          = process.env.AUTH_SECRET          ?? '';

// קירור בין ניסיונות רענון כושלים (לפי אימייל): אם אי-אפשר להנפיק טוקן חדש
// (למשל STRAPI_TOKEN לא מוגדר), לא מפציצים את ה-Strapi בכל בקשה — מנסים שוב
// רק אחרי רבע שעה. הצלחה מנקה את הקירור.
const refreshCooldown = new Map<string, number>();
const REFRESH_RETRY_MS = 15 * 60 * 1000;

// מטמון טוקן שהונפק הרגע (לפי אימייל): ה-jwt callback רץ בכל קריאת auth() —
// hook + layout + page באותה בקשה — וכל אחת מפענחת את העוגייה *הישנה* של הבקשה,
// כך שהטוקן שרוענן בקריאה הראשונה לא נראה בבאות. בלי המטמון, אותה בקשה הייתה
// מנפיקה את אותו טוקן 2-3 פעמים מול ה-Strapi.
const freshJwtCache = new Map<string, { jwt: string; at: number }>();
const FRESH_REUSE_MS = 60 * 1000;
const AUTH_GOOGLE_ID       = process.env.AUTH_GOOGLE_ID       ?? '';
const AUTH_GOOGLE_SECRET   = process.env.AUTH_GOOGLE_SECRET   ?? '';
const AUTH_FACEBOOK_ID     = process.env.AUTH_FACEBOOK_ID     ?? '';
const AUTH_FACEBOOK_SECRET = process.env.AUTH_FACEBOOK_SECRET ?? '';

// ============================================================
// אם AUTH_SECRET חסר — לא לאתחל SvelteKitAuth (מונע 500 בכל בקשה).
// כל הדפים ייטענו כמשתמש אנונימי.
// ============================================================
const noOpHandle: Handle = async ({ event, resolve }) => {
	event.locals.auth = async () => null;
	return resolve(event);
};
const noOpAction = async (): Promise<never> => {
	throw new Error('Auth disabled: AUTH_SECRET not configured');
};

// ספקי OAuth נטענים רק אם הוגדרו (אחרת Auth.js זורק על clientId ריק)
const providers = [
	Credentials({
		id: 'credentials',
		name: 'Email & Password',
		credentials: { email: {}, password: {} },
		async authorize(credentials) {
			if (!credentials?.email || !credentials?.password) return null;
			const emailLc = (credentials.email as string).trim().toLowerCase();
			try {
				const { jwt, user } = await strapiLogin(emailLc, credentials.password as string);
				return {
					id: String(user.id),
					name: bestStrapiName(user),
					email: user.email ?? emailLc,
					strapiJwt: jwt
				} as { id: string; name: string; email: string; strapiJwt: string };
			} catch {
				return null;
			}
		}
	}),
	// יוצאים לחירות (SSO) — זיהוי לפי העוגייה המשותפת gofreeil-auth
	Credentials({
		id: 'gofreeil-sso',
		name: 'יוצאים לחירות',
		credentials: {},
		async authorize(_credentials, request) {
			const jwt = readCookie(request?.headers?.get('cookie'), 'gofreeil-auth');
			if (!jwt) return null;
			const me = await getStrapiMe(jwt);
			if (!me?.email) return null;
			return {
				id: String(me.id),
				name: bestStrapiName(me),
				email: me.email,
				strapiJwt: jwt
			} as { id: string; name: string; email: string; strapiJwt: string };
		}
	})
];

/**
 * אילו ספקי OAuth באמת רשומים. דף ההתחברות קורא מכאן כדי לא להציג כפתור
 * לספק שלא הוגדר — לחיצה עליו הייתה מחזירה את המשתמש עם שגיאה סתומה.
 */
export const oauthEnabled = {
	google: Boolean(AUTH_GOOGLE_ID && AUTH_GOOGLE_SECRET),
	facebook: Boolean(AUTH_FACEBOOK_ID && AUTH_FACEBOOK_SECRET)
};

if (oauthEnabled.google) {
	providers.unshift(Google({ clientId: AUTH_GOOGLE_ID, clientSecret: AUTH_GOOGLE_SECRET }) as never);
}
if (oauthEnabled.facebook) {
	providers.unshift(Facebook({ clientId: AUTH_FACEBOOK_ID, clientSecret: AUTH_FACEBOOK_SECRET }) as never);
}

export const { handle, signIn, signOut } = !AUTH_SECRET
	? (() => {
			console.warn('[auth] AUTH_SECRET missing - auth disabled (no-op fallback)');
			return { handle: noOpHandle, signIn: noOpAction, signOut: noOpAction };
		})()
	: SvelteKitAuth({
			secret: AUTH_SECRET,
			session: { maxAge: 365 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
			cookies: {
				sessionToken: {
					options: { httpOnly: true, sameSite: 'lax', path: '/', secure: true, maxAge: 365 * 24 * 60 * 60 }
				}
			},
			providers,
			callbacks: {
				async signIn({ user, account }) {
					if (!account || !user) return false;
					// credentials / SSO — ה-JWT כבר קיים על ה-user
					if (account.provider === 'credentials' || account.provider === 'gofreeil-sso') {
						return true;
					}
					// OAuth — משיג JWT של ה-Strapi המשותף
					const tempId = `${account.provider}_${account.providerAccountId}`;
					const jwt = await getOrCreateStrapiJwt(user.email, tempId, AUTH_SECRET);
					if (jwt) (user as { strapiJwt?: string }).strapiJwt = jwt;
					// מזהה יציב כמו באתר הקהילה: user.id = ה-seed שאיתו הונפק החשבון ב-Strapi.
					// ברירת המחדל של Auth.js היא UUID אקראי חדש בכל התחברות — הרענון היומי
					// (jwt callback) היה מנסה seed שלא תואם ונכשל תמיד.
					user.id = tempId;
					return true;
				},
				async jwt({ token, user, account }) {
					if (user && account) {
						token.provider = account.provider;
						if (user.email) token.email = user.email;
						if (user.name) token.name = user.name;
						token.dbUserId = user.id;
					}
					if (user && (user as { strapiJwt?: string }).strapiJwt) {
						token.strapiJwt = (user as { strapiJwt?: string }).strapiJwt;
					}
					// ריפוי-עצמי + רענון פג-תוקף: מוודאים ש-strapiJwt קיים *ותקף*. בלעדיו
					// (או כשהוא פג) העוגייה המשותפת gofreeil-auth נשתלת עם טוקן מת — אתר
					// אחות יאמת אותו מול Strapi, יקבל 401 ויציג "לא רשום" למרות שהמשתמש
					// מחובר כאן מצוין. מפענחים את ה-exp מקומית (בלי רשת); אם חסר / פג /
					// עומד לפוג תוך 3 ימים — מושכים טוקן חדש. אותו דפוס כמו באתר הקהילה.
					{
						const REFRESH_BUFFER_MS = 3 * 24 * 60 * 60 * 1000; // 3 ימים לפני פג-תוקף
						const exp = jwtExpSeconds(token.strapiJwt);
						const needsFresh =
							!token.strapiJwt || exp === null || exp * 1000 < Date.now() + REFRESH_BUFFER_MS;
						const emailKey = typeof token.email === 'string' ? token.email : '';
						const coolUntil = refreshCooldown.get(emailKey) ?? 0;
						const cached = freshJwtCache.get(emailKey);
						if (needsFresh && cached && Date.now() - cached.at < FRESH_REUSE_MS) {
							// טוקן שהונפק הרגע בקריאת auth() קודמת של אותה בקשה — בלי רשת
							token.strapiJwt = cached.jwt;
						} else if (needsFresh && emailKey && token.dbUserId && Date.now() >= coolUntil) {
							try {
								const fresh = await getOrCreateStrapiJwt(
									emailKey,
									token.dbUserId as string,
									AUTH_SECRET
								);
								if (fresh) {
									token.strapiJwt = fresh;
									freshJwtCache.set(emailKey, { jwt: fresh, at: Date.now() });
									refreshCooldown.delete(emailKey);
								} else {
									refreshCooldown.set(emailKey, Date.now() + REFRESH_RETRY_MS);
								}
							} catch {
								refreshCooldown.set(emailKey, Date.now() + REFRESH_RETRY_MS);
							}
						}
					}
					return token;
				},
				session({ session, token }) {
					if (token.dbUserId) session.user.id = token.dbUserId as string;
					if (token.email) session.user.email = token.email as string;
					// שם תצוגה נקי — לעולם לא מזהה־מכונה כמו google_1164… (מנקה גם עוגיות ישנות)
					session.user.name = friendlyName(
						token.name as string | undefined,
						token.email as string | undefined
					);
					if (token.provider) (session.user as { provider?: string }).provider = token.provider as string;
					if (token.strapiJwt) (session.user as { strapiJwt?: string }).strapiJwt = token.strapiJwt as string;
					return session;
				}
			},
			pages: { signIn: '/login', error: '/login' },
			trustHost: true
		});
