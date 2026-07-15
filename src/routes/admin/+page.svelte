<script lang="ts">
	import SiteAdminCard from '$lib/components/admin/SiteAdminCard.svelte';

	let { data } = $props();

	let query = $state('');
	let filter = $state<'all' | 'assigned' | 'unassigned'>('all');

	const total = $derived(data.sites.length);
	const assignedCount = $derived(data.sites.filter((s) => s.admin).length);
	const unassignedCount = $derived(total - assignedCount);

	const filtered = $derived(
		data.sites.filter((s) => {
			if (filter === 'assigned' && !s.admin) return false;
			if (filter === 'unassigned' && s.admin) return false;
			const q = query.trim();
			if (!q) return true;
			return (
				s.name.includes(q) ||
				s.url.includes(q) ||
				s.category.includes(q) ||
				(s.admin?.adminEmail ?? '').includes(q) ||
				(s.admin?.adminName ?? '').includes(q)
			);
		})
	);
</script>

<svelte:head><title>ניהול אתרים · סופר-אדמין</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8" dir="rtl">
	<!-- כותרת -->
	<header class="mb-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 class="flex items-center gap-2 text-2xl font-black text-white sm:text-3xl">
					<span>🛡️</span> ניהול אתרי הרשת
				</h1>
				<p class="mt-1 text-sm text-gray-400">
					פאנל סופר-אדמין · מחובר כ־<span class="text-gray-200">{data.me.name || data.me.email}</span>
				</p>
			</div>
			<a
				href="/"
				class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-gray-300 transition hover:bg-white/10"
			>
				← חזרה לאתר
			</a>
		</div>
	</header>

	<!-- סטטיסטיקות -->
	<div class="mb-6 grid grid-cols-3 gap-3">
		<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
			<div class="text-2xl font-black text-white">{total}</div>
			<div class="text-xs text-gray-400">אתרים ברשת</div>
		</div>
		<div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-center">
			<div class="text-2xl font-black text-emerald-300">{assignedCount}</div>
			<div class="text-xs text-gray-400">עם אדמין</div>
		</div>
		<div class="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-center">
			<div class="text-2xl font-black text-amber-300">{unassignedCount}</div>
			<div class="text-xs text-gray-400">ללא אדמין</div>
		</div>
	</div>

	<!-- חיפוש וסינון -->
	<div class="mb-6 flex flex-wrap items-center gap-3">
		<input
			bind:value={query}
			placeholder="חיפוש אתר / אדמין / כתובת…"
			class="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-sky-500 focus:outline-none"
		/>
		<div class="flex rounded-xl border border-white/10 bg-white/5 p-1 text-sm">
			<button
				class="rounded-lg px-3 py-1.5 font-semibold transition {filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}"
				onclick={() => (filter = 'all')}
			>הכל</button>
			<button
				class="rounded-lg px-3 py-1.5 font-semibold transition {filter === 'assigned' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}"
				onclick={() => (filter = 'assigned')}
			>ממונים</button>
			<button
				class="rounded-lg px-3 py-1.5 font-semibold transition {filter === 'unassigned' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}"
				onclick={() => (filter = 'unassigned')}
			>ללא אדמין</button>
		</div>
	</div>

	<!-- רשת הכרטיסים -->
	{#if filtered.length === 0}
		<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400">
			לא נמצאו אתרים התואמים לסינון.
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as site (site.id)}
				<SiteAdminCard {site} />
			{/each}
		</div>
	{/if}
</div>
