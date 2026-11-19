<script lang="ts">
	// ============================================================
	// NetworkUsersTab.svelte — תצוגת כלל משתמשי הרשת (מתוך Strapi).
	// מאפשרת לסופר-אדמין לחפש לפי שם, אימייל או טלפון, ולהכתיר משתמש לאדמין.
	// ============================================================
	import { onMount } from 'svelte';
	import type { StrapiUserItem } from '$lib/networkRoles';
	import UserCrownModal from './UserCrownModal.svelte';

	let { onassigned }: { onassigned: (res: any) => void } = $props();

	let q = $state('');
	let loading = $state(false);
	let users = $state<StrapiUserItem[]>([]);
	let totalCount = $state(0);
	let error = $state('');

	// מודאל הכתרה למשתמש שנבחר
	let crowningUser = $state<StrapiUserItem | null>(null);

	let debounceTimer: ReturnType<typeof setTimeout>;
	function onSearchInput(val: string) {
		q = val;
		clearTimeout(debounceTimer);
		loading = true;
		debounceTimer = setTimeout(() => {
			loadUsers(val.trim());
		}, 300);
	}

	async function loadUsers(queryStr: string) {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/network-users?q=${encodeURIComponent(queryStr)}`);
			if (!res.ok) throw new Error('שגיאה בשליפת משתמשי הרשת');
			const data = await res.json();
			users = data.data ?? [];
			totalCount = data.total ?? users.length;
		} catch (e: any) {
			error = e?.message || 'שגיאה בחיבור ל-Strapi';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadUsers('');
	});
</script>

<div class="space-y-3">
	<!-- סרגל חיפוש וסינון קומפקטי -->
	<div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#141c2f] p-3">
		<div class="relative flex-1 min-w-[240px]">
			<input
				type="text"
				value={q}
				oninput={(e) => onSearchInput((e.currentTarget as HTMLInputElement).value)}
				placeholder="🔍 חיפוש משתמש לפי שם, טלפון (05x) או אימייל..."
				class="w-full rounded-xl border border-white/10 bg-[#1b2335] px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none"
			/>
			{#if loading}
				<span class="absolute left-3 top-2.5 text-xs text-gray-400 animate-pulse">טוען...</span>
			{/if}
		</div>

		<div class="flex items-center gap-2 text-xs text-gray-400">
			<span>👥 נמצאו <strong class="text-white">{users.length}</strong> משתמשים</span>
			<button
				type="button"
				onclick={() => loadUsers(q)}
				class="rounded-lg border border-white/10 bg-[#1b2335] px-2.5 py-1 text-gray-300 hover:bg-white/10"
				title="רענון רשימה"
			>
				🔄 רענן
			</button>
		</div>
	</div>

	{#if error}
		<div class="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-300">
			{error}
		</div>
	{/if}

	<!-- טבלת משתמשים קומפקטית -->
	<div class="overflow-x-auto rounded-2xl border border-white/10 bg-[#141c2f]">
		<table class="w-full text-right text-xs text-gray-300">
			<thead class="border-b border-white/10 bg-[#0e1422] text-[11px] font-bold text-gray-400">
				<tr>
					<th class="px-3.5 py-2.5">משתמש</th>
					<th class="px-3.5 py-2.5">אימייל</th>
					<th class="px-3.5 py-2.5">טלפון</th>
					<th class="px-3.5 py-2.5">עיר</th>
					<th class="px-3.5 py-2.5">תפקיד נוכחי</th>
					<th class="px-3.5 py-2.5 text-center">פעולה</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/5">
				{#if users.length === 0 && !loading}
					<tr>
						<td colspan="6" class="px-4 py-8 text-center text-gray-500">
							{q ? 'לא נמצאו משתמשים התואמים לחיפוש' : 'אין משתמשים להצגה'}
						</td>
					</tr>
				{/if}

				{#each users as u (u.id)}
					<tr class="transition hover:bg-white/5">
						<!-- משתמש -->
						<td class="px-3.5 py-2 whitespace-nowrap">
							<div class="flex items-center gap-2">
								<div class="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-slate-700">
									{#if u.avatarUrl}
										<img src={u.avatarUrl} alt="" class="h-full w-full object-cover" />
									{:else}
										<div class="flex h-full w-full items-center justify-center text-[10px] font-bold text-sky-300">
											{(u.nickname || u.username || u.email).slice(0, 2).toUpperCase()}
										</div>
									{/if}
								</div>
								<div class="font-bold text-white">
									{u.nickname || u.username || 'ללא שם'}
								</div>
							</div>
						</td>

						<!-- אימייל -->
						<td class="px-3.5 py-2 whitespace-nowrap font-mono text-[11px] text-gray-400" dir="ltr">
							{u.email}
						</td>

						<!-- טלפון -->
						<td class="px-3.5 py-2 whitespace-nowrap" dir="ltr">
							{#if u.phone}
								<a
									href="https://wa.me/972{u.phone.replace(/\D/g, '').replace(/^0/, '')}"
									target="_blank"
									rel="noopener"
									class="inline-flex items-center gap-1 text-emerald-400 hover:underline"
								>
									<span>💬</span> {u.phone}
								</a>
							{:else}
								<span class="text-gray-600">—</span>
							{/if}
						</td>

						<!-- עיר -->
						<td class="px-3.5 py-2 whitespace-nowrap text-gray-400">
							{u.city || '—'}
						</td>

						<!-- תפקיד -->
						<td class="px-3.5 py-2 whitespace-nowrap">
							{#if u.appRole && u.appRole !== 'user'}
								<span class="rounded bg-purple-500/20 px-1.5 py-0.5 text-[11px] font-bold text-purple-300">
									{u.appRole}
								</span>
							{:else}
								<span class="text-gray-500">משתמש</span>
							{/if}
						</td>

						<!-- כפתור הכתרה -->
						<td class="px-3.5 py-2 whitespace-nowrap text-center">
							<button
								type="button"
								onclick={() => (crowningUser = u)}
								class="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-pink-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/30 transition hover:bg-amber-500/30"
							>
								<span>👑</span> הכתר לאדמין
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if crowningUser}
	<UserCrownModal
		user={crowningUser}
		onclose={() => (crowningUser = null)}
		onassigned={(res) => {
			onassigned(res);
			loadUsers(q);
		}}
	/>
{/if}
