import { CLUB_BUSINESS_TRACK, CLUB_INTRO, CLUB_MOTTO, CLUB_PRICE, CLUB_SECTIONS, CLUB_TOTAL_SAVING } from '$lib/server/clubBenefits';
import type { PageServerLoad } from './$types';

// /club — "מועדון יוצאים לחירות": פתוח לכל גולש, מסומן בדף כטיוטא.
export const load: PageServerLoad = async () => {
	return {
		club: {
			price: CLUB_PRICE,
			intro: CLUB_INTRO,
			motto: CLUB_MOTTO,
			sections: CLUB_SECTIONS,
			businessTrack: CLUB_BUSINESS_TRACK,
			totalSaving: CLUB_TOTAL_SAVING
		}
	};
};
