<script lang="ts">
	// ============================================================
	// /about — דף האודות של שער הרשת.
	// כתוב בעברית ישירות ולא דרך i18n: זהו טקסט מותג ארוך,
	// והתחזוקה שלו בשלוש שפות ב-i18n.ts הייתה יקרה מהתועלת.
	//
	// רשימת הפלטפורמות נגזרת מ-sitesData.ts (מקור האמת של הרשת) — כך
	// שהוספת אתר לרשת מתגלגלת לכאן אוטומטית ואין רשימה כפולה לתחזק.
	// ============================================================
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import Seo from '$lib/components/Seo.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import NetworkAdmins from '$lib/components/NetworkAdmins.svelte';
	import {
		SITE_TAGLINE,
		CONTACT_EMAIL,
		aboutPageSchema,
		organizationSchema,
		breadcrumbSchema,
		faqSchema
	} from '$lib/seo';
	import { SITES, type SiteCategory } from '$lib/sitesData';
	import { ABOUT_FAQ } from '$lib/aboutFaq';

	let { data } = $props();

	// ── כרטיסיות ──
	// "ניהול הרשת" יושב כאן ולא בדף נפרד: זה חלק מהסיפור של "מי אנחנו".
	// הכרטיסייה הפעילה נשמרת ב-?tab= כדי שאפשר יהיה לשלוח קישור ישיר אליה.
	type Tab = 'about' | 'network';
	const TABS: { id: Tab; label: string; icon: string }[] = [
		{ id: 'about', label: 'אודות', icon: '🕊️' },
		{ id: 'network', label: 'ניהול הרשת', icon: '🛡️' }
	];
	let tab = $state<Tab>(page.url.searchParams.get('tab') === 'network' ? 'network' : 'about');

	function selectTab(next: Tab) {
		tab = next;
		const url = new URL(page.url);
		if (next === 'about') url.searchParams.delete('tab');
		else url.searchParams.set('tab', next);
		replaceState(url, page.state);
	}

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

	// השו"ת חי ב-$lib/aboutFaq.ts — מקור אמת אחד לתצוגה ולסכמת FAQPage שלמטה.
	const faqs = ABOUT_FAQ;

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
		]),
		// FAQPage — משקפת בדיוק את השו"ת שמוצג בדף (דף הבית מחזיק FAQPage משלו עם שאלות אחרות)
		faqSchema(faqs)
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
	<header class="mb-8 text-center">
		<img
			src="/images/yotzim-lecherut.webp"
			alt="לוגו יוצאים לחירות — יונה ממריאה מכפות ידיים פתוחות"
			width="1164"
			height="664"
			decoding="async"
			class="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-amber-400/30 bg-white object-cover shadow-lg sm:h-28 sm:w-28"
		/>
		<h1
			class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-black text-transparent sm:text-5xl"
		>
			יוצאים לחירות
		</h1>
		<p class="mt-2 text-base font-extrabold text-amber-300 sm:text-lg">{SITE_TAGLINE}</p>
		<div class="mx-auto mt-4 max-w-3xl space-y-3 text-base leading-relaxed text-gray-300 sm:text-lg">
			<p>
				אנו תנועה חברתית ישראלית א-פוליטית הלוקחת את מושג האחריות צעד קדימה, ופועלת לקדם את
				החברה בישראל לחיזוק הסולידריות, האחריות והחירות!
			</p>
			<p>
				אנו קהילה שהולכת וגדלה, המגובשת סביב זכויות הפרט, ריכוז כוח כלכלי, ופיקוח וביקורת על
				רשויות המדינה — על מנת לקדם חזון של חיים חופשיים בהרמוניה עם כלל תושבי הארץ.
			</p>
			<p>
				הפרקטיקה שלנו מבוצעת על ידי התאגדות של שכונות בכל הארץ לגוף עממי אחד, כאשר בראש כל שכונה
				עומד רכז / ועד שכונתי המקדם את האינטרסים של אותה שכונה מול רשויות המדינה.
			</p>
			<p>
				הקמנו רשת פלטפורמות שכל אחת מהן פותרת בעיה ציבורית אחת ומאפשרת לנו לגבש את הכוח הציבורי
				כולו לטובת חזון זה. כל אחת מהפלטפורמות ממנפת את חברתה, בתקווה להתקדם לחיים סולידריים
				שבהם העם הוא חכם ואחראי, ויש לו שליטה על מוסדותיו!
			</p>
		</div>
	</header>

	<!-- ═══════ כרטיסיות ═══════ -->
	<div class="mb-6 flex justify-center gap-2" role="tablist" aria-label="תוכן דף האודות">
		{#each TABS as t (t.id)}
			<button
				type="button"
				role="tab"
				id="tab-{t.id}"
				aria-selected={tab === t.id}
				aria-controls="panel-{t.id}"
				onclick={() => selectTab(t.id)}
				class="rounded-xl px-5 py-2.5 text-sm font-black transition {tab === t.id
					? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
					: 'border border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}"
			>
				<span aria-hidden="true">{t.icon}</span>
				{t.label}
			</button>
		{/each}
	</div>

	{#if tab === 'network'}
		<div id="panel-network" role="tabpanel" aria-labelledby="tab-network">
			<NetworkAdmins canEdit={!!data.user?.isSuperAdmin} />
		</div>
	{:else}
	<div id="panel-about" role="tabpanel" aria-labelledby="tab-about">
	<!-- ═══════ עקרונות ═══════ -->
	<section class="mb-10">
		<h2 class="mb-5 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">🧭</span> העקרונות שלנו
			<span class="h-px flex-1 bg-white/10"></span>
		</h2>
		<!-- רשת קווים לא מחוברת (כמו באודות של קהילה בשכונה): בלי כרטיסים, רק קווי הפרדה קצרים -->
		<div class="principles-net grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
			{#each principles as p (p.title)}
				<div class="relative flex items-start gap-4 px-5 py-6">
					<span class="mt-0.5 flex-shrink-0 text-3xl" aria-hidden="true">{p.icon}</span>
					<div class="min-w-0">
						<h3 class="mb-1.5 text-base font-black text-amber-300">{p.title}</h3>
						<p class="text-sm leading-relaxed text-gray-300">{p.text}</p>
					</div>
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
										width="56"
										height="56"
										loading="lazy"
										decoding="async"
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
	</section>

	<!-- ═══════ שאלות נפוצות ═══════ -->
	<section id="faq" aria-labelledby="faq-title" class="mb-10">
		<h2 id="faq-title" class="mb-5 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">❓</span> שאלות שנשאלות הרבה
			<span class="h-px flex-1 bg-white/10"></span>
		</h2>
		<div class="space-y-3">
			{#each faqs as faq, i (faq.q)}
				<!-- שתי הראשונות פתוחות כברירת מחדל: הטקסט גלוי כבר ב-SSR בלי לחיצה -->
				<details open={i < 2} class="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg">
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
	{/if}
</div>

<style>
	/* קווי הפרדה קצרים שלא נוגעים זה בזה — אופקי מתחת לתא, אנכי בצד השמאלי (RTL: בין תא לתא הבא) */
	.principles-net > div::after,
	.principles-net > div::before {
		content: '';
		position: absolute;
		background: rgb(255 255 255 / 0.1);
		display: none;
	}
	.principles-net > div::after {
		bottom: 0;
		left: 10%;
		right: 10%;
		height: 1px;
	}
	.principles-net > div::before {
		top: 12%;
		bottom: 12%;
		left: 0;
		width: 1px;
	}
	/* עמודה אחת */
	.principles-net > div:not(:last-child)::after {
		display: block;
	}
	/* שתי עמודות */
	@media (min-width: 640px) {
		.principles-net > div:not(:last-child)::after {
			display: none;
		}
		.principles-net > div:not(:nth-last-child(-n + 2))::after,
		.principles-net > div:nth-child(2n + 1)::before {
			display: block;
		}
	}
	/* שלוש עמודות */
	@media (min-width: 1024px) {
		.principles-net > div:not(:nth-last-child(-n + 2))::after,
		.principles-net > div:nth-child(2n + 1)::before {
			display: none;
		}
		.principles-net > div:not(:nth-last-child(-n + 3))::after,
		.principles-net > div:not(:nth-child(3n))::before {
			display: block;
		}
	}
</style>
