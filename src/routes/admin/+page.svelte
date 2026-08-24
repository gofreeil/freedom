<script lang="ts">
	import SiteAdminRow from '$lib/components/admin/SiteAdminRow.svelte';
	import { SITE_ROWS_GRID_COLS } from '$lib/components/admin/sitesGrid';

	let { data } = $props();

	type Panel = Awaited<typeof data.panel>;

	// מצב עריכה: מאפשר להעלות ולמרכז תמונות אדמינים בלחיצה על העיגול,
	// ומציג את חיצי הסידור שמזיזים אתר מעלה/מטה ברשימה.
	let editMode = $state(false);

	// סדר האתרים — נשמר בשרת (ולא בדפדפן), כדי שהסידור יהיה זהה בכל מכשיר
	// ויופיע גם בכרטיסייה הציבורית "ניהול הרשת" שב-/about.
	const ORDER_KEY = 'admin:sitesOrder'; // המיקום הישן — נקרא פעם אחת להעלאה לשרת
	let order = $state<string[]>([]);
	let orderError = $state('');

	// ── נתוני הטבלה מגיעים בזרימה ──────────────────────────────────────────
	// ה-load מחזיר הבטחה (ראו +page.server.ts), כך שהדף נפתח מיד והשורות
	// מתמלאות רגע אחרי. שומרים את התוצאה במשתנה משלנו ולא ב-{#await}: אחרי כל
	// שמירה ה-load רץ שוב, ו-{#await} היה מחזיר את השלד — כלומר מוחק את הטבלה
	// ואת מה שמוקלד בה באותו רגע. כאן הטבלה הישנה נשארת עד שהחדשה מוכנה.
	let panel = $state<Panel | null>(null);
	let migrated = false;
	let seq = 0;
	$effect(() => {
		const mine = ++seq;
		data.panel.then((p) => {
			if (mine !== seq) return; // תשובה של טעינה שכבר הוחלפה
			panel = p;
			if (p.order.length) order = p.order;
			migrateLegacyOrder(p.order);
		});
	});

	// הרשימה המסודרת: אתרים שלא מופיעים בסדר השמור נשארים בסופה לפי הסדר המקורי
	// (Array.sort יציב — ערכי Infinity זהים לא מחליפים מקום).
	const sites = $derived.by(() => {
		const list = panel?.sites ?? [];
		if (!order.length) return list;
		const pos = new Map(order.map((id, i) => [id, i]));
		return [...list].sort((a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity));
	});

	// הגירה חד-פעמית: סידור שנשמר בדפדפן לפני שהמעבר לשרת נעשה — מועלה לשרת
	// כדי שלא יאבד. אחרי ההעלאה הרשומה המקומית כבר לא בשימוש.
	function migrateLegacyOrder(serverOrder: string[]) {
		if (migrated || serverOrder.length) return;
		migrated = true;
		try {
			const saved = JSON.parse(localStorage.getItem(ORDER_KEY) ?? '[]');
			const ids = Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [];
			if (!ids.length) return;
			order = ids;
			saveOrder(ids);
		} catch {}
	}

	/** שמירת הסדר בשרת */
	async function saveOrder(next: string[]) {
		orderError = '';
		try {
			const body = new FormData();
			body.set('order', JSON.stringify(next));
			const res = await fetch('?/order', {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body
			});
			if (!res.ok) throw new Error(String(res.status));
		} catch {
			orderError = 'שמירת הסדר נכשלה — נסו שוב';
		}
	}

	/** הזזת אתר צעד אחד מעלה (‎-1) או מטה (1), ושמירת הסדר החדש */
	function move(index: number, dir: -1 | 1) {
		const next = sites.map((s) => s.id);
		const to = index + dir;
		if (to < 0 || to >= next.length) return;
		[next[index], next[to]] = [next[to], next[index]];
		order = next;
		saveOrder(next);
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

	{#if panel?.error}
		<p class="mb-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
			{panel.error}
		</p>
	{/if}

	<!-- טבלה: רשת אחת, ללא שורת כותרות (השינויים בשדות נשמרים אוטומטית) -->
	<div class="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3">
		{#if panel}
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
		{:else}
			<!-- שלד טעינה: אותו גובה שורה, כך שהטבלה לא "קופצת" כשהנתונים מגיעים -->
			<div class="grid items-center gap-x-2 gap-y-1" style={GRID_COLS} aria-hidden="true">
				{#each Array.from({ length: 12 }) as _, i (i)}
					<div class="mx-auto h-[86px] w-[86px] animate-pulse rounded-full bg-white/5"></div>
					<div class="h-9 animate-pulse rounded-lg bg-white/5"></div>
					<div class="h-9 animate-pulse rounded-lg bg-white/5"></div>
					<div class="flex items-center gap-2">
						<div class="h-[80px] w-[80px] animate-pulse rounded-xl bg-white/5"></div>
						<div class="h-4 w-24 animate-pulse rounded bg-white/5"></div>
					</div>
					<div class="mx-auto h-7 w-16 animate-pulse rounded-lg bg-white/5"></div>
					<div></div>
				{/each}
			</div>
			<p class="sr-only">טוען את רשימת האתרים…</p>
		{/if}
	</div>

	<!-- כפתור עריכה — מתחת לטבלה -->
	<div class="mt-3 flex items-center gap-3">
		<button
			type="button"
			onclick={() => (editMode = !editMode)}
			disabled={!panel}
			class="rounded-lg px-4 py-1.5 text-sm font-bold transition disabled:opacity-40 {editMode
				? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white hover:opacity-90'
				: 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'}"
		>
			{editMode ? 'סיום עריכה' : '✏️ עריכה'}
		</button>
		{#if orderError}
			<span class="text-xs font-semibold text-red-400">{orderError}</span>
		{/if}
	</div>
</div>
