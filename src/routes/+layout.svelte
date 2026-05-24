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
<div class="min-h-screen flex flex-col bg-[#0f172a]">
	<Header />

	<div class="layout-container flex-grow">
		<main id="main-content" tabindex="-1" class="main-content">
			{@render children()}
		</main>
	</div>

	<Footer />
</div>

<style>
	.layout-container {
		max-width: 1440px;
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
