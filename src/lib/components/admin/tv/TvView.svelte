<script lang="ts">
	// TvView.svelte — רכיב תצוגת חירות TV
	import { onMount } from 'svelte';
	import { TeamStore } from '$lib/components/admin/team/teamStore.svelte';
	import VolunteerSheet from '$lib/components/admin/team/VolunteerSheet.svelte';
	import GuestSheet from '$lib/components/admin/team/GuestSheet.svelte';

	interface Props {
		guest?: boolean;
	}

	let { guest = false }: Props = $props();

	const store = new TeamStore();
	let copied = $state(false);

	onMount(() => {
		if (guest) return;
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

<div class="mx-auto max-w-6xl px-2 sm:px-4 py-2 sm:py-4" dir="rtl">
	<div class="mb-2.5 flex items-center justify-between gap-3">
		<h2 class="flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">📺</span> חירות TV
		</h2>
		{#if !guest}
			<button
				type="button"
				onclick={share}
				class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[13px] font-bold text-gray-200 transition hover:bg-white/10 cursor-pointer"
				title="העתקת קישור לדף"
			>
				{copied ? '✓ הקישור הועתק' : '🔗 שתף'}
			</button>
		{/if}
	</div>

	<div class="mb-3.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
		<a
			href="/admin/tv/facebook"
			class="group flex items-center gap-2.5 rounded-xl border border-blue-400/25 bg-gradient-to-l from-blue-500/15 via-blue-500/10 to-transparent px-3 py-2 text-[13px] font-bold text-blue-100 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-400/50 hover:from-blue-500/25 hover:shadow-blue-950/40"
		>
			<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/25 text-blue-300 ring-1 ring-blue-400/30" aria-hidden="true">
				<svg class="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V11H8v3h2.4v8h3.1z"/></svg>
			</span>
			<span class="truncate">חיבור דף פייסבוק לשידור</span>
			<span class="ms-auto text-xs text-blue-300/70 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:text-blue-200" aria-hidden="true">←</span>
		</a>
		<a
			href="/admin/tv/youtube"
			class="group flex items-center gap-2.5 rounded-xl border border-red-400/25 bg-gradient-to-l from-red-500/15 via-red-500/10 to-transparent px-3 py-2 text-[13px] font-bold text-red-100 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-red-400/50 hover:from-red-500/25 hover:shadow-red-950/40"
		>
			<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/25 text-red-300 ring-1 ring-red-400/30" aria-hidden="true">
				<svg class="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.2 28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8zM10 15.2V8.8l5.5 3.2-5.5 3.2z"/></svg>
			</span>
			<span class="truncate">חיבור ערוץ יוטיוב לשידור</span>
			<span class="ms-auto text-xs text-red-300/70 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:text-red-200" aria-hidden="true">←</span>
		</a>
		<a
			href="/admin/tv/telegram"
			class="group flex items-center gap-2.5 rounded-xl border border-sky-400/25 bg-gradient-to-l from-sky-500/15 via-sky-500/10 to-transparent px-3 py-2 text-[13px] font-bold text-sky-100 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-sky-400/50 hover:from-sky-500/25 hover:shadow-sky-950/40"
		>
			<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/25 text-sky-300 ring-1 ring-sky-400/30" aria-hidden="true">
				<svg class="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M20.7 4.4 3.4 11.1c-1.2.5-1.2 1.2-.2 1.5l4.4 1.4 10.3-6.5c.5-.3.9-.1.6.2l-8.3 7.5-.3 4.6c.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.1-1.6z"/></svg>
			</span>
			<span class="truncate">חיבור טלגרם לשידור</span>
			<span class="ms-auto text-xs text-sky-300/70 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:text-sky-200" aria-hidden="true">←</span>
		</a>
	</div>

	{#if guest}
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
