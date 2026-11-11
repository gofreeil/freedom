import { redirect, error } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { PageServerLoad } from './$types';

// /protocols — פרוטוקולים והחלטות לאדמינים בלבד
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/protocols');

	const email = session.user.email ?? '';
	const canManage = isSuperAdmin(email) || (await isNetworkAdmin(email));
	if (!canManage) {
		throw error(403, 'הגישה לפרוטוקולים מוגבלת לאדמינים בלבד');
	}

	return {
		user: {
			name: session.user.name ?? '',
			email,
			canManage
		}
	};
};
