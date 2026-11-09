import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin } from '$lib/server/siteAdmins';
import { CLUB_INTRO, CLUB_MOTTO, CLUB_PRICE, CLUB_SECTIONS } from '$lib/server/clubBenefits';
import type { PageServerLoad } from './$types';

// /club — "מועדון יוצאים לחירות": כרגע פתוח לאדמינים בלבד (סופר-אדמין ואדמיני אתרי
// הרשת). כל השאר — מחוברים או לא — מקבלים "דף זה בבנייה", והתוכן לא נשלח אליהם.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	const email = session?.user?.email;
	const allowed = !!email && (isSuperAdmin(email) || (await isNetworkAdmin(email)));
	if (!allowed) return { club: null };
	return {
		club: { price: CLUB_PRICE, intro: CLUB_INTRO, motto: CLUB_MOTTO, sections: CLUB_SECTIONS }
	};
};
