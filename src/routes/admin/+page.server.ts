import { error, fail, redirect } from '@sveltejs/kit';
import { SITES, getSite } from '$lib/sitesData';
import type { SiteAdminsMap } from '$lib/server/siteAdmins';
import { isSuperAdmin } from '$lib/server/superAdmin';
import {
	getSiteAdmins,
	setSiteAdmin,
	removeSiteAdmin,
	setSiteAdminsOrder,
	isNetworkAdmin,
	DEFAULT_SITE_AVATARS
} from '$lib/server/siteAdmins';
import { gravatarUrl } from '$lib/server/gravatar';
import { displayAvatarUrl } from '$lib/server/avatarProxy';
import type { PageServerLoad, Actions } from './$types';

// /admin — "ניהול הרשת": פתוח לסופר-אדמין ולאדמיני אתרי הרשת בלבד. לוח המשימות
// והדיווחים של הצוות נטען בצד הלקוח מ-/api/team-board. כאן: טבלת הרכזים —
// סופר-אדמין מקבל אותה ניתנת לעריכה עם הפעולות שלמטה; אדמיני האתרים — לקריאה בלבד.

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** מוודא שהמשתמש מחובר וסופר-אדמין; אחרת מפנה/חוסם. מחזיר גם את ה-JWT מול Strapi. */
async function requireSuperAdmin(locals: App.Locals) {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/admin');
	if (!isSuperAdmin(session.user.email)) throw error(403, 'אין לך הרשאה לגשת לאזור הניהול');
	const jwt = (session.user as { strapiJwt?: string }).strapiJwt ?? '';
	// האחסון יושב ב-Strapi המשותף — לשמירה נדרש JWT
	if (!jwt) throw error(401, 'פעולת שמירה דורשת חיבור מלא מול השרת המשותף');
	return { user: session.user, jwt };
}

// חנות החירות לא מנוהלת בדף הזה
const MANAGED_SITES = SITES.filter((s) => s.id !== 'freedom_store');

/** שורות הטבלה — פרטי האתר + האדמין שלו, בלי התמונה המוטמעת (ראו avatarProxy) */
function siteRows(admins: SiteAdminsMap) {
	return MANAGED_SITES.map((s) => {
		const a = admins[s.id] ?? null;
		return {
			...s,
			admin: a
				? {
						adminEmail: a.adminEmail ?? '',
						adminName: a.adminName ?? '',
						role: a.role ?? '',
						phone: a.phone ?? '',
						communityId: a.communityId ?? '',
						updatedAt: a.updatedAt ?? '',
						updatedBy: a.updatedBy ?? '',
						// avatar = כתובת התמונה לתצוגה (פרוקסי אם הועלתה תמונה, אחרת Gravatar
						// לפי האימייל). ה-data URL עצמו נשאר בשרת ולא מועמס על הדף.
						avatar:
							(a.avatarUrl && !a.avatarUrl.includes('googleusercontent'))
								? displayAvatarUrl(s.id, a.avatarUrl)
								: (DEFAULT_SITE_AVATARS[s.id] || a.avatarUrl || '')
					}
				: null
		};
	});
}

const ORIGINAL_SITE_ROLES: Record<string, { adminName: string; role: string; avatarUrl?: string }> = {
	portal: {
		adminName: 'יהב אנטר',
		role: 'איש חזון, אמונה ומשפחה, מקים ומתפעל את התנועה החברתית "יוצאים לחירות"'
	},
	community_neighborhood: {
		adminName: 'רכזי השכונות',
		role: 'הפלטפורמה מבוזרת בבעלות בעלי המניות - כולם יכולים להצטרף וקחת חלק'
	},
	state_auditor: {
		adminName: 'דניאל בטיטו',
		role: 'איש עשייה מוביל שיירת החירות',
		avatarUrl: '/images/admins/state_auditor.jpg'
	},
	courts_reconciliation: {
		adminName: 'הרב מאיר הלוי',
		role: 'סמוך בסנהדרין ובתי דין – בני נח ונדחי ישראל, CMO בחברת פטנטים',
		avatarUrl: '/images/admins/courts_reconciliation.jpg'
	},
	national_gemach: {
		adminName: 'אהובה ניסן',
		role: 'מקדמת ואהבת לרעך כמוך'
	},
	lost_and_found: {
		adminName: 'ליאת טרר',
		role: 'אשת משפחה, מקדמת תודעת ואהבת לרעך כמוך'
	},
	purchasing_group: {
		adminName: 'זמיר גל',
		role: 'מנהל צוותי שירות ומכירה'
	},
	professionals: {
		adminName: 'יגאל כהן',
		role: 'יזם, בוגר מכללת תל אביב לבניה'
	}
};

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/admin');
	if (!isSuperAdmin(session.user.email)) {
		// אדמין של אתר ברשת — רואה את הדף, בלי עריכת המינויים
		if (await isNetworkAdmin(session.user.email)) return { panel: null };
		throw error(403, 'אין לך הרשאה לגשת לאזור הניהול');
	}
	const jwt = (session.user as { strapiJwt?: string }).strapiJwt ?? '';
	// אם אין JWT (למשל בחיבור בדיקת תצוגה של סופר-אדמין), מספקים פאנל תצוגה מלא עם האדמינים המקוריים
	if (!jwt) {
		const mockAdmins: SiteAdminsMap = {};
		for (const [siteId, orig] of Object.entries(ORIGINAL_SITE_ROLES)) {
			mockAdmins[siteId] = {
				adminEmail: `${siteId}@gofreeil.com`,
				adminName: orig.adminName,
				role: orig.role,
				avatarUrl: orig.avatarUrl,
				updatedAt: new Date().toISOString(),
				updatedBy: 'yahavanter@gmail.com'
			};
		}
		return {
			panel: Promise.resolve({
				order: MANAGED_SITES.map((s) => s.id),
				sites: siteRows(mockAdmins),
				error: ''
			})
		};
	}

	// הנתונים מוחזרים כהבטחה ולא ב-await: SvelteKit מזרים אותם לדף. כך הלחיצה
	// על "ניהול הרשת" פותחת את הדף מיד — השלד על המסך — והטבלה מתמלאת
	// רגע אחרי, במקום שכל הניווט ימתין לסיבוב מול ה-Strapi המשותף.
	const panel = getSiteAdmins(jwt).then(
		async ({ admins, order }) => {
			for (const [siteId, orig] of Object.entries(ORIGINAL_SITE_ROLES)) {
				const cur = admins[siteId];
				if (cur && (cur.role !== orig.role || cur.adminName !== orig.adminName || !cur.avatarUrl || cur.avatarUrl.includes('googleusercontent'))) {
					const hasValidAvatar = cur.avatarUrl && !cur.avatarUrl.includes('googleusercontent');
					const finalAvatar = hasValidAvatar ? cur.avatarUrl : (orig.avatarUrl || undefined);
					await setSiteAdmin(jwt, siteId, {
						...cur,
						adminName: orig.adminName,
						role: orig.role,
						avatarUrl: finalAvatar
					}).catch(() => {});
					cur.adminName = orig.adminName;
					cur.role = orig.role;
					if (finalAvatar) cur.avatarUrl = finalAvatar;
				}
			}
			return {
				order,
				sites: siteRows(admins),
				error: ''
			};
		},
		(e) => {
			console.error('site-admins load failed:', e);
			return {
				order: [] as string[],
				sites: siteRows({}),
				error: 'שגיאה בטעינת נתוני האדמינים מהשרת המשותף — נסו לרענן'
			};
		}
	);

	return { panel };
};

export const actions: Actions = {
	// מינוי / עדכון אדמין לאתר
	assign: async ({ request, locals }) => {
		const { user: me, jwt } = await requireSuperAdmin(locals);
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const adminEmail = String(form.get('adminEmail') ?? '').trim().toLowerCase();
		const adminName = String(form.get('adminName') ?? '').trim();
		const role = String(form.get('role') ?? '').trim();
		const avatarUrl = String(form.get('avatarUrl') ?? '').trim();
		const phone = String(form.get('phone') ?? '').trim();
		const communityId = String(form.get('communityId') ?? '').trim();

		if (!getSite(siteId)) return fail(400, { siteId, error: 'אתר לא מוכר' });
		if (!adminName) return fail(400, { siteId, error: 'צריך למלא שם אדמין' });
		// אימייל כבר לא מוצג בטופס — ערך קיים עובר כשדה חבוי; אם יש, מוודאים תקינות
		if (adminEmail && !emailRe.test(adminEmail)) return fail(400, { siteId, error: 'כתובת אימייל לא תקינה' });
		// תמונה: קישור http/https או העלאה מהמחשב (data URL שנוצר בקרופר)
		const isHttpUrl = /^https?:\/\//i.test(avatarUrl);
		const isDataImage = /^data:image\/(png|jpe?g|webp);base64,/i.test(avatarUrl);
		if (avatarUrl && !isHttpUrl && !isDataImage)
			return fail(400, { siteId, error: 'תמונה לא תקינה' });
		if (avatarUrl.length > 700_000)
			return fail(400, { siteId, error: 'התמונה גדולה מדי' });
		if (phone && !/^[+\d][\d\s-]{5,20}$/.test(phone))
			return fail(400, { siteId, error: 'מספר טלפון לא תקין' });
		if (communityId.length > 100)
			return fail(400, { siteId, error: 'מזהה קהילה ארוך מדי' });

		// הדף לא מחזיק יותר את התמונה המוטמעת, ולכן שדה ריק פירושו "התמונה לא
		// שונתה" — לוקחים את הקיימת מהשרת במקום למחוק אותה בכל שמירת שדה.
		let keptAvatar = '';
		if (!avatarUrl) {
			try {
				keptAvatar = (await getSiteAdmins(jwt)).admins[siteId]?.avatarUrl ?? '';
			} catch {
				keptAvatar = '';
			}
			if (!keptAvatar && DEFAULT_SITE_AVATARS[siteId]) {
				keptAvatar = DEFAULT_SITE_AVATARS[siteId];
			}
		}

		try {
			await setSiteAdmin(jwt, siteId, {
				adminEmail,
				adminName,
				role: role || undefined,
				phone: phone || undefined,
				communityId: communityId || undefined,
				avatarUrl: avatarUrl || keptAvatar || undefined,
				updatedAt: new Date().toISOString(),
				updatedBy: me.email ?? ''
			});
		} catch (e) {
			console.error('site-admins save failed:', e);
			return fail(502, { siteId, error: 'השמירה בשרת המשותף נכשלה — נסו שוב' });
		}
		return { siteId, saved: true };
	},

	// ביטול מינוי אדמין
	remove: async ({ request, locals }) => {
		const { jwt } = await requireSuperAdmin(locals);
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		if (!getSite(siteId)) return fail(400, { siteId, error: 'אתר לא מוכר' });
		try {
			await removeSiteAdmin(jwt, siteId);
		} catch (e) {
			console.error('site-admins remove failed:', e);
			return fail(502, { siteId, error: 'ההסרה בשרת המשותף נכשלה — נסו שוב' });
		}
		return { siteId, removed: true };
	},

	// שמירת סדר הצגת האתרים (חיצי הסידור). הסדר יושב בשרת ולא בדפדפן —
	// כך הוא נשמר בין מכשירים ומופיע גם ברשימת הרכזים הציבורית ב-/about.
	order: async ({ request, locals }) => {
		const { jwt } = await requireSuperAdmin(locals);
		const form = await request.formData();
		let ids: unknown;
		try {
			ids = JSON.parse(String(form.get('order') ?? '[]'));
		} catch {
			return fail(400, { error: 'סדר לא תקין' });
		}
		if (!Array.isArray(ids)) return fail(400, { error: 'סדר לא תקין' });
		const order = ids.filter((id): id is string => typeof id === 'string' && !!getSite(id));
		try {
			await setSiteAdminsOrder(jwt, order);
		} catch (e) {
			console.error('site-admins order save failed:', e);
			return fail(502, { error: 'שמירת הסדר נכשלה — נסו שוב' });
		}
		return { orderSaved: true };
	}
};
