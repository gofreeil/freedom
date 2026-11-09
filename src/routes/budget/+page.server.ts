import { redirect } from '@sveltejs/kit';
import { canVoteBudget } from '$lib/server/budgetAccess';
import type { PageServerLoad } from './$types';

// /budget — "ניהול תקציב": עוגת התקציב פתוחה לצפייה לכל משתמש מחובר. ההצבעה —
// לאדמינים (סופר-אדמין ואדמיני אתרי הרשת) ולרכזי השכונות בלבד. בדיקת הרכז מול
// Strapi רצה רק כאן, בכניסה לדף, ולא ב-layout. כרגע הנתונים הם מוקאף בצד הלקוח.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/budget');
	return { canVote: await canVoteBudget(session.user.email) };
};
