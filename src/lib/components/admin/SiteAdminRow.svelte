<script lang="ts">
	import { enhance } from '$app/forms';
	import type { FreedomSite } from '$lib/sitesData';

	interface Admin {
		adminEmail: string;
		adminName: string;
		role?: string;
		avatarUrl?: string;
		avatar?: string;
		updatedAt: string;
		updatedBy: string;
	}

	let { site }: { site: FreedomSite & { admin: Admin | null } } = $props();

	// ערכי הטופס — מקומיים כדי לא לאבד הקלדה בזמן שמירה/שגיאה.
	// svelte-ignore state_referenced_locally
	let name = $state(site.admin?.adminName ?? '');
	// svelte-ignore state_referenced_locally
	let email = $state(site.admin?.adminEmail ?? '');
	// svelte-ignore state_referenced_locally
	let role = $state(site.admin?.role ?? '');
	// svelte-ignore state_referenced_locally
	let avatarUrl = $state(site.admin?.avatarUrl ?? '');
	let busy = $state(false);
	let status = $state<{ type: 'ok' | 'err'; msg: string } | null>(null);
	let imgOk = $state(true);
	let previewBroken = $state(false);

	const hasAdmin = $derived(!!site.admin);

	const inputCls =
		'w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[13px] text-white placeholder:text-gray-500 focus:border-sky-500 focus:outline-none';
</script>

<form
	method="POST"
	action="?/assign"
	style="display: contents"
	use:enhance={({ action }) => {
		const isRemove = action.search.includes('remove');
		busy = true;
		status = null;
		return async ({ result, update }) => {
			busy = false;
			if (result.type === 'success') {
				status = { type: 'ok', msg: isRemove ? 'הוסר' : 'נשמר ✓' };
				if (isRemove) {
					name = '';
					email = '';
					role = '';
					avatarUrl = '';
					previewBroken = false;
				}
			} else if (result.type === 'failure') {
				status = { type: 'err', msg: (result.data?.error as string) ?? 'הפעולה נכשלה' };
			} else {
				status = { type: 'err', msg: 'אירעה שגיאה' };
			}
			await update({ reset: false });
		};
	}}
>
	<input type="hidden" name="siteId" value={site.id} />

	<!-- אתר -->
	<div class="flex min-w-0 items-center gap-2 py-1">
		<div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
			{#if site.image && imgOk}
				<img src={site.image} alt="" class="h-full w-full object-cover" onerror={() => (imgOk = false)} />
			{:else}
				<div class="flex h-full w-full items-center justify-center text-sm">🕊️</div>
			{/if}
		</div>
		<span class="truncate text-sm font-bold text-white" title={site.name}>{site.name}</span>
	</div>

	<!-- שם האדמין -->
	<input name="adminName" bind:value={name} placeholder="שם" aria-label="שם האדמין" class={inputCls} />

	<!-- אימייל -->
	<input
		name="adminEmail"
		type="email"
		bind:value={email}
		required
		placeholder="אימייל"
		aria-label="אימייל האדמין"
		dir="ltr"
		class="{inputCls} text-right"
	/>

	<!-- תפקיד / הערה -->
	<input name="role" bind:value={role} placeholder="תפקיד / הערה" aria-label="תפקיד או הערה" class={inputCls} />

	<!-- תמונה -->
	<div class="flex items-center gap-1.5">
		<div class="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5">
			{#if avatarUrl.trim() && !previewBroken}
				<img
					src={avatarUrl}
					alt=""
					class="absolute inset-0 h-full w-full object-cover"
					onerror={() => (previewBroken = true)}
				/>
			{:else}
				<span class="absolute inset-0 flex items-center justify-center text-xs" aria-hidden="true">🖼️</span>
			{/if}
		</div>
		<input
			name="avatarUrl"
			bind:value={avatarUrl}
			oninput={() => (previewBroken = false)}
			placeholder="קישור לתמונה"
			aria-label="קישור לתמונת האדמין"
			dir="ltr"
			class="{inputCls} text-right"
		/>
	</div>

	<!-- פעולות -->
	<div class="flex items-center justify-end gap-1.5">
		<button
			type="submit"
			disabled={busy}
			class="rounded-lg bg-gradient-to-r from-amber-500 to-pink-600 px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
		>
			{busy ? '…' : 'שמור'}
		</button>
		{#if hasAdmin}
			<button
				type="submit"
				formaction="?/remove"
				formnovalidate
				disabled={busy}
				title="הסרת האדמין"
				aria-label="הסרת האדמין"
				class="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
			>
				🗑
			</button>
		{/if}
	</div>

	<!-- סטטוס (משתרע על כל הרוחב, מופיע רק כשיש) -->
	{#if status}
		<div class="col-span-full -mt-0.5 pb-1 text-[11px] font-semibold {status.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}">
			{site.name}: {status.msg}
		</div>
	{/if}
</form>
