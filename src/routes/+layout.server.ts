import { isSuperAdmin } from '$lib/server/superAdmin';
import type { LayoutServerLoad } from './$types';

// חושף את הסשן (אם יש) לכל הדפים — כדי שההאדר יציג מצב מחובר/כפתור התחברות.
export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	return {
		user: session?.user
			? {
					id: session.user.id,
					name: session.user.name ?? '',
					email: session.user.email ?? '',
					// סופר-אדמין — כדי שההאדר יוביל ישירות לפאנל ניהול הרשת
					isSuperAdmin: isSuperAdmin(session.user.email)
				}
			: null
	};
};
