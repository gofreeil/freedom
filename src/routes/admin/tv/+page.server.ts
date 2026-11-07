import { redirect } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { PageServerLoad } from './$types';

// /admin/tv — ניהול Freedom TV: טבלת המתנדבים בלבד. אדמין (סופר-אדמין / רכז אתר)
// מקבל את הטבלה המלאה. כל משתמש מחובר אחר שקיבל את הקישור מקבל תצוגה מצומצמת:
// תוכן הטבלה מוסתר (כוכביות) והוא רק מוסיף שורה משלו — ראו /api/tv-guest.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/admin/tv');
	const email = session.user.email ?? '';
	const team = isSuperAdmin(email) || (await isNetworkAdmin(email));
	return { guest: !team };
};
