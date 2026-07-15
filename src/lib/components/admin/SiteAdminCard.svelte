<script lang="ts">
	import { enhance } from '$app/forms';
	import type { FreedomSite } from '$lib/sitesData';

	interface Admin {
		adminEmail: string;
		adminName: string;
		role?: string;
		avatarUrl?: string;
		/** התמונה האפקטיבית לתצוגה (מחושבת בשרת: מפורשת או מהאימייל) */
		avatar?: string;
		updatedAt: string;
		updatedBy: string;
	}

	let { site }: { site: FreedomSite & { admin: Admin | null } } = $props();

	// ערכי הטופס — מקומיים כדי לא לאבד הקלדה בזמן שמירה/שגיאה.
	// זריעה חד-פעמית מהערך ההתחלתי של site (מכוון — לכן svelte-ignore).
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

	const catColor: Record<string, string> = {
		'ראשי': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
		'קהילה': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
		'משילות': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
		'כלכלה': 'bg-purple-500/20 text-purple-300 border-purple-500/30'
	};

	function fmtDate(iso: string): string {
		try {
			return new Date(iso).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
		} catch {
			return iso;
		}
	}
</script>

<div class="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg transition hover:border-white/20">
	<!-- כותרת האתר -->
	<div class="flex items-start gap-3">
		<div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
			{#if site.image && imgOk}
				<img
					src={site.image}
					alt=""
					class="h-full w-full object-cover"
					onerror={() => (imgOk = false)}
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center text-2xl">🕊️</div>
			{/if}
		</div>
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<h3 class="truncate text-base font-bold text-white">{site.name}</h3>
				<span class="rounded-full border px-2 py-0.5 text-[11px] font-semibold {catColor[site.category] ?? 'border-white/20 text-gray-300'}">
					{site.category}
				</span>
			</div>
			<a
				href={site.url}
				target="_blank"
				rel="noopener noreferrer"
				class="mt-0.5 block truncate text-xs text-sky-400 hover:underline"
			>
				{site.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
			</a>
			<p class="mt-1 line-clamp-2 text-xs text-gray-400">{site.description}</p>
		</div>
	</div>

	<!-- מצב אדמין נוכחי -->
	<div class="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs">
		{#if site.admin}
			<div class="flex items-center gap-2.5">
				<!-- עיגול אווטאר: תמונה מפורשת אם הוגדרה, אחרת מהאימייל (Gravatar) -->
				{#key site.admin.avatar}
					<div class="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5 shadow">
						<span class="absolute inset-0 flex items-center justify-center text-lg" aria-hidden="true">👤</span>
						<img
							src={site.admin.avatar}
							alt=""
							class="absolute inset-0 h-full w-full object-cover"
							onerror={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
						/>
					</div>
				{/key}
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-1.5 text-emerald-300">
						<span>✅</span><span class="font-semibold">אדמין ממונה</span>
					</div>
					<div class="mt-0.5 text-gray-200">
						<span class="font-bold">{site.admin.adminName}</span>
						{#if site.admin.role}<span class="text-sky-300"> · {site.admin.role}</span>{/if}
					</div>
					<div class="truncate text-gray-400" dir="ltr">{site.admin.adminEmail}</div>
				</div>
			</div>
			<div class="mt-1.5 text-[11px] text-gray-500">
				עודכן {fmtDate(site.admin.updatedAt)}{site.admin.updatedBy ? ` · ע"י ${site.admin.updatedBy}` : ''}
			</div>
		{:else}
			<div class="flex items-center gap-1.5 text-amber-300/90">
				<span>⚠️</span><span class="font-semibold">לא מונה אדמין לאתר זה</span>
			</div>
		{/if}
	</div>

	<!-- טופס מינוי / עדכון -->
	<form
		method="POST"
		action="?/assign"
		class="mt-3 flex flex-col gap-2"
		use:enhance={({ action }) => {
			const isRemove = action.search.includes('remove');
			busy = true;
			status = null;
			return async ({ result, update }) => {
				busy = false;
				if (result.type === 'success') {
					status = { type: 'ok', msg: isRemove ? 'המינוי הוסר' : 'המינוי נשמר בהצלחה' };
					if (isRemove) { name = ''; email = ''; role = ''; avatarUrl = ''; previewBroken = false; }
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
		<input
			name="adminName"
			bind:value={name}
			placeholder="שם האדמין"
			class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-sky-500 focus:outline-none"
		/>
		<input
			name="adminEmail"
			type="email"
			bind:value={email}
			required
			placeholder="אימייל האדמין"
			dir="ltr"
			class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white text-right placeholder:text-gray-500 focus:border-sky-500 focus:outline-none"
		/>
		<input
			name="role"
			bind:value={role}
			placeholder="תפקיד / הערה (רשות) — למשל: רכז ראשי"
			class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-sky-500 focus:outline-none"
		/>
		<div class="flex items-center gap-2">
			<!-- תצוגה מקדימה של האווטאר: תמונה שהוקלדה, אחרת נגזרת מהאימייל בשמירה -->
			<div class="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5">
				<span class="absolute inset-0 flex items-center justify-center text-sm" aria-hidden="true">🖼️</span>
				{#if avatarUrl.trim() && !previewBroken}
					<img
						src={avatarUrl}
						alt=""
						class="absolute inset-0 h-full w-full object-cover"
						onerror={() => (previewBroken = true)}
					/>
				{/if}
			</div>
			<input
				name="avatarUrl"
				bind:value={avatarUrl}
				oninput={() => (previewBroken = false)}
				placeholder="קישור לתמונה (רשות) — אם ריק, מהאימייל"
				dir="ltr"
				class="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white text-right placeholder:text-gray-500 focus:border-sky-500 focus:outline-none"
			/>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="submit"
				disabled={busy}
				class="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-pink-600 px-3 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
			>
				{busy ? 'שומר…' : site.admin ? 'עדכון אדמין' : 'מינוי אדמין'}
			</button>

			{#if site.admin}
				<button
					type="submit"
					formaction="?/remove"
					formnovalidate
					disabled={busy}
					class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
					title="ביטול המינוי"
				>
					הסרה
				</button>
			{/if}
		</div>

		{#if status}
			<p class="text-xs font-semibold {status.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}">
				{status.msg}
			</p>
		{/if}
	</form>
</div>
