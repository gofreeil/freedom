// ============================================================
// networkRoles.ts — הגדרות תפקידים ואדמינים עבור אתרי הרשת
// ============================================================

export interface StrapiUserItem {
	id: number;
	email: string;
	username: string;
	nickname: string;
	phone: string;
	city: string;
	avatarUrl: string;
	appRole: string;
}

export const SITE_PREDEFINED_ROLES: Record<string, { roleTitle: string; appRole: string }> = {
	portal: { roleTitle: 'מנהל ראשי', appRole: 'super_admin' },
	community_neighborhood: { roleTitle: 'רכז קהילה בשכונה', appRole: 'neighborhood_admin' },
	courts_reconciliation: { roleTitle: 'בורר / אב בית דין', appRole: 'ch_admin' },
	national_gemach: { roleTitle: 'רכז הגמ"ח הארצי', appRole: 'gemach_admin' },
	singles: { roleTitle: 'שדכן / רכז היכרויות', appRole: 'singles_admin' },
	lost_and_found: { roleTitle: 'רכז פינת האבדות', appRole: 'avd_admin' },
	neighborhood_committees: { roleTitle: 'רכז ועדי שכונות', appRole: 'committees_admin' },
	state_auditor: { roleTitle: 'מבקר רשויות המדינה', appRole: 'cr_admin' },
	public_rating: { roleTitle: 'רכז דירוג ציבורי', appRole: 'rating_admin' },
	experts: { roleTitle: 'רכז פאנל מומחים', appRole: 'experts_admin' },
	referendum: { roleTitle: 'רכז משאלי עם', appRole: 'referendum_admin' },
	purchasing_group: { roleTitle: 'רכז רכישות קבוצתיות', appRole: 'purchasing_admin' },
	professionals: { roleTitle: 'רכז בעלי מקצוע', appRole: 'idx_admin' },
	freedom_store: { roleTitle: 'מנהל חנות החירות', appRole: 'shop_admin' }
};
