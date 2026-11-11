import { redirect } from '@sveltejs/kit';
import { isSuperAdmin } from '$lib/server/superAdmin';
import { isNetworkAdmin, getSiteAdmins, type SiteAdminsMap } from '$lib/server/siteAdmins';
import { canVoteBudget } from '$lib/server/budgetAccess';
import { CLUB_INTRO, CLUB_MOTTO, CLUB_PRICE, CLUB_SECTIONS, CLUB_TOTAL_SAVING } from '$lib/server/clubBenefits';
import { SITES } from '$lib/sitesData';
import { displayAvatarUrl } from '$lib/server/avatarProxy';
import { gravatarUrl } from '$lib/server/gravatar';
import type { PageServerLoad } from './$types';

const MANAGED_SITES = SITES.filter((s) => s.id !== 'freedom_store');

function siteRows(admins: SiteAdminsMap) {
	return MANAGED_SITES.map((s) => {
		const a = admins[s.id] ?? null;
		return {
			...s,
			admin: a
				? {
						adminEmail: a.adminEmail ?? '',
						adminName: a.adminName ?? '',
						role: a.role ?? '',
						phone: a.phone ?? '',
						communityId: a.communityId ?? '',
						updatedAt: a.updatedAt ?? '',
						updatedBy: a.updatedBy ?? '',
						avatar:
							displayAvatarUrl(s.id, a.avatarUrl) ||
							(a.adminEmail ? gravatarUrl(a.adminEmail) : '')
					}
				: null
		};
	});
}

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) throw redirect(302, '/login?redirect=/profile');

	const email = session.user.email ?? '';
	const superAdmin = isSuperAdmin(email);
	const canManage = superAdmin || (await isNetworkAdmin(email));

	let panel: Promise<{ order: string[]; sites: ReturnType<typeof siteRows>; error: string }> | null = null;
	if (superAdmin) {
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
			canManage
		},
		club: {
			price: CLUB_PRICE,
			intro: CLUB_INTRO,
			motto: CLUB_MOTTO,
			sections: CLUB_SECTIONS,
			totalSaving: CLUB_TOTAL_SAVING
		},
		canVote: await canVoteBudget(email),
		tvGuest: !canManage,
		panel
	};
};
