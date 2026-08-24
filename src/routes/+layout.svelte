<script lang="ts">
	import "../app.css";
	import "flag-icons/css/flag-icons.min.css";
	import "$lib/i18n";
	import { t, locale } from "svelte-i18n";
	import { get } from "svelte/store";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import WelcomeScreen from "$lib/components/WelcomeScreen.svelte";
	import { navigating } from "$app/state";

	let { children, data } = $props();

	let _loc = $state(get(locale) ?? 'he');
	$effect(() => locale.subscribe((l) => (_loc = l ?? 'he')));
	const tFn = (k: string) => { void _loc; return get(t)(k); };

	// כיוון מסמך לפי שפה
	const dirFor = (l: string | null | undefined) => {
		const code = (l ?? 'he').slice(0, 2);
		return code === 'he' || code === 'ar' ? 'rtl' : 'ltr';
	};
	let docDir = $derived(dirFor(_loc));

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.dir = docDir;
			document.documentElement.lang = (_loc ?? 'he').slice(0, 2);
		}
	});
</script>

<svelte:head>
	<title>{tFn("welcome")}</title>
	<link rel="icon" href="/images/ad_neighborhoods.png" type="image/png" />
	<link rel="apple-touch-icon" href="/images/ad_neighborhoods.png" />
</svelte:head>

<a href="#main-content" class="skip-link">{tFn("layout.skip_to_main")}</a>

<!-- פס התקדמות בזמן ניווט: SvelteKit נשאר על הדף הקודם עד שהחדש מוכן, ובלי סימן כלשהו הלחיצה מרגישה כאילו לא קרה כלום. הפס מופיע רק אחרי ~150ms, כך שניווט מיידי לא מהבהב. -->
{#if navigating.to}
	<div class="nav-progress" role="status" aria-label="טוען…"></div>
{/if}

<!-- מסך פתיחה אחרי הרשמה / התחברות — גלובלי, מופעל ע"י ?welcome ב-URL -->
<WelcomeScreen userName={data.user?.name ?? ''} />

<span class="golden-frame golden-frame-left" aria-hidden="true"></span>
<span class="golden-frame golden-frame-right" aria-hidden="true"></span>
<div class="site-frame min-h-screen flex flex-col bg-[#0f172a]">
	<Header user={data.user} />

	<div class="layout-container flex-grow">
		<main id="main-content" tabindex="-1" class="main-content">
			{@render children()}
		</main>
	</div>

	<Footer />
</div>

<style>
	/* פס ההתקדמות של הניווט */
	.nav-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		z-index: 100;
		transform-origin: left center;
		background: linear-gradient(90deg, #4f46e5, #7c3aed, #f5d57a);
		animation: nav-progress 8s cubic-bezier(0.15, 0.85, 0.25, 1) forwards;
	}
	:global(html[dir="rtl"]) .nav-progress {
		transform-origin: right center;
	}
	@keyframes nav-progress {
		0% { transform: scaleX(0); opacity: 0; }
		2% { transform: scaleX(0.06); opacity: 0; }
		4% { opacity: 1; }
		25% { transform: scaleX(0.55); }
		60% { transform: scaleX(0.82); }
		100% { transform: scaleX(0.97); opacity: 1; }
	}
	@media (prefers-reduced-motion: reduce) {
		.nav-progress { animation-duration: 0s; transform: scaleX(1); opacity: 1; }
	}

	/* מסגרת זהב: שני קווים אנכיים קבועים בשני צידי האתר.
	   הזוהר מיוצר ע"י drop-shadow (לא box-shadow!) כדי שיכבד את שקיפות הגרדיינט -
	   כך הקצוות מתחדדים לנקודה אחת במקום ליצור הילה/פיצול. */
	.golden-frame {
		position: fixed;
		top: 0;
		bottom: 0;
		width: 4px;
		z-index: 60;
		pointer-events: none;
		background: linear-gradient(
			to bottom,
			rgba(212, 175, 55, 0) 0%,
			#f5d57a 8%,
			#d4af37 25%,
			#fff2b8 50%,
			#d4af37 75%,
			#f5d57a 92%,
			rgba(212, 175, 55, 0) 100%
		);
		filter:
			drop-shadow(0 0 4px rgba(245, 213, 122, 0.55))
			drop-shadow(0 0 12px rgba(212, 175, 55, 0.35));
	}
	/* ממוקמים על שולי המסגרת הפנימית (1280px). על מסכים צרים נצמדים פנימה ב-12px. */
	.golden-frame-left {
		left: max(12px, calc(50% - 640px));
	}
	.golden-frame-right {
		right: max(12px, calc(50% - 640px));
	}

	/* כל האתר חי בתוך המסגרת בלבד; מחוץ אליה - עמוד ריק (רקע ה-body). */
	.site-frame {
		max-width: 1280px;
		margin: 0 auto;
		width: 100%;
	}

	.layout-container {
		max-width: 1280px;
		margin: 0 auto;
		display: flex;
		gap: 2rem;
		padding: 2rem 2rem 0 2rem;
		width: 100%;
	}

	.main-content {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 1024px) {
		/* קווי הזהב והמסגרת רק לדסקטופ - בנייד/טאבלט מסתירים ומשחררים את רוחב האתר */
		.golden-frame {
			display: none;
		}
		.site-frame {
			max-width: 100vw;
		}
		.layout-container {
			padding: 0;
			gap: 0;
			flex-direction: column;
			max-width: 100vw;
			overflow-x: hidden;
		}
		.main-content {
			max-width: 100vw;
			overflow-x: hidden;
		}
	}
</style>
