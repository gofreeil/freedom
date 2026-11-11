import { redirect } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/profile');

	const canManage = isSuperAdmin(session.user.email) || (await isNetworkAdmin(session.user.email));

	return {
		user: {
			name: session.user.name ?? '',
			email: session.user.email ?? '',
			image: session.user.image ?? '',
			canManage
		}
	};
};
