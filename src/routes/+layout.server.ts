import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { LayoutServerLoad } from './$types';

// חושף את הסשן (אם יש) לכל הדפים — כדי שההאדר יציג מצב מחובר/כפתור התחברות.
export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const session = await locals.auth();
	const email = session?.user?.email?.trim().toLowerCase();
	const isRealSuper = isSuperAdmin(email);

	// רק סופר-אדמין אמיתי מורשה לבחור תצוגה אחרת
	const viewRole = isRealSuper ? cookies.get('super_view_role') : null;

	if (!session?.user) {
		return { user: null, realSuperAdmin: false, currentViewRole: 'guest' as const };
	}

	// אם סופר-אדמין בחר "הכנס כאורח"
	if (isRealSuper && viewRole === 'guest') {
		return {
			user: null,
			realSuperAdmin: true,
			currentViewRole: 'guest' as const
		};
	}

	let isSuper = isRealSuper;
	let canManage = isRealSuper || (await isNetworkAdmin(email));
	let displayName = session.user.name ?? '';

	if (isRealSuper && viewRole) {
		if (viewRole === 'admin') {
			isSuper = false;
			canManage = true;
			displayName = displayName ? `${displayName} (אדמין)` : 'אדמין רשת';
		} else if (viewRole === 'user') {
			isSuper = false;
			canManage = false;
			displayName = displayName ? `${displayName} (משתמש)` : 'משתמש מחובר';
		} else if (viewRole === 'super_admin') {
			isSuper = true;
			canManage = true;
		}
	}

	return {
		user: {
			id: session.user.id,
			name: displayName,
			email: session.user.email ?? '',
			// תמונת הפרופיל (Google/Facebook); בלעדיה ההדר מציג את האות הראשונה
			image: session.user.image ?? '',
			isSuperAdmin: isSuper,
			// כפתור "ניהול הרשת" בהדר — לסופר-אדמין ולאדמיני אתרי הרשת בלבד
			canManage
		},
		realSuperAdmin: isRealSuper,
		currentViewRole: (viewRole || 'super_admin') as 'super_admin' | 'admin' | 'user' | 'guest'
	};
};
