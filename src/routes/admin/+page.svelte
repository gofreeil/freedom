<script lang="ts">
	import SiteAdminRow from '$lib/components/admin/SiteAdminRow.svelte';

	let { data } = $props();

	// תבנית העמודות המשותפת לכותרת ולשורות (form עם display:contents מזרים
	// את התאים ישירות לרשת הזו — כך כל השורות מיושרות לעמודות זהות).
	const GRID_COLS =
		'grid-template-columns: minmax(150px,1.3fr) minmax(130px,1fr) minmax(150px,1.2fr) 64px minmax(44px,auto);';
</script>

<svelte:head><title>ניהול אתרים · סופר-אדמין</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 py-6" dir="rtl">
	<!-- כותרת בלבד -->
	<header class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div class="min-w-0">
			<h1 class="flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
				<span>🛡️</span> ניהול אתרי הרשת
			</h1>
			<p class="mt-0.5 text-xs text-gray-400">
				סופר-אדמין · <span class="text-gray-200">{data.me.name || data.me.email}</span>
			</p>
		</div>
		<a href="/" class="flex-shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-gray-300 transition hover:bg-white/10">
			← לאתר
		</a>
	</header>

	<!-- טבלה: רשת אחת; הכותרת והשורות חולקות את אותן עמודות -->
	<div class="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3">
		<div class="grid min-w-[560px] items-center gap-x-2 gap-y-1.5" style={GRID_COLS}>
			<!-- כותרת עמודות (השינויים בשדות נשמרים אוטומטית) -->
			<div class="border-b border-white/10 px-1 pb-1.5 text-[11px] font-bold text-gray-400">אתר</div>
			<div class="border-b border-white/10 px-1 pb-1.5 text-[11px] font-bold text-gray-400">שם האדמין</div>
			<div class="border-b border-white/10 px-1 pb-1.5 text-[11px] font-bold text-gray-400">תפקיד / הערה</div>
			<div class="border-b border-white/10 px-1 pb-1.5 text-[11px] font-bold text-gray-400">תמונה</div>
			<div class="border-b border-white/10 px-1 pb-1.5"></div>

			{#each data.sites as site (site.id)}
				<SiteAdminRow {site} />
			{/each}
		</div>
	</div>
</div>
