import { error, fail, redirect } from '@sveltejs/kit';
import { SITES, getSite } from '$lib/sitesData';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { getSiteAdmins, setSiteAdmin, removeSiteAdmin } from '$lib/server/siteAdmins';
import { gravatarUrl } from '$lib/server/gravatar';
import type { PageServerLoad, Actions } from './$types';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** מוודא שהמשתמש מחובר וסופר-אדמין; אחרת מפנה/חוסם. מחזיר גם את ה-JWT מול Strapi. */
async function requireSuperAdmin(locals: App.Locals) {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/admin');
	if (!isSuperAdmin(session.user.email)) throw error(403, 'אין לך הרשאה לגשת לאזור הניהול');
	const jwt = (session.user as { strapiJwt?: string }).strapiJwt ?? '';
	// האחסון יושב ב-Strapi המשותף — בלי JWT אי אפשר לקרוא/לשמור
	if (!jwt) throw error(401, 'חסר אישור מול השרת המשותף — יש להתנתק ולהתחבר מחדש');
	return { user: session.user, jwt };
}

export const load: PageServerLoad = async ({ locals }) => {
	const { user, jwt } = await requireSuperAdmin(locals);
	let admins: Awaited<ReturnType<typeof getSiteAdmins>>;
	try {
		admins = await getSiteAdmins(jwt);
	} catch (e) {
		console.error('site-admins load failed:', e);
		throw error(502, 'שגיאה בטעינת נתוני האדמינים מהשרת המשותף');
	}
	return {
		me: { name: user.name ?? '', email: user.email ?? '' },
		// חנות החירות לא מנוהלת בדף הזה
		sites: SITES.filter((s) => s.id !== 'freedom_store').map((s) => {
			const a = admins[s.id] ?? null;
			return {
				...s,
				// avatar = התמונה האפקטיבית לתצוגה (מפורשת אם הוגדרה, אחרת מהאימייל אם יש)
				admin: a
					? { ...a, avatar: a.avatarUrl?.trim() || (a.adminEmail ? gravatarUrl(a.adminEmail) : '') }
					: null
			};
		})
	};
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

		try {
			await setSiteAdmin(jwt, siteId, {
				adminEmail,
				adminName,
				role: role || undefined,
				phone: phone || undefined,
				communityId: communityId || undefined,
				avatarUrl: avatarUrl || undefined,
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
	}
};
