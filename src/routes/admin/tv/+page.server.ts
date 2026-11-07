import { error, redirect } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import type { PageServerLoad } from './$types';

// /admin/tv — ניהול Freedom TV: טבלת המתנדבים בלבד. פתוח לסופר-אדמין ולאדמיני
// אתרי הרשת; הנתונים נטענים מ-/api/team-board שאוכף את אותה הרשאה שוב.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/admin/tv');
	const email = session.user.email ?? '';
	if (!isSuperAdmin(email) && !(await isNetworkAdmin(email)))
		throw error(403, 'אין לך הרשאה לגשת לאזור הניהול');
	return {};
};
