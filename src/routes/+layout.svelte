<script lang="ts">
	import "../app.css";
	import "flag-icons/css/flag-icons.min.css";
	import "$lib/i18n";
	import { t, locale } from "svelte-i18n";
	import { get } from "svelte/store";
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";

	let { children } = $props();

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
<span class="golden-frame golden-frame-left" aria-hidden="true"></span>
<span class="golden-frame golden-frame-right" aria-hidden="true"></span>
<div class="site-frame min-h-screen flex flex-col bg-[#0f172a]">
	<Header />

	<div class="layout-container flex-grow">
		<main id="main-content" tabindex="-1" class="main-content">
			{@render children()}
		</main>
	</div>

	<Footer />
</div>

<style>
	/* מסגרת זהב: שני קווים אנכיים קבועים בשני צידי האתר */
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
		box-shadow:
			0 0 6px rgba(245, 213, 122, 0.55),
			0 0 18px rgba(212, 175, 55, 0.35);
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
