<script lang="ts">
	// /admin/tv — ניהול Freedom TV: טבלת המתנדבים בלבד, בלי שאר נושאי הניהול.
	// אדמין: הטבלה המלאה + כפתור שיתוף. משתמש מחובר אחר: תצוגה מוסתרת והוספת שורה (GuestSheet).
	import { onMount } from 'svelte';
	import { TeamStore } from '$lib/components/admin/team/teamStore.svelte';
	import VolunteerSheet from '$lib/components/admin/team/VolunteerSheet.svelte';
	import GuestSheet from '$lib/components/admin/team/GuestSheet.svelte';

	let { data } = $props();

	const store = new TeamStore();
	let copied = $state(false);

	onMount(() => {
		if (data.guest) return;
		store.load();
		return store.startPolling();
	});

	async function share() {
		const url = `${location.origin}/admin/tv`;
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2500);
		} catch {
			prompt('העתיקו את הקישור:', url);
		}
	}
</script>

<svelte:head><title>חירות TV | יוצאים לחירות</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 py-6" dir="rtl">
	<div class="mb-4 flex flex-wrap items-center gap-3">
		<h1 class="flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">📺</span> חירות TV
		</h1>
		{#if !data.guest}
			<button
				type="button"
				onclick={share}
				class="ms-auto rounded-lg border border-white/15 px-3 py-1.5 text-[13px] font-bold text-gray-200 hover:bg-white/5"
				title="העתקת קישור לדף. מי שאינו אדמין יראה את הנתונים ויוכל רק להוסיף שורה"
			>
				{copied ? '✓ הקישור הועתק' : '🔗 שתף'}
			</button>
		{/if}
	</div>

	{#if data.guest}
		<GuestSheet />
	{:else if store.loadError && !store.loaded}
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
