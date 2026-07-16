import { error, fail, redirect } from '@sveltejs/kit';
import { SITES, getSite } from '$lib/sitesData';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { getSiteAdmins, setSiteAdmin, removeSiteAdmin } from '$lib/server/siteAdmins';
import { gravatarUrl } from '$lib/server/gravatar';
import type { PageServerLoad, Actions } from './$types';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** מוודא שהמשתמש מחובר וסופר-אדמין; אחרת מפנה/חוסם */
async function requireSuperAdmin(locals: App.Locals) {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/admin');
	if (!isSuperAdmin(session.user.email)) throw error(403, 'אין לך הרשאה לגשת לאזור הניהול');
	return session.user;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireSuperAdmin(locals);
	const admins = await getSiteAdmins();
	return {
		me: { name: user.name ?? '', email: user.email ?? '' },
		sites: SITES.map((s) => {
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
		const me = await requireSuperAdmin(locals);
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const adminEmail = String(form.get('adminEmail') ?? '').trim().toLowerCase();
		const adminName = String(form.get('adminName') ?? '').trim();
		const role = String(form.get('role') ?? '').trim();
		const avatarUrl = String(form.get('avatarUrl') ?? '').trim();

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

		await setSiteAdmin(siteId, {
			adminEmail,
			adminName,
			role: role || undefined,
			avatarUrl: avatarUrl || undefined,
			updatedAt: new Date().toISOString(),
			updatedBy: me.email ?? ''
		});
		return { siteId, saved: true };
	},

	// ביטול מינוי אדמין
	remove: async ({ request, locals }) => {
		await requireSuperAdmin(locals);
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		if (!getSite(siteId)) return fail(400, { siteId, error: 'אתר לא מוכר' });
		await removeSiteAdmin(siteId);
		return { siteId, removed: true };
	}
};
