import { error, redirect } from '@sveltejs/kit';
import { canVoteBudget } from '$lib/server/budgetAccess';
import type { PageServerLoad } from './$types';

// /budget — "ניהול תקציב": עוגת התקציב והצבעה עליה. פתוח לאדמינים (סופר-אדמין
// ואדמיני אתרי הרשת) ולרכזי השכונות בלבד. כרגע הנתונים הם מוקאפ בצד הלקוח.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/budget');
	if (!(await canVoteBudget(session.user.email))) {
		throw error(403, 'הדף פתוח לאדמינים ולרכזי שכונות בלבד');
	}
	return {};
};
