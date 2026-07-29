// ============================================================
// seo.ts — מקור אמת יחיד ל-SEO + Structured Data (JSON-LD)
//
// gofreeil.com הוא אתר האם של הרשת, ולכן ה-Organization כאן מצהיר על כל
// אתרי הרשת כ-subOrganization. זה הצומת שממנו גוגל ומנועי ה-AI לומדים
// שכל האתרים הם ישות אחת — "יוצאים לחירות" — ומחלקים ביניהם את האמון.
// ============================================================

import { SITES } from '$lib/sitesData';

/** הדומיין הקנוני היחיד. כל canonical / og:url / sitemap מצביעים לכאן. */
export const SITE_URL = 'https://gofreeil.com';
export const SITE_NAME = 'יוצאים לחירות';
export const SITE_TAGLINE = 'מתקדמים לעולם סולידרי, אחראי וחופשי';
export const SITE_DESCRIPTION =
    'יוצאים לחירות — תנועה חברתית שבונה חלופה מעשית: קהילות שכונתיות, בתי פיוס לבוררות, מאגר הגמ"חים הארצי, פינת האבדות, אינדקס בעלי מקצוע, רכישות קבוצתיות שמורידות מחירים, ועדי שכונות, ביקורת ציבורית על הרשויות ומשאלי עם. כל הפלטפורמות במקום אחד, לכל תושב בישראל.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/yotzim-lecherut.png`;
export const SITE_LOGO = `${SITE_URL}/images/yotzim-lecherut.png`;
export const CONTACT_EMAIL = 'freedomhasbegun@gmail.com';

/** בונה URL מוחלט קנוני מנתיב יחסי. */
export function canonical(path = '/'): string {
    if (!path.startsWith('/')) path = '/' + path;
    return path === '/' ? SITE_URL : SITE_URL + path;
}

// ============================================================
// ---- רשת "יוצאים לחירות" ----
// הרשימה נגזרת מ-sitesData.ts (מקור האמת של הרשת), בתוספת התיאורים
// המשמשים כעוגן וכ-title לקישורים בפוטר ובקישורי הרשת.
// ============================================================

export interface NetworkSiteLink {
    name: string;
    url: string;
    description: string;
}

/** כל אתרי הרשת חוץ מאתר האם עצמו — לקישורים ול-subOrganization. */
export const OTHER_NETWORK_SITES: NetworkSiteLink[] = SITES.filter((s) => s.id !== 'portal').map(
    (s) => ({
        name: s.name,
        // ללא סלאש בסוף — כדי שכל הקישורים ברשת ייראו זהים למנועי החיפוש
        url: s.url.replace(/\/$/, ''),
        description: s.description,
    }),
);

/** כל הרשת כולל אתר האם — ל-llms.txt ולסכמות. */
export const NETWORK_SITES: NetworkSiteLink[] = [
    { name: SITE_NAME, url: SITE_URL, description: SITE_TAGLINE },
    ...OTHER_NETWORK_SITES,
];

// ============================================================
// ---- מחוללי schema.org (JSON-LD) ----
// ============================================================

/** WebSite — זהות האתר, שפה וקישורי הרשת */
export function websiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: ['gofreeil', 'Going to Freedom', 'התנועה החברתית יוצאים לחירות'],
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: 'he-IL',
        publisher: { '@id': `${SITE_URL}/#organization` },
        relatedLink: OTHER_NETWORK_SITES.map((s) => s.url),
    };
}

/**
 * Organization — הישות המרכזית של הרשת.
 * subOrganization מונה את כל אתרי הרשת, כך שכל אתר-בת מזוהה כחלק מהמותג.
 */
export function organizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: 'gofreeil',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: SITE_LOGO },
        image: SITE_LOGO,
        description: SITE_DESCRIPTION,
        email: CONTACT_EMAIL,
        foundingLocation: { '@type': 'Country', name: 'Israel' },
        areaServed: { '@type': 'Country', name: 'Israel' },
        inLanguage: 'he-IL',
        knowsAbout: [
            'קהילה שכונתית',
            'גמ"חים',
            'בוררות ופיוס',
            'אבידות ומציאות',
            'בעלי מקצוע',
            'רכישות קבוצתיות',
            'ועדי שכונות',
            'ביקורת ציבורית',
            'משאלי עם',
        ],
        subOrganization: OTHER_NETWORK_SITES.map((s) => ({
            '@type': 'Organization',
            name: s.name,
            url: s.url,
            description: s.description,
        })),
        sameAs: [
            'https://www.facebook.com/share/17iu4gtxZH/',
            'https://www.youtube.com/@freedomhasbegun',
            'https://t.me/freedomisrael',
            'https://www.tiktok.com/@yahav_anter',
            ...OTHER_NETWORK_SITES.map((s) => s.url),
        ],
    };
}

/** ItemList — רשימת הפלטפורמות של הרשת, לדף הבית */
export function networkItemListSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'הפלטפורמות של יוצאים לחירות',
        numberOfItems: OTHER_NETWORK_SITES.length,
        itemListElement: OTHER_NETWORK_SITES.map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: s.name,
            description: s.description,
            url: s.url,
        })),
    };
}

/** פירורי לחם — מסלול ניווט שגוגל מציג בתוצאות */
export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            item: canonical(it.path),
        })),
    };
}

/** FAQPage — שאלות ותשובות שגוגל ו-AI אוהבים לצטט */
export function faqSchema(qa: Array<{ q: string; a: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: qa.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
        })),
    };
}
