import { redirect } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/profile');
	// סופר-אדמין: האזור האישי הוא פאנל ניהול אתרי הרשת
	if (isSuperAdmin(session.user.email)) throw redirect(302, '/admin');
	// שאר המשתמשים: האזור האישי הוא מפת הרשת (מה כבר מכירים / עדיין לא)
	throw redirect(302, '/map');
};
