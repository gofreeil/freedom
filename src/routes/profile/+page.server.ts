import { redirect } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin, getSiteAdmins, type SiteAdminsMap, buildManagedSiteRows } from '$lib/server/siteAdmins';
import { canVoteBudget } from '$lib/server/budgetAccess';
import { CLUB_BUSINESS_TRACK, CLUB_INTRO, CLUB_MOTTO, CLUB_PRICE, CLUB_SECTIONS, CLUB_TOTAL_SAVING } from '$lib/server/clubBenefits';
import type { PageServerLoad } from './$types';

function siteRows(admins: SiteAdminsMap) {
	return buildManagedSiteRows(admins);
}

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/profile');

	const email = session.user.email ?? '';
	const isRealSuper = isSuperAdmin(email);
	const viewRole = isRealSuper ? cookies.get('super_view_role') : null;
	const isSuper = isRealSuper && viewRole !== 'admin' && viewRole !== 'user' && viewRole !== 'guest';
	const canManage = isSuper || (await isNetworkAdmin(email));

	let panel: Promise<{ order: string[]; sites: ReturnType<typeof siteRows>; error: string }> | null = null;
	if (isSuper) {
		const jwt = (session.user as { strapiJwt?: string }).strapiJwt ?? '';
		if (jwt) {
			panel = getSiteAdmins(jwt).then(
				({ admins, order }) => ({
					order,
					sites: siteRows(admins),
					error: ''
				}),
				(e) => {
					console.error('site-admins load failed:', e);
					return {
						order: [] as string[],
						sites: siteRows({}),
						error: 'שגיאה בטעינת נתוני האדמינים מהשרת המשותף — נסו לרענן'
					};
				}
			);
		}
	}

	return {
		user: {
			name: session.user.name ?? '',
			email,
			image: session.user.image ?? '',
			isSuperAdmin: isSuper,
			canManage
		},
		club: {
			price: CLUB_PRICE,
			intro: CLUB_INTRO,
			motto: CLUB_MOTTO,
			sections: CLUB_SECTIONS,
			businessTrack: CLUB_BUSINESS_TRACK,
			totalSaving: CLUB_TOTAL_SAVING
		},
		canVote:
			isSuper ||
			((!isRealSuper || (viewRole !== 'user' && viewRole !== 'guest')) && (await canVoteBudget(email))),
		tvGuest: !canManage,
		panel
	};
};

export { actions } from '../admin/+page.server';
