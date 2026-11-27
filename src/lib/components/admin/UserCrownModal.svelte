<script lang="ts">
	// ============================================================
	// UserCrownModal.svelte — מודאל חיפוש והכתרת אדמין מכלל משתמשי Strapi.
	// תומך בשני תרחישים:
	// 1. בחירת משתמש עבור אתר/תפקיד קיים (חיפוש לפי שם, טלפון, אימייל).
	// 2. בחירת תפקיד (קיים או חדש) עבור משתמש שנבחר מראש.
	// ============================================================
	import { onMount } from 'svelte';
	import type { FreedomSite } from '$lib/sitesData';
	import { SITES } from '$lib/sitesData';
	import { SITE_PREDEFINED_ROLES, type StrapiUserItem } from '$lib/networkRoles';

	let {
		site = null,
		user = null,
		onclose,
		onassigned
	}: {
		site?: (FreedomSite & { admin?: any }) | null;
		user?: StrapiUserItem | null;
		onclose: () => void;
		onassigned: (result: { siteId: string; adminName: string; adminEmail: string; phone: string; role: string }) => void;
	} = $props();

	// חיפוש משתמשים
	let searchQuery = $state('');
	let searching = $state(false);
	let searchResults = $state<StrapiUserItem[]>([]);
	// svelte-ignore state_referenced_locally
	let selectedUser = $state<StrapiUserItem | null>(user ?? null);

	// בחירת אתר / תפקיד
	// svelte-ignore state_referenced_locally
	let selectedSiteId = $state<string>(site?.id ?? 'state_auditor');
	let isCustomRole = $state(false);
	let customSiteId = $state('');
	let customSiteName = $state('');
	// svelte-ignore state_referenced_locally
	let roleTitle = $state(
		site
			? (SITE_PREDEFINED_ROLES[site.id]?.roleTitle ?? site.name)
			: (SITE_PREDEFINED_ROLES['state_auditor']?.roleTitle ?? '')
	);

	let saving = $state(false);
	let errorMsg = $state('');

	// טעינת משתמשים בעת הקלדה
	let debounceTimer: ReturnType<typeof setTimeout>;
	function onSearchInput(val: string) {
		searchQuery = val;
		clearTimeout(debounceTimer);
		if (!val.trim()) {
			searchResults = [];
			searching = false;
			return;
		}
		searching = true;
		debounceTimer = setTimeout(() => {
			fetchUsers(val.trim());
		}, 300);
	}

	async function fetchUsers(q: string) {
		try {
			const res = await fetch(`/api/network-users?q=${encodeURIComponent(q)}`);
			if (!res.ok) throw new Error('שגיאה בחיפוש משתמשים');
			const data = (await res.json()) as { data: StrapiUserItem[] };
			searchResults = data.data ?? [];
		} catch (err: any) {
			errorMsg = err?.message || 'שגיאה בשליפת נתונים';
		} finally {
			searching = false;
		}
	}

	function chooseUser(u: StrapiUserItem) {
		selectedUser = u;
		if (site) {
			const def = SITE_PREDEFINED_ROLES[site.id];
			if (def) roleTitle = def.roleTitle;
		}
	}

	function onSiteChange(siteId: string) {
		selectedSiteId = siteId;
		if (siteId === '__custom') {
			isCustomRole = true;
			roleTitle = '';
		} else {
			isCustomRole = false;
			const def = SITE_PREDEFINED_ROLES[siteId];
			if (def) roleTitle = def.roleTitle;
			else {
				const s = SITES.find((x) => x.id === siteId);
				roleTitle = s?.name ?? '';
			}
		}
	}

	async function crown() {
		if (!selectedUser) {
			errorMsg = 'נא לבחור משתמש';
			return;
		}
		const effectiveSiteId = isCustomRole ? customSiteId.trim() : selectedSiteId;
		if (!effectiveSiteId) {
			errorMsg = 'נא לבחור או להגדיר מזהה אתר/תפקיד';
			return;
		}
		if (isCustomRole && !customSiteName.trim()) {
			errorMsg = 'נא להזין שם לתפקיד החדש';
			return;
		}

		saving = true;
		errorMsg = '';

		const predefined = SITE_PREDEFINED_ROLES[effectiveSiteId];
		const appRole = predefined?.appRole ?? (isCustomRole ? `${effectiveSiteId}_admin` : 'site_admin');
		const finalRole = roleTitle.trim() || (isCustomRole ? customSiteName.trim() : predefined?.roleTitle ?? '');

		try {
			const res = await fetch('/api/network-users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					siteId: effectiveSiteId,
					adminName: selectedUser.nickname || selectedUser.username || selectedUser.email.split('@')[0],
					adminEmail: selectedUser.email,
					phone: selectedUser.phone,
					role: finalRole,
					communityId: String(selectedUser.id),
					appRole
				})
			});

			const jsonRes = await res.json();
			if (!res.ok) throw new Error(jsonRes.error || 'ההכתרה נכשלה');

			onassigned({
				siteId: effectiveSiteId,
				adminName: jsonRes.adminName,
				adminEmail: jsonRes.adminEmail,
				phone: jsonRes.phone,
				role: jsonRes.role
			});
			onclose();
		} catch (err: any) {
			errorMsg = err?.message || 'שגיאה בשמירה';
		} finally {
			saving = false;
		}
	}

	let pointerDownOnBackdrop = false;

	onMount(() => {
		// טעינה ראשונית של רשימת משתמשים אם אין חיפוש
		fetchUsers('');
	});
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
	role="dialog"
	aria-modal="true"
	onpointerdown={(e) => {
		pointerDownOnBackdrop = e.target === e.currentTarget;
	}}
	onclick={(e) => {
		if (pointerDownOnBackdrop && e.target === e.currentTarget) onclose();
		pointerDownOnBackdrop = false;
	}}
>
	<div
		class="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-white/15 bg-[#121929] text-white shadow-2xl"
		dir="rtl"
	>
		<!-- כותרת המודאל -->
		<div class="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
			<div class="flex items-center gap-2">
				<span class="text-xl">👑</span>
				<h3 class="text-base font-black sm:text-lg">
					{#if site}
						הכתרת אדמין עבור: <span class="text-amber-400">{site.name}</span>
					{:else if user}
						הכתרת אדמין: <span class="text-amber-400">{user.nickname || user.username}</span>
					{:else}
						הכתרת אדמין חדש ברשת
					{/if}
				</h3>
			</div>
			<button
				type="button"
				onclick={onclose}
				class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
				aria-label="סגירה"
			>
				✕
			</button>
		</div>

		<div class="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
			{#if errorMsg}
				<div class="rounded-xl border border-red-500/30 bg-red-500/15 p-2.5 text-xs text-red-200">
					{errorMsg}
				</div>
			{/if}

			<!-- בחירת משתמש אם עדיין לא נבחר -->
			{#if !selectedUser}
				<div>
					<label for="user-search-input" class="mb-1 block text-xs font-bold text-gray-300">
						חיפוש משתמש ב-Strapi (שם, אימייל או טלפון):
					</label>
					<div class="relative">
						<input
							id="user-search-input"
							type="text"
							value={searchQuery}
							oninput={(e) => onSearchInput((e.currentTarget as HTMLInputElement).value)}
							placeholder="הקלד שם, 05x, או כתובת מייל..."
							class="w-full rounded-xl border border-white/10 bg-[#1b2335] px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none"
						/>
						{#if searching}
							<span class="absolute left-3 top-2.5 text-xs text-gray-400 animate-pulse">מחפש...</span>
						{/if}
					</div>
				</div>

				<!-- תוצאות חיפוש -->
				<div class="max-h-56 overflow-y-auto space-y-1.5 rounded-xl border border-white/5 bg-[#0e1422] p-1.5">
					{#if searchResults.length === 0 && !searching}
						<div class="p-3 text-center text-xs text-gray-500">
							{searchQuery ? 'לא נמצאו משתמשים התואמים לחיפוש' : 'טוען משתמשים מ-Strapi...'}
						</div>
					{/if}
					{#each searchResults as u (u.id)}
						<button
							type="button"
							onclick={() => chooseUser(u)}
							class="flex w-full items-center justify-between gap-3 rounded-lg p-2 text-right transition hover:bg-white/10"
						>
							<div class="flex items-center gap-2.5 min-w-0">
								<div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-slate-700">
									{#if u.avatarUrl}
										<img src={u.avatarUrl} alt="" class="h-full w-full object-cover" />
									{:else}
										<div class="flex h-full w-full items-center justify-center text-xs font-bold text-sky-300">
											{(u.nickname || u.username || u.email).slice(0, 2).toUpperCase()}
										</div>
									{/if}
								</div>
								<div class="min-w-0">
									<div class="truncate text-xs font-bold text-white">
										{u.nickname || u.username || 'ללא שם'}
										{#if u.appRole && u.appRole !== 'user'}
											<span class="mr-1.5 rounded bg-purple-500/20 px-1 py-0.5 text-[10px] text-purple-300">
												{u.appRole}
											</span>
										{/if}
									</div>
									<div class="truncate text-[11px] text-gray-400" dir="ltr">
										{u.email}
									</div>
								</div>
							</div>
							<div class="flex-shrink-0 text-left text-[11px] text-amber-300" dir="ltr">
								{u.phone || '—'}
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<!-- כרטיס המשתמש שנבחר -->
				<div class="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
					<div class="flex items-center gap-3">
						<div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-700">
							{#if selectedUser.avatarUrl}
								<img src={selectedUser.avatarUrl} alt="" class="h-full w-full object-cover" />
							{:else}
								<div class="flex h-full w-full items-center justify-center text-sm font-bold text-sky-300">
									{(selectedUser.nickname || selectedUser.username || selectedUser.email).slice(0, 2).toUpperCase()}
								</div>
							{/if}
						</div>
						<div>
							<div class="font-bold text-white">
								{selectedUser.nickname || selectedUser.username}
							</div>
							<div class="text-xs text-gray-300" dir="ltr">{selectedUser.email}</div>
							{#if selectedUser.phone}
								<div class="text-xs text-amber-300" dir="ltr">📱 {selectedUser.phone}</div>
							{/if}
						</div>
					</div>
					{#if !user}
						<button
							type="button"
							onclick={() => (selectedUser = null)}
							class="text-xs text-gray-400 underline hover:text-white"
						>
							החלף משתמש
						</button>
					{/if}
				</div>
			{/if}

			<!-- בחירת אתר / תפקיד (אם הגענו מרשימת המשתמשים או רוצים לשנות) -->
			{#if !site || isCustomRole}
				<div class="space-y-2">
					<label for="select-site-role" class="block text-xs font-bold text-gray-300">
						בחר תפקיד / אתר ברשת:
					</label>
					<select
						id="select-site-role"
						value={isCustomRole ? '__custom' : selectedSiteId}
						onchange={(e) => onSiteChange((e.currentTarget as HTMLSelectElement).value)}
						class="w-full rounded-xl border border-white/10 bg-[#1b2335] px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
					>
						<optgroup label="אתרי הרשת">
							{#each SITES as s (s.id)}
								<option value={s.id}>{s.name} ({SITE_PREDEFINED_ROLES[s.id]?.roleTitle ?? s.id})</option>
							{/each}
						</optgroup>
						<optgroup label="מותאם אישית">
							<option value="__custom">✨ צור תפקיד חדש / מותאם אישית...</option>
						</optgroup>
					</select>
				</div>
			{/if}

			{#if isCustomRole}
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3">
					<div>
						<label for="custom-site-id" class="mb-1 block text-xs font-bold text-purple-200">מזהה תפקיד באנגלית (siteId):</label>
						<input
							id="custom-site-id"
							bind:value={customSiteId}
							placeholder="למשל: media_relations"
							dir="ltr"
							class="w-full rounded-lg border border-white/10 bg-[#1b2335] px-2.5 py-1.5 text-xs text-white"
						/>
					</div>
					<div>
						<label for="custom-site-name" class="mb-1 block text-xs font-bold text-purple-200">שם התפקיד / אתר:</label>
						<input
							id="custom-site-name"
							bind:value={customSiteName}
							placeholder="למשל: קשרי עיתונות ותקשורת"
							class="w-full rounded-lg border border-white/10 bg-[#1b2335] px-2.5 py-1.5 text-xs text-white"
						/>
					</div>
				</div>
			{/if}

			<!-- כותרת התפקיד / הגדרה חופשית -->
			<div>
				<label for="role-title-input" class="mb-1 block text-xs font-bold text-gray-300">
					תואר / הגדרת תפקיד לתצוגה:
				</label>
				<input
					id="role-title-input"
					bind:value={roleTitle}
					placeholder="למשל: רכז ראשי, מבקר המדינה האזרחי..."
					class="w-full rounded-xl border border-white/10 bg-[#1b2335] px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
				/>
			</div>

			<!-- הסבר הרשאות אוטומטיות -->
			<div class="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-200 space-y-1">
				<p class="font-bold flex items-center gap-1.5">
					<span>⚡</span> הרשאות שמופעלות מיד בעת ההכתרה:
				</p>
				<ul class="list-disc list-inside space-y-0.5 text-[11px] text-sky-300/90">
					<li>גישה מלאה ללוח המשימות של הרשת (`/admin`) ולתיוג משימות</li>
					<li>זיהוי אוטומטי בכניסה באמצעות האימייל או הטלפון הנייד (SMS)</li>
					<li>הענקת הרשאת אדמין ב-Strapi (`app_role`) עבור האתר שהוא מנהל</li>
					<li>הצגת כרטיס הרכז בעמוד האודות ובפרטי יצירת הקשר באתר</li>
				</ul>
			</div>
		</div>

		<!-- כפתורי פעולה -->
		<div class="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3.5">
			<button
				type="button"
				onclick={onclose}
				class="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-xs font-bold text-gray-300 hover:bg-white/10"
			>
				ביטול
			</button>
			<button
				type="button"
				onclick={crown}
				disabled={!selectedUser || saving}
				class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 px-5 py-2 text-xs font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-40"
			>
				{#if saving}
					<span class="animate-spin">⏳</span> שומר ומכתיר...
				{:else}
					<span>👑</span> הכתר כעת
				{/if}
			</button>
		</div>
	</div>
</div>
