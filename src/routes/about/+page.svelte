<script lang="ts">
	// ============================================================
	// /about — דף האודות של שער הרשת.
	// הטקסטים בשלוש השפות ב-$lib/aboutContent.ts (לא ב-i18n.ts: טקסט מותג ארוך).
	// השו"ת נשאר בעברית בלבד בינתיים; גם ה-SEO וה-JSON-LD בעברית (SSR).
	// ============================================================
	import { onMount } from 'svelte';
	import { locale } from 'svelte-i18n';
	import Seo from '$lib/components/Seo.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import NetworkAdmins from '$lib/components/NetworkAdmins.svelte';
	import {
		CONTACT_EMAIL,
		aboutPageSchema,
		organizationSchema,
		breadcrumbSchema,
		faqSchema
	} from '$lib/seo';
	import { ABOUT_FAQ, faqParts, faqPlain } from '$lib/aboutFaq';
	import { ABOUT_TEXT, aboutLang } from '$lib/aboutContent';
	import { networkSites } from '$lib/networkSites';

	const tx = $derived(ABOUT_TEXT[aboutLang($locale)]);

	// השו"ת חי ב-$lib/aboutFaq.ts — מקור אמת אחד לתצוגה ולסכמת FAQPage שלמטה.
	const faqs = ABOUT_FAQ;

	// רקע קומת השו"ת: אותו וידאו מפל כמו בדף הבית (/images/bg.mp4, נשמר במטמון הדפדפן).
	// ה-poster מוצג מיד; הוידאו נטען רק כשהקומה מתקרבת למסך, ולא למי שביקש פחות תנועה / חיסכון בנתונים / חיבור איטי.
	let faqEl: HTMLElement | undefined = $state();
	let faqVideoSrc = $state('');
	onMount(() => {
		if (!faqEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const conn = (navigator as any).connection;
		if (conn?.saveData || /(^|-)2g$|^3g$/.test(conn?.effectiveType ?? '')) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					faqVideoSrc = '/images/bg.mp4';
					observer.disconnect();
				}
			},
			{ rootMargin: '400px' }
		);
		observer.observe(faqEl);
		return () => observer.disconnect();
	});

	const socials = $derived([
		{ label: tx.socials.facebook, icon: '📘', href: 'https://www.facebook.com/share/17iu4gtxZH/' },
		{ label: tx.socials.youtube, icon: '▶️', href: 'https://www.youtube.com/@freedomhasbegun' },
		{ label: tx.socials.telegram, icon: '✈️', href: 'https://t.me/freedomisrael' },
		{ label: tx.socials.tiktok, icon: '🎵', href: 'https://www.tiktok.com/@yahav_anter' }
	]);

	const schemas = [
		aboutPageSchema(),
		organizationSchema(),
		breadcrumbSchema([
			{ name: 'יוצאים לחירות', path: '/' },
			{ name: 'אודות', path: '/about' }
		]),
		// FAQPage — משקפת בדיוק את השו"ת שמוצג בדף (דף הבית מחזיק FAQPage משלו עם שאלות אחרות)
		faqSchema(faqs.map((f) => ({ q: f.q, a: faqPlain(f.a) })))
	];
</script>

<Seo
	title="אודות יוצאים לחירות — מי אנחנו, במה אנחנו מאמינים ואיך מצטרפים"
	description="יוצאים לחירות היא תנועה חברתית התנדבותית שבונה חלופה מעשית בשטח: קהילות שכונתיות, בתי פיוס, גמ״חים, ועדי שכונות, ביקורת ציבורית, משאלי עם ורכישות קבוצתיות. כל הפלטפורמות פתוחות וחינמיות."
	path="/about"
	keywords="אודות יוצאים לחירות, מי אנחנו, תנועה חברתית, התנדבות, קהילה, gofreeil"
/>
<JsonLd data={schemas} />

<div class="mx-auto max-w-5xl px-4 py-8" dir={tx.dir}>
	<!-- ═══════ פתיח ═══════ -->
	<header class="mb-8 text-center">
		<img
			src="/images/yotzim-lecherut.webp"
			alt={tx.logoAlt}
			width="1164"
			height="664"
			decoding="async"
			class="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-amber-400/30 bg-white object-cover shadow-lg sm:h-28 sm:w-28"
		/>
		<h1
			class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-black text-transparent sm:text-5xl"
		>
			{tx.title}
		</h1>
		<p class="mt-2 text-base font-extrabold text-amber-300 sm:text-lg">{tx.tagline}</p>
		<div class="mx-auto mt-4 max-w-3xl space-y-3 text-base leading-relaxed text-gray-300 sm:text-lg">
			{#each tx.intro as para (para)}
				<p>{para}</p>
			{/each}
		</div>
	</header>

	<!-- ═══════ אתרי הרשת — אותה רשת לוגואים כמו במסך הפתיחה אחרי הרשמה (WelcomeScreen) ═══════ -->
	<section class="mb-10">
		<h2 class="mb-5 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">🌐</span> {tx.sitesTitle}
			<span class="h-px flex-1 bg-white/10"></span>
		</h2>
		<div class="flex flex-wrap justify-center gap-2 sm:gap-3" dir="rtl" aria-label={tx.sitesTitle}>
			{#each networkSites as site (site.id)}
				<a
					href={site.href}
					target="_blank"
					rel="noopener noreferrer"
					title={site.title}
					class="group flex grow-0 basis-[calc(33.333%-0.34rem)] flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#1b2335] p-2 transition-all hover:-translate-y-0.5 hover:border-purple-400/40 hover:bg-[#272f3f] sm:basis-[calc(25%-0.57rem)] sm:p-3 lg:basis-[calc(20%-0.6rem)]"
				>
					<div class="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br {site.color}">
						<img
							src={site.image}
							alt=""
							loading="lazy"
							decoding="async"
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					</div>
					<span class="line-clamp-2 text-center text-xs font-semibold leading-tight text-gray-200 sm:text-sm">{site.title}</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- ═══════ צוות הרכזים — מי אחראי על כל אתר ברשת ═══════ -->
	<div class="mb-10">
		<NetworkAdmins />
	</div>

	<!-- ═══════ שאלות נפוצות ═══════ -->
	<!-- השו"ת בעברית בלבד בינתיים (בעריכה) — לכן RTL קבוע -->
	<section
		id="faq"
		bind:this={faqEl}
		aria-labelledby="faq-title"
		class="faq-stage relative isolate mb-10 overflow-hidden rounded-3xl px-4 py-6 sm:px-6"
		dir="rtl"
		lang="he"
	>
		<img class="faq-bg" src="/images/bg-poster.webp" alt="" aria-hidden="true" width="1280" height="720" loading="lazy" decoding="async" />
		{#if faqVideoSrc}
			<video class="faq-bg" autoplay muted loop playsinline preload="auto" poster="/images/bg-poster.webp" aria-hidden="true">
				<source src={faqVideoSrc} type="video/mp4" />
			</video>
		{/if}
		<h2 id="faq-title" class="mb-5 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">❓</span> שאלות נפוצות
			<span class="h-px flex-1 bg-white/10"></span>
		</h2>
		<div class="space-y-3">
			{#each faqs as faq, i (faq.q)}
				<!-- שתי הראשונות פתוחות כברירת מחדל: הטקסט גלוי כבר ב-SSR בלי לחיצה -->
				<details open={i < 2} class="group rounded-2xl border border-white/10 bg-[#0a101d] p-5 shadow-lg">
					<summary
						class="cursor-pointer list-none text-base font-black text-white transition hover:text-amber-300"
					>
						<span class="ml-2 inline-block text-amber-400 transition-transform group-open:rotate-90" aria-hidden="true">◂</span>
						{faq.q}
					</summary>
					<!-- בשורה אחת בכוונה: whitespace-pre-line היה מציג רווחי תבנית כירידות שורה -->
					<p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-300">{#each faqParts(faq.a) as part}{#if part.href}<a href={part.href} target={part.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" class="font-bold text-amber-300 underline decoration-amber-300/40 underline-offset-2 transition hover:text-amber-200">{part.text}</a>{:else}{part.text}{/if}{/each}</p>
				</details>
			{/each}
		</div>
	</section>

	<!-- ═══════ הצטרפות ═══════ -->
	<section
		class="rounded-3xl border border-amber-500/25 bg-[#0f172a] bg-gradient-to-l from-amber-500/10 to-pink-600/10 p-6 text-center shadow-lg sm:p-8"
	>
		<h2 class="text-xl font-black text-white sm:text-2xl">{tx.joinTitle}</h2>
		<p class="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-amber-100/90 sm:text-base">
			{tx.joinText}
		</p>
		<div class="mt-5 flex flex-wrap justify-center gap-3">
			<a
				href="/register?redirect=/about"
				class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-black text-white transition hover:opacity-90"
			>
				{tx.register}
			</a>
			<a
				href="/login?redirect=/about"
				class="rounded-xl border border-white/15 bg-[#1b2335] px-6 py-2.5 text-sm font-bold text-gray-200 transition hover:bg-[#272f3f]"
			>
				{tx.login}
			</a>
			<a
				href="mailto:{CONTACT_EMAIL}"
				class="rounded-xl border border-white/15 bg-[#1b2335] px-6 py-2.5 text-sm font-bold text-gray-200 transition hover:bg-[#272f3f]"
			>
				{tx.contact}
			</a>
		</div>

		<div class="mt-6 flex flex-wrap items-center justify-center gap-2">
			{#each socials as s (s.href)}
				<a
					href={s.href}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1b2335] px-3.5 py-1.5 text-xs font-bold text-gray-300 transition hover:bg-[#272f3f] hover:text-white"
				>
					<span aria-hidden="true">{s.icon}</span>{s.label}
				</a>
			{/each}
		</div>
	</section>
</div>

<style>
	/* קומת השו"ת: poster/וידאו מאחור (z-index:-2) ושכבת כהות (-1) לקריאוּת הטקסט; isolate על ה-section מחזיק את הכול בתוכו */
	.faq-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		object-fit: cover;
		z-index: -2;
		pointer-events: none;
	}
	.faq-stage::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: rgb(7 11 20 / 0.5);
	}
</style>
