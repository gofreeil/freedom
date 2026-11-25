import { redirect } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/admin/tv/youtube');
	const email = session.user.email ?? '';
	const team = isSuperAdmin(email) || (await isNetworkAdmin(email));
	return { guest: !team, userName: session.user.name ?? '' };
};
