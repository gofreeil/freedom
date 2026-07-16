// ============================================================
// רשימת האתרים ברשת "יוצאים לחירות".
// מקור אמת יחיד עבור פאנל הסופר-אדמין (src/routes/admin).
// כשמוסיפים/מסירים אתר מהרשת — מעדכנים כאן בלבד.
// ה-id הוא מזהה יציב ומשמש כמפתח לשמירת מינוי האדמין; אין לשנותו.
// ============================================================

export type SiteCategory = 'ראשי' | 'קהילה' | 'משילות' | 'כלכלה';

export interface FreedomSite {
	/** מזהה יציב (מפתח לשמירת המינוי) — לא לשנות אחרי שהוגדר */
	id: string;
	/** שם האתר בעברית */
	name: string;
	/** תיאור קצר */
	description: string;
	/** כתובת האתר */
	url: string;
	/** תמונה מייצגת (מתוך static/) */
	image?: string;
	/** קטגוריה לקיבוץ בפאנל */
	category: SiteCategory;
}

export const SITES: FreedomSite[] = [
	{
		id: 'portal',
		name: 'יוצאים לחירות',
		description: 'עמוד הבית של הרשת — שער לכל הפלטפורמות.',
		url: 'https://gofreeil.com/',
		image: '/images/yotzim-lecherut.png',
		category: 'ראשי'
	},
	{
		id: 'community_neighborhood',
		name: 'קהילה בשכונה',
		description: 'מגבשים את התושבים ומפתחים כל שכונה לקהילה תומכת ומשגשגת.',
		url: 'https://community.gofreeil.com/',
		image: '/images/community-neighborhood.webp',
		category: 'קהילה'
	},
	{
		id: 'courts_reconciliation',
		name: 'בתי דין ופיוס',
		description: 'מסייעים לפתור סכסוכים ובעיות במהירות וביעילות.',
		url: 'https://chachmim.gofreeil.com/',
		image: '/images/bati-hapius.webp',
		category: 'קהילה'
	},
	{
		id: 'national_gemach',
		name: 'הגמ"ח הארצי',
		description: 'מנגישים את הגמחים בארץ, תורמים ומחזקים איש את רעהו.',
		url: 'https://gemach.gofreeil.com/',
		image: '/images/gemach-harzi.webp',
		category: 'קהילה'
	},
	{
		id: 'neighborhood_committees',
		name: 'ועדי שכונות',
		description: 'ועדי שכונות מאוחדים, נאבקים על זכויות העם מול הרשויות.',
		url: 'https://neighborhoods.gofreeil.com/',
		image: '/images/news/vaadei-shchunot.webp',
		category: 'משילות'
	},
	{
		id: 'state_auditor',
		name: 'מבקר רשויות המדינה',
		description: 'העם מבקר, חושף שחיתויות ומפקח על רשויות המדינה.',
		url: 'https://criticism.gofreeil.com/',
		image: '/images/mevaker-rashuyot.webp',
		category: 'משילות'
	},
	{
		id: 'public_rating',
		name: 'דירוג ציבורי',
		description: 'מפרסמים את פעולות עובדי הציבור ומדרגים את יעילותם.',
		url: 'https://rating.gofreeil.com/',
		image: '/images/public-rating.webp',
		category: 'משילות'
	},
	{
		id: 'experts',
		name: 'המומחים',
		description: 'מומחים בכל תחום מתדיינים, מציעים פתרונות ומקדמים את המדינה.',
		url: 'https://experts.gofreeil.com/',
		image: '/images/the-experts.webp',
		category: 'משילות'
	},
	{
		id: 'referendum',
		name: 'משאלי העם',
		description: 'מצביעים ומביעים את דעת הקהל בסוגיות הארציות.',
		url: 'https://referendum.gofreeil.com/',
		image: '/images/referendum.webp',
		category: 'משילות'
	},
	{
		id: 'purchasing_group',
		name: 'קבוצות רכישה',
		description: 'הצטרפות לקבוצת הרכישה והוזלת ההוצאות.',
		url: 'https://groups.gofreeil.com/',
		image: '/images/whatsapp_cta.webp',
		category: 'כלכלה'
	},
	{
		id: 'professionals',
		name: 'בעלי המקצוע שלנו',
		description: 'מאתרים בקלות בעלי מקצוע כשירים עם הטבות לקהילה.',
		url: 'https://index.gofreeil.com/',
		image: '/images/professionals.webp',
		category: 'כלכלה'
	},
	{
		id: 'freedom_store',
		name: 'חנות החירות',
		description: 'בריאות טבעית, חקלאות ביתית, טכנולוגיה מתקדמת ועוד.',
		url: 'https://shop.gofreeil.com/',
		image: '/images/freedom-store.webp',
		category: 'כלכלה'
	}
];

/** מציאת אתר לפי מזהה */
export function getSite(id: string): FreedomSite | undefined {
	return SITES.find((s) => s.id === id);
}
