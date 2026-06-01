// כל המחרוזות הנראות למשתמש מתורגמות באמצעות svelte-i18n.
// כאן שמורים רק מפתחות התרגום (titleKey/descriptionKey/ctaKey/hoverKey)
// וערכי עיצוב/קישור. הרכיב הצורך משתמש ב-$t כדי לשלוף את הטקסט בשפה הנוכחית.
export interface Ad {
    id: number;
    titleKey: string;
    descriptionKey: string;
    ctaKey: string;
    href: string;
    image: string;
    color: string;
    imageHeight?: string;   // גובה מותאם לתמונה (ברירת מחדל: auto)
    imageScale?: number;    // זום על התמונה (ברירת מחדל: 1)
    hoverKey?: string;      // tooltip בריחוף מעל כפתור ה-CTA
}

export const ads: Ad[] = [
    {
        id: 1,
        titleKey: "ads.peace_houses.title",
        descriptionKey: "ads.peace_houses.description",
        ctaKey: "ads.peace_houses.cta",
        href: "https://chachmim.vercel.app/",
        image: "/images/bati-hapius.png",
        color: "from-orange-600 to-red-600"
    },
    {
        id: 9,
        titleKey: "ads.national_gemach.title",
        descriptionKey: "ads.national_gemach.description",
        ctaKey: "ads.national_gemach.cta",
        hoverKey: "ads.national_gemach.hover",
        href: "https://national-gemach.vercel.app/",
        image: "/images/gemach-harzi.png",
        color: "from-pink-600 via-fuchsia-600 to-purple-700",
    },
    {
        id: 2,
        titleKey: "ads.neighborhood_committees.title",
        descriptionKey: "ads.neighborhood_committees.description",
        ctaKey: "ads.neighborhood_committees.cta",
        href: "https://neighborhoods-il.vercel.app/",
        image: "/images/news/vaadei-shchunot.png",
        color: "from-blue-600 to-cyan-600"
    },
    {
        id: 5,
        titleKey: "ads.state_auditor.title",
        descriptionKey: "ads.state_auditor.description",
        ctaKey: "ads.state_auditor.cta",
        href: "https://criticism.vercel.app/",
        image: "/images/mevaker-rashuyot.png",
        color: "from-blue-700 to-indigo-700",
        imageHeight: "120px",
        imageScale: 1.2,
    },
    {
        id: 10,
        titleKey: "ads.public_rating.title",
        descriptionKey: "ads.public_rating.description",
        ctaKey: "ads.public_rating.cta",
        href: "https://public-rating-il.vercel.app/",
        image: "/images/public-rating.jpeg",
        color: "from-indigo-600 to-blue-600",
        imageHeight: "200px",
        imageScale: 0.9,
    },
    {
        id: 8,
        titleKey: "ads.referendum.title",
        descriptionKey: "ads.referendum.description",
        ctaKey: "ads.referendum.cta",
        hoverKey: "ads.referendum.hover",
        href: "https://referendum-il.vercel.app/",
        image: "/images/referendum.png",
        color: "from-purple-600 to-indigo-700"
    },
    {
        id: 3,
        titleKey: "ads.purchasing_group.title",
        descriptionKey: "ads.purchasing_group.description",
        ctaKey: "ads.purchasing_group.cta",
        href: "https://purchasing-groups.vercel.app/",
        image: "/images/whatsapp_cta.png",
        color: "from-green-800 to-emerald-900"
    },
    {
        id: 4,
        titleKey: "ads.investors_club.title",
        descriptionKey: "ads.investors_club.description",
        ctaKey: "ads.investors_club.cta",
        href: "https://www.melecshop.com/page/free",
        image: "/images/partners/investments.png",
        color: "from-amber-600 to-orange-600"
    },
    {
        id: 6,
        titleKey: "ads.professionals.title",
        descriptionKey: "ads.professionals.description",
        ctaKey: "ads.professionals.cta",
        href: "https://index-chi-sage.vercel.app/",
        image: "/images/professionals.png",
        color: "from-yellow-500 to-orange-500"
    },
    {
        id: 11,
        titleKey: "ads.social_store.title",
        descriptionKey: "ads.social_store.description",
        ctaKey: "ads.social_store.cta",
        hoverKey: "ads.social_store.hover",
        href: "https://heirut-shop.vercel.app/",
        image: "/images/freedom-store.png",
        color: "from-emerald-600 to-teal-700"
    }
];
