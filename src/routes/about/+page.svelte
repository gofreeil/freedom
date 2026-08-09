<script lang="ts">
	// ============================================================
	// /about — דף האודות של שער הרשת.
	// כתוב בעברית ישירות (כמו /map) ולא דרך i18n: זהו טקסט מותג ארוך,
	// והתחזוקה שלו בשלוש שפות ב-i18n.ts הייתה יקרה מהתועלת.
	//
	// רשימת הפלטפורמות נגזרת מ-sitesData.ts (מקור האמת של הרשת) — כך
	// שהוספת אתר לרשת מתגלגלת לכאן אוטומטית ואין רשימה כפולה לתחזק.
	// ============================================================
	import Seo from '$lib/components/Seo.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import {
		SITE_TAGLINE,
		CONTACT_EMAIL,
		aboutPageSchema,
		organizationSchema,
		breadcrumbSchema
	} from '$lib/seo';
	import { SITES, type SiteCategory } from '$lib/sitesData';

	const CATEGORY_ORDER: SiteCategory[] = ['קהילה', 'משילות', 'כלכלה'];

	const catMeta: Record<string, { icon: string; blurb: string }> = {
		'קהילה': {
			icon: '🤝',
			blurb: 'הרשת החברתית של השכונה — עזרה הדדית, פתרון סכסוכים והחזרת אבידות.'
		},
		'משילות': {
			icon: '⚖️',
			blurb: 'הכלים שמחזירים את הפיקוח לידי הציבור — ביקורת, דירוג, ייצוג והצבעה.'
		},
		'כלכלה': {
			icon: '💰',
			blurb: 'כוח קנייה משותף — מחירים הוגנים, בעלי מקצוע כשירים ומוצרים לחיים עצמאיים.'
		}
	};

	// האתרים מקובצים לפי קטגוריה; "ראשי" (שער הרשת עצמו) לא מוצג — אנחנו בו.
	const groups = CATEGORY_ORDER.map((category) => ({
		category,
		...catMeta[category],
		sites: SITES.filter((s) => s.category === category)
	})).filter((g) => g.sites.length > 0);

	const principles = [
		{
			icon: '🆓',
			title: 'חינם, תמיד',
			text: 'כל הפלטפורמות פתוחות לשימוש ללא תשלום. הפעילות מבוססת התנדבות, והמימון מגיע מפרסום מקומי ומחנות החירות.'
		},
		{
			icon: '🏘️',
			title: 'מקומי לפני ארצי',
			text: 'הכוח נמצא בשכונה. כל כלי ברשת נבנה כדי לחזק קודם כול את מי שגר לידך — ורק אחר כך את התמונה הארצית.'
		},
		{
			icon: '🛠️',
			title: 'מעשי, לא הצהרתי',
			text: 'לא מחאה ולא מניפסט. כל תחום מקבל פלטפורמה עובדת שאפשר להשתמש בה כבר היום — גמ״ח, בורר, בעל מקצוע, קבוצת רכישה.'
		},
		{
			icon: '🔎',
			title: 'שקיפות ואחריותיות',
			text: 'פעולות עובדי הציבור מתועדות, מדורגות ונחשפות. ציבור שרואה מה נעשה בשמו הוא ציבור שאפשר לתת בו אמון.'
		},
		{
			icon: '🕊️',
			title: 'זהות אחת לכל הרשת',
			text: 'נרשמים פעם אחת — ומזוהים בכל אתרי הרשת, בלי הרשמה חוזרת ובלי עוד סיסמה לזכור.'
		},
		{
			icon: '🌱',
			title: 'נבנה בידי המשתמשים',
			text: 'התוכן, הביקורת והדירוגים מגיעים מהתושבים עצמם. אנחנו מספקים את הכלים; הקהילה מספקת את התוכן.'
		}
	];

	const faqs = [
		{
			q: 'מי עומד מאחורי התנועה?',
			a: 'קבוצת מתנדבים מכל הארץ — תושבים, בעלי מקצוע ואנשי תוכן — שמאמינים שאפשר לבנות חלופה מעשית במקום לחכות שמישהו אחר יבנה אותה. אין כאן מפלגה, אין גוף מסחרי ואין שיוך פוליטי.'
		},
		{
			q: 'איך התנועה ממומנת?',
			a: 'מפרסום מקומי בשטחי המודעות שבאתרים, ומהכנסות חנות החירות. אין דמי חבר, אין מנוי ואין תשלום על אף אחת מהפלטפורמות.'
		},
		{
			q: 'מה עושים עם הפרטים שלי?',
			a: 'ההרשמה משמשת אך ורק לזיהוי שלכם ברחבי הרשת. אנחנו לא מוכרים פרטים ולא מעבירים אותם לגורם שלישי.'
		},
		{
			q: 'אני רוצה לתרום מזמני — איפה מתחילים?',
			a: 'כמעט כל פלטפורמה זקוקה לידיים: בוררים בבתי הפיוס, מרכזי גמ״ח, פעילי ועד שכונה, מומחי תוכן ומתנדבי ביקורת. הירשמו, בחרו את התחום הקרוב אליכם, וכתבו לנו — נחבר אתכם לצוות הנכון.'
		}
	];

	const socials = [
		{ label: 'פייסבוק', icon: '📘', href: 'https://www.facebook.com/share/17iu4gtxZH/' },
		{ label: 'יוטיוב', icon: '▶️', href: 'https://www.youtube.com/@freedomhasbegun' },
		{ label: 'טלגרם', icon: '✈️', href: 'https://t.me/freedomisrael' },
		{ label: 'טיקטוק', icon: '🎵', href: 'https://www.tiktok.com/@yahav_anter' }
	];

	const schemas = [
		aboutPageSchema(),
		organizationSchema(),
		breadcrumbSchema([
			{ name: 'יוצאים לחירות', path: '/' },
			{ name: 'אודות', path: '/about' }
		])
	];
</script>

<Seo
	title="אודות יוצאים לחירות — מי אנחנו, במה אנחנו מאמינים ואיך מצטרפים"
	description="יוצאים לחירות היא תנועה חברתית התנדבותית שבונה חלופה מעשית בשטח: קהילות שכונתיות, בתי פיוס, גמ״חים, ועדי שכונות, ביקורת ציבורית, משאלי עם ורכישות קבוצתיות. כל הפלטפורמות פתוחות וחינמיות."
	path="/about"
	keywords="אודות יוצאים לחירות, מי אנחנו, תנועה חברתית, התנדבות, קהילה, gofreeil"
/>
<JsonLd data={schemas} />

<div class="mx-auto max-w-5xl px-4 py-8" dir="rtl">
	<!-- ═══════ פתיח ═══════ -->
	<header class="mb-10 text-center">
		<img
			src="/images/yotzim-lecherut.png"
			alt="לוגו יוצאים לחירות"
			class="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-amber-400/30 bg-white object-cover shadow-lg sm:h-28 sm:w-28"
		/>
		<h1
			class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-black text-transparent sm:text-5xl"
		>
			יוצאים לחירות
		</h1>
		<p class="mt-2 text-base font-extrabold text-amber-300 sm:text-lg">{SITE_TAGLINE}</p>
		<p class="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
			אנחנו תנועה חברתית ישראלית התנדבותית שלא מחכה שמישהו יתקן — אלא בונה.
			במקום להסביר איך העולם צריך להיראות, הקמנו את הכלים שמאפשרים לו להיראות ככה כבר היום:
			רשת של פלטפורמות שכל אחת פותרת בעיה אמיתית אחת, וכולן מחוברות לאותה קהילה ולאותה זהות.
		</p>
	</header>

	<!-- ═══════ הרעיון ═══════ -->
	<section class="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg sm:p-8">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">💡</span> הרעיון שמאחורי הרשת
		</h2>
		<div class="space-y-4 text-sm leading-relaxed text-gray-300 sm:text-base">
			<p>
				רוב הבעיות שאנחנו פוגשים ביום-יום הן מקומיות: סכסוך שנתקע שנים בבית משפט, ציוד שנקנה
				בשלמות כשלשכן ממול הוא מונח ללא שימוש, מחיר מנופח כי כל אחד קונה לבד, ועד שכונה שאין
				לו כוח מול הרשות, ופקיד שאיש לא בודק את עבודתו.
			</p>
			<p>
				<span class="font-bold text-white">אף אחת מהבעיות האלה לא דורשת רשות מאף אחד כדי להיפתר.</span>
				היא דורשת רק שהאנשים הנכונים יידעו זה על זה. זה בדיוק מה שהרשת עושה: מחברת בין מי שצריך
				למי שיכול — בשכונה, בעיר ובמדינה.
			</p>
			<p>
				כל פלטפורמה עומדת בפני עצמה ואפשר להשתמש בה בנפרד, אבל יחד הן יוצרות משהו גדול יותר:
				מרחב שבו אפשר לחיות, לפתור בעיות ולהתנהל — בלי להיות תלויים במערכות שהפסיקו לשרת אותנו.
			</p>
		</div>
	</section>

	<!-- ═══════ עקרונות ═══════ -->
	<section class="mb-10">
		<h2 class="mb-5 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">🧭</span> העקרונות שלנו
			<span class="h-px flex-1 bg-white/10"></span>
		</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each principles as p (p.title)}
				<div
					class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg transition hover:border-amber-400/30 hover:bg-white/[0.06]"
				>
					<div class="mb-2 text-2xl" aria-hidden="true">{p.icon}</div>
					<h3 class="mb-1.5 text-base font-black text-white">{p.title}</h3>
					<p class="text-sm leading-relaxed text-gray-400">{p.text}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ═══════ הפלטפורמות ═══════ -->
	<section class="mb-10">
		<h2 class="mb-2 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">🌐</span> הפלטפורמות של הרשת
			<span class="h-px flex-1 bg-white/10"></span>
		</h2>
		<p class="mb-5 text-sm text-gray-400">
			{SITES.length} אתרים, שלושה תחומים — כולם פתוחים, חינמיים ומחוברים לאותה הרשמה.
		</p>

		{#each groups as group (group.category)}
			<div class="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-lg sm:p-6">
				<h3 class="flex items-center gap-2 text-lg font-black text-white">
					<span aria-hidden="true">{group.icon}</span>
					{group.category}
				</h3>
				<p class="mb-4 mt-1 text-sm text-gray-400">{group.blurb}</p>
				<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{#each group.sites as site (site.id)}
						<li>
							<a
								href={site.url}
								target="_blank"
								rel="noopener noreferrer"
								class="flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-purple-400/40 hover:bg-white/[0.07]"
							>
								{#if site.image}
									<img
										src={site.image}
										alt=""
										loading="lazy"
										class="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
									/>
								{/if}
								<span class="min-w-0">
									<span class="block text-sm font-black leading-tight text-white">{site.name}</span>
									<span class="mt-1 block text-xs leading-relaxed text-gray-400">{site.description}</span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}

		<div class="text-center">
			<a
				href="/map"
				class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-bold text-gray-200 transition hover:bg-white/10"
			>
				🗺️ למפת הרשת המלאה
			</a>
		</div>
	</section>

	<!-- ═══════ שאלות נפוצות ═══════ -->
	<section class="mb-10">
		<h2 class="mb-5 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">❓</span> שאלות שנשאלות הרבה
			<span class="h-px flex-1 bg-white/10"></span>
		</h2>
		<div class="space-y-3">
			{#each faqs as faq (faq.q)}
				<details class="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg">
					<summary
						class="cursor-pointer list-none text-base font-black text-white transition hover:text-amber-300"
					>
						<span class="ml-2 inline-block text-amber-400 transition-transform group-open:rotate-90" aria-hidden="true">◂</span>
						{faq.q}
					</summary>
					<p class="mt-3 text-sm leading-relaxed text-gray-300">{faq.a}</p>
				</details>
			{/each}
		</div>
	</section>

	<!-- ═══════ הצטרפות ═══════ -->
	<section
		class="rounded-3xl border border-amber-500/25 bg-gradient-to-l from-amber-500/10 to-pink-600/10 p-6 text-center shadow-lg sm:p-8"
	>
		<h2 class="text-xl font-black text-white sm:text-2xl">🕊️ הרשמה אחת — נוכחות בכל הרשת</h2>
		<p class="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-amber-100/90 sm:text-base">
			מי שנרשם אצלנו מזוהה אוטומטית בכל אתרי יוצאים לחירות. בלי הרשמה חוזרת, בלי עוד סיסמה —
			ועם גישה מלאה לכל הפלטפורמות.
		</p>
		<div class="mt-5 flex flex-wrap justify-center gap-3">
			<a
				href="/register?redirect=/about"
				class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-black text-white transition hover:opacity-90"
			>
				✨ הרשמה
			</a>
			<a
				href="/login?redirect=/about"
				class="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-bold text-gray-200 transition hover:bg-white/10"
			>
				כבר רשומים? התחברות
			</a>
			<a
				href="mailto:{CONTACT_EMAIL}"
				class="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-bold text-gray-200 transition hover:bg-white/10"
			>
				✉️ צרו קשר
			</a>
		</div>

		<div class="mt-6 flex flex-wrap items-center justify-center gap-2">
			{#each socials as s (s.href)}
				<a
					href={s.href}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-gray-300 transition hover:bg-white/10 hover:text-white"
				>
					<span aria-hidden="true">{s.icon}</span>{s.label}
				</a>
			{/each}
		</div>
	</section>
</div>
