import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) return { user: null, canManage: false };

	const email = session.user.email ?? '';
	const superAdmin = isSuperAdmin(email);
	const canManage = superAdmin || (await isNetworkAdmin(email));

	return {
		user: {
			name: session.user.name ?? '',
			email,
			image: session.user.image ?? '',
			canManage
		},
		canManage
	};
};
