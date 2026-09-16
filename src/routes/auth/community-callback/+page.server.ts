import type { PageServerLoad } from './$types';
import { oauthEnabled } from '../../../auth';

export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('returnTo') ?? '/';
	const returnTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
	// oauth: מסך "עדיין אין חשבון" מציע כניסה בלחיצה עם Google/Facebook (רק ספקים מוגדרים)
	return { returnTo, error: url.searchParams.get('error'), oauth: oauthEnabled };
};
