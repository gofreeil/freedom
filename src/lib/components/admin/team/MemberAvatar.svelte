<script lang="ts">
	// תמונת חבר צוות; בלי תמונה (או כשהיא לא נטענת) — האות הראשונה על רקע צבעוני קבוע לאדם
	import type { Member } from '$lib/teamBoard';

	let {
		member,
		cls = 'h-7 w-7 text-xs',
		ring = false
	}: { member: Pick<Member, 'id' | 'name' | 'avatar'>; cls?: string; ring?: boolean } = $props();

	let broken = $state(false);
	$effect(() => {
		void member.avatar;
		broken = false;
	});

	const BG = ['bg-sky-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-pink-600', 'bg-indigo-600'];
	const bg = $derived(BG[[...member.id].reduce((n, c) => n + c.charCodeAt(0), 0) % BG.length]);
	const initial = $derived((member.name || member.id).trim().charAt(0).toUpperCase());
</script>

<span
	class="inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white {cls} {ring
		? 'ring-2 ring-[#0b1220]'
		: ''} {member.avatar && !broken ? 'bg-white/10' : bg}"
	title={member.name}
>
	{#if member.avatar && !broken}
		<img
			src={member.avatar}
			alt={member.name}
			loading="lazy"
			decoding="async"
			referrerpolicy="no-referrer"
			class="h-full w-full object-cover"
			onerror={() => (broken = true)}
		/>
	{:else}
		<span aria-hidden="true">{initial}</span>
		<span class="sr-only">{member.name}</span>
	{/if}
</span>
