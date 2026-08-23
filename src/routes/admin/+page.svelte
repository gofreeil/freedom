<script lang="ts">
	import { onMount } from 'svelte';
	import SiteAdminRow from '$lib/components/admin/SiteAdminRow.svelte';
	import { SITE_ROWS_GRID_COLS } from '$lib/components/admin/sitesGrid';

	let { data } = $props();

	// מצב עריכה: מאפשר להעלות ולמרכז תמונות אדמינים בלחיצה על העיגול,
	// ומציג את חיצי הסידור שמזיזים אתר מעלה/מטה ברשימה.
	let editMode = $state(false);

	// סדר האתרים — נשמר בדפדפן של הסופר-אדמין (סידור אישי, לא משנה את הרשת עצמה).
	const ORDER_KEY = 'admin:sitesOrder';
	let order = $state<string[]>([]);

	// הרשימה המסודרת: אתרים שלא מופיעים בסדר השמור נשארים בסופה לפי הסדר המקורי
	// (Array.sort יציב — ערכי Infinity זהים לא מחליפים מקום).
	const sites = $derived.by(() => {
		if (!order.length) return data.sites;
		const pos = new Map(order.map((id, i) => [id, i]));
		return [...data.sites].sort(
			(a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity)
		);
	});

	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(ORDER_KEY) ?? "[]");
			if (Array.isArray(saved)) order = saved.filter((id) => typeof id === 'string');
		} catch {}
	});

	/** הזזת אתר צעד אחד מעלה (‎-1) או מטה (1), ושמירת הסדר החדש */
	function move(index: number, dir: -1 | 1) {
		const next = sites.map((s) => s.id);
		const to = index + dir;
		if (to < 0 || to >= next.length) return;
		[next[index], next[to]] = [next[to], next[index]];
		order = next;
		try {
			localStorage.setItem(ORDER_KEY, JSON.stringify(next));
		} catch {}
	}

	// תבנית העמודות (form עם display:contents מזרים את התאים ישירות לרשת הזו —
	// כך כל השורות מיושרות לעמודות זהות). משותפת עם התצוגה הציבורית ב-/about.
	const GRID_COLS = SITE_ROWS_GRID_COLS;
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
			{#each sites as site, i (site.id)}
				<SiteAdminRow
					{site}
					{editMode}
					canUp={i > 0}
					canDown={i < sites.length - 1}
					onmove={(dir) => move(i, dir)}
				/>
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
