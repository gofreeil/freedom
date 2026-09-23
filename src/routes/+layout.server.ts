import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { LayoutServerLoad } from './$types';

// חושף את הסשן (אם יש) לכל הדפים — כדי שההאדר יציג מצב מחובר/כפתור התחברות.
export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) return { user: null };
	const superAdmin = isSuperAdmin(session.user.email);
	return {
		user: {
			id: session.user.id,
			name: session.user.name ?? '',
			email: session.user.email ?? '',
			isSuperAdmin: superAdmin,
			// כפתור "ניהול הרשת" בהדר — לסופר-אדמין ולאדמיני אתרי הרשת בלבד
			canManage: superAdmin || (await isNetworkAdmin(session.user.email))
		}
	};
};
