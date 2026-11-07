<script lang="ts">
	// /admin/tv — ניהול Freedom TV: טבלת המתנדבים בלבד, בלי שאר נושאי הניהול.
	import { onMount } from 'svelte';
	import { TeamStore } from '$lib/components/admin/team/teamStore.svelte';
	import VolunteerSheet from '$lib/components/admin/team/VolunteerSheet.svelte';

	const store = new TeamStore();

	onMount(() => {
		store.load();
		return store.startPolling();
	});
</script>

<svelte:head><title>Freedom TV | יוצאים לחירות</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 py-6" dir="rtl">
	<h1 class="mb-4 flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
		<span aria-hidden="true">📺</span> Freedom TV
	</h1>

	{#if store.loadError && !store.loaded}
		<div class="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
			<p>{store.loadError}</p>
			<button type="button" onclick={() => store.load()} class="mt-2 rounded-lg border border-red-400/30 px-3 py-1 font-bold hover:bg-red-500/10">נסו שוב</button>
		</div>
	{:else if !store.loaded}
		<div class="h-40 animate-pulse rounded-xl bg-[#141c2f]" aria-hidden="true"></div>
		<p class="sr-only">טוען…</p>
	{:else}
		<VolunteerSheet {store} />
	{/if}
</div>

<div class="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4" aria-live="polite">
	{#if store.toast}
		<p
			class="pointer-events-auto rounded-xl border px-4 py-2 text-sm font-semibold shadow-2xl {store.toast.type === 'ok'
				? 'border-emerald-500/30 bg-emerald-950/95 text-emerald-100'
				: 'border-red-500/30 bg-red-950/95 text-red-100'}"
		>
			{store.toast.msg}
		</p>
	{/if}
</div>
