// ============================================================
// sitemap.xml — מפת האתר של שער הרשת. האתר עצמו קטן (שער + מפת רשת),
// והערך העיקרי הוא הצהרה על הדפים הציבוריים לגוגל.
// אתרי הרשת עצמם מפרסמים כל אחד sitemap משלו בדומיין שלו.
// ============================================================

import type { RequestHandler } from './$types';
import { SITE_URL } from '$lib/seo';

export const prerender = false;

export const GET: RequestHandler = async ({ setHeaders }) => {
    const urls = [
        { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
        { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: '0.8' },
        { loc: `${SITE_URL}/map`, changefreq: 'monthly', priority: '0.7' },
    ];

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls
            .map(
                (u) =>
                    `  <url>\n` +
                    `    <loc>${u.loc}</loc>\n` +
                    `    <changefreq>${u.changefreq}</changefreq>\n` +
                    `    <priority>${u.priority}</priority>\n` +
                    `  </url>`,
            )
            .join('\n') +
        `\n</urlset>`;

    setHeaders({
        'Content-Type': 'application/xml',
        'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=7200',
    });
    return new Response(xml);
};
