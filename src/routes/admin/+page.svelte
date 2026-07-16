<script lang="ts">
	import SiteAdminRow from '$lib/components/admin/SiteAdminRow.svelte';

	let { data } = $props();

	// מצב עריכה: מאפשר להעלות ולמרכז תמונות אדמינים בלחיצה על העיגול
	let editMode = $state(false);

	// תבנית העמודות המשותפת לכותרת ולשורות (form עם display:contents מזרים
	// את התאים ישירות לרשת הזו — כך כל השורות מיושרות לעמודות זהות).
	// סדר העמודות (מימין לשמאל): תמונת אדמין | שם | תפקיד | אתר | יצירת קשר | הסרה.
	// כל העמודות מוגבלות ברוחב — השדות צמודים ימינה והשטח העודף נשאר בקצה השמאלי.
	const GRID_COLS =
		'grid-template-columns: 71px minmax(130px,190px) minmax(240px,470px) minmax(160px,240px) 100px minmax(44px,auto);';
</script>

<svelte:head><title>ניהול אתרי יוצאים לחירות</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 py-6" dir="rtl">
	<!-- כותרת בלבד -->
	<header class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div class="min-w-0">
			<h1 class="flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
				<span class="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full">
					<img src="/images/ad_neighborhoods.webp" alt="" class="h-full w-full scale-[1.2] object-cover" />
				</span>
				ניהול אתרי יוצאים לחירות
			</h1>
		</div>
	</header>

	<!-- טבלה: רשת אחת, ללא שורת כותרות (השינויים בשדות נשמרים אוטומטית) -->
	<div class="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3">
		<div class="grid items-center gap-x-2 gap-y-1" style={GRID_COLS}>
			{#each data.sites as site (site.id)}
				<SiteAdminRow {site} {editMode} />
			{/each}
		</div>
	</div>

	<!-- כפתור עריכה — מתחת לטבלה -->
	<div class="mt-3">
		<button
			type="button"
			onclick={() => (editMode = !editMode)}
			class="rounded-lg px-4 py-1.5 text-sm font-bold transition {editMode
				? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white hover:opacity-90'
				: 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'}"
		>
			{editMode ? 'סיום עריכה' : '✏️ עריכה'}
		</button>
	</div>
</div>
