import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { LayoutServerLoad } from './$types';

// חושף את הסשן (אם יש) לכל הדפים — כדי שההאדר יציג מצב מחובר/כפתור התחברות.
export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const session = await locals.auth();
	const simActive = cookies.get('role_sim_active') === '1';

	if (!session?.user) {
		return {
			user: null,
			roleSim: simActive ? { active: true, currentRole: 'guest' as const } : null
		};
	}

	const superAdmin = isSuperAdmin(session.user.email);
	const canManage = superAdmin || (await isNetworkAdmin(session.user.email));
	const isRoleLogin = (session.user as { provider?: string }).provider === 'role-login';
	const currentRole = superAdmin ? ('super_admin' as const) : canManage ? ('admin' as const) : ('user' as const);

	return {
		user: {
			id: session.user.id,
			name: session.user.name ?? '',
			email: session.user.email ?? '',
			// תמונת הפרופיל (Google/Facebook); בלעדיה ההדר מציג את האות הראשונה
			image: session.user.image ?? '',
			isSuperAdmin: superAdmin,
			// כפתור "ניהול הרשת" בהדר — לסופר-אדמין ולאדמיני אתרי הרשת בלבד
			canManage
		},
		roleSim: (superAdmin || simActive || isRoleLogin)
			? {
					active: true,
					currentRole
			  }
			: null
	};
};
