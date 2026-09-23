import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// פאנל הניהול עבר לכרטיסייה "ניהול הרשת" בדף האודות — קישורים ישנים מגיעים לשם
export const load: PageServerLoad = () => {
	throw redirect(301, '/about?tab=network');
};
