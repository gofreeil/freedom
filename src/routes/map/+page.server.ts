import { SITES, type SiteCategory } from '$lib/sitesData';
import { gravatarUrl } from '$lib/server/gravatar';
import type { PageServerLoad } from './$types';

// סדר הצגת הקטגוריות במפה
const CATEGORY_ORDER: SiteCategory[] = ['ראשי', 'קהילה', 'משילות', 'כלכלה'];

// ההיכרות מסומנת ידנית ע"י המשתמש ונשמרת בדפדפן (localStorage) — אין תלות בשרת.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	const user = session?.user ?? null;

	const groups = CATEGORY_ORDER.map((category) => ({
		category,
		sites: SITES.filter((s) => s.category === category)
	})).filter((g) => g.sites.length > 0);

	return {
		loggedIn: !!user,
		me: user
			? {
					name: user.name ?? '',
					email: user.email ?? '',
					avatar: gravatarUrl(user.email ?? '')
				}
			: null,
		total: SITES.length,
		groups
	};
};
