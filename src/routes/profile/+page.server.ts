import { redirect } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/profile');
	// סופר-אדמין ואדמיני אתרי הרשת: האזור האישי הוא "ניהול הרשת"
	if (isSuperAdmin(session.user.email) || (await isNetworkAdmin(session.user.email)))
		throw redirect(302, '/admin');
	// שאר המשתמשים: אין אזור אישי בשער — חוזרים לדף הבית
	throw redirect(302, '/');
};
