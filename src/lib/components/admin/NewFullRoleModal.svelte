<script lang="ts">
	// ============================================================
	// NewFullRoleModal.svelte — יצירת תפקיד שלם חדש ברשת:
	// אתר/תפקיד (שם, מזהה, קישור, שורת תיאור, קטגוריה, תמונה)
	// + שיוך אדמין (בחירה מ-Strapi או הזנה ידנית) + תיאור התפקיד.
	// ============================================================
	import { onMount } from 'svelte';
	import type { FreedomSite, SiteCategory } from '$lib/sitesData';
	import type { StrapiUserItem } from '$lib/networkRoles';
	import AvatarCropper from './AvatarCropper.svelte';

	export interface CreatedFullRole {
		site: FreedomSite;
		adminName: string;
		adminEmail: string;
		phone: string;
		role: string;
		communityId?: string;
		avatar?: string;
	}

	let {
		existingIds = [],
		onclose,
		oncreated
	}: {
		existingIds?: string[];
		onclose: () => void;
		oncreated: (result: CreatedFullRole) => void;
	} = $props();

	// ── פרטי האתר / התפקיד ──
	let siteName = $state('');
	let siteId = $state('');
	let siteIdEdited = $state(false);
	let siteUrl = $state('');
	let siteDescription = $state('');
	let siteCategory = $state<SiteCategory>('קהילה');
	let siteImage = $state('');
	let pickedSiteFile = $state<File | null>(null);
	let cropExistingSiteImg = $state(false);

	// ── פרטי האדמין ──
	let adminMode = $state<'strapi' | 'manual'>('strapi');
	let searchQuery = $state('');
	let searching = $state(false);
	let searchResults = $state<StrapiUserItem[]>([]);
	let selectedUser = $state<StrapiUserItem | null>(null);

	let manualName = $state('');
	let manualEmail = $state('');
	let manualPhone = $state('');
	let manualCommunityId = $state('');
	let roleTitle = $state('');

	let saving = $state(false);
	let errorMsg = $state('');

	// הפקת siteId אוטומטי משם האתר באנגלית או כ-role_<timestamp> אם השם בעברית בלבד
	function slugifySiteId(name: string): string {
		const ascii = name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');
		if (ascii.length >= 2) return ascii.slice(0, 48);
		return `role_${Date.now().toString(36)}`;
	}

	function onSiteNameInput(val: string) {
		siteName = val;
		if (!siteIdEdited) {
			siteId = slugifySiteId(val);
		}
	}

	// פתיחת חלון זום וחיתוך עבור תמונת אתר שנבחרה מהמחשב
	function onPickSiteImage(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		pickedSiteFile = file;
		input.value = '';
	}

	// חיפוש משתמשים ב-Strapi
	let debounceTimer: ReturnType<typeof setTimeout>;
	function onSearchInput(val: string) {
		searchQuery = val;
		clearTimeout(debounceTimer);
		searching = true;
		debounceTimer = setTimeout(() => fetchUsers(val.trim()), 280);
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

	onMount(() => {
		fetchUsers('');
	});

	async function submit() {
		errorMsg = '';
		const cleanName = siteName.trim();
		const cleanId = (siteId.trim() || slugifySiteId(cleanName)).toLowerCase();

		if (!cleanName) {
			errorMsg = 'נא להזין שם אתר / תפקיד';
			return;
		}
		if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(cleanId)) {
			errorMsg = 'המזהה באנגלית חייב להכיל לפחות 2 תווים (אותיות אנגליות קטנות, ספרות, _ או -)';
			return;
		}
		if (existingIds.includes(cleanId)) {
			errorMsg = `המזהה "${cleanId}" כבר קיים ברשימה — בחרו מזהה אחר`;
			return;
		}

		let adminName = '';
		let adminEmail = '';
		let phone = '';
		let communityId = '';
		let avatarUrl = '';

		if (adminMode === 'strapi' && selectedUser) {
			adminName = selectedUser.nickname || selectedUser.username || selectedUser.email.split('@')[0];
			adminEmail = selectedUser.email;
			phone = selectedUser.phone ?? '';
			communityId = String(selectedUser.id);
			avatarUrl = selectedUser.avatarUrl ?? '';
		} else if (adminMode === 'manual') {
			adminName = manualName.trim();
			adminEmail = manualEmail.trim().toLowerCase();
			phone = manualPhone.trim();
			communityId = manualCommunityId.trim();
		}

		const hasAdmin = !!(adminName || adminEmail || phone);
		const finalRole = roleTitle.trim() || (hasAdmin ? cleanName : '');
		const cleanUrl = siteUrl.trim();
		const cleanDesc = siteDescription.trim();
		const cleanImg = siteImage.trim();

		saving = true;
		try {
			const res = await fetch('/api/network-users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					siteId: cleanId,
					adminName,
					adminEmail,
					phone,
					role: finalRole,
					communityId,
					appRole: `${cleanId}_admin`,
					siteMeta: {
						name: cleanName,
						description: cleanDesc || undefined,
						url: cleanUrl || undefined,
						image: cleanImg || undefined,
						category: siteCategory
					}
				})
			});
			const jsonRes = await res.json();
			if (!res.ok) throw new Error(jsonRes.error || 'שמירת התפקיד נכשלה');

			oncreated({
				site: {
					id: cleanId,
					name: cleanName,
					description: cleanDesc,
					url: cleanUrl,
					image: cleanImg || undefined,
					category: siteCategory
				},
				adminName: jsonRes.adminName ?? adminName,
				adminEmail: jsonRes.adminEmail ?? adminEmail,
				phone: jsonRes.phone ?? phone,
				role: jsonRes.role ?? finalRole,
				communityId,
				avatar: avatarUrl
			});
			onclose();
		} catch (err: any) {
			errorMsg = err?.message || 'שגיאה בשמירה';
		} finally {
			saving = false;
		}
	}

	let pointerDownOnBackdrop = false;

	const inputCls =
		'w-full rounded-xl border border-white/10 bg-[#1b2335] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none';
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	onpointerdown={(e) => {
		pointerDownOnBackdrop = e.target === e.currentTarget;
	}}
	onclick={(e) => {
		if (pointerDownOnBackdrop && e.target === e.currentTarget) onclose();
		pointerDownOnBackdrop = false;
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape') onclose();
	}}
>
	<div
		class="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-white/15 bg-[#121929] text-white shadow-2xl"
		dir="rtl"
	>
		<!-- כותרת -->
		<div class="flex items-center justify-between border-b border-white/10 px-5 py-3">
			<div class="flex items-center gap-2">
				<span class="text-lg">➕</span>
				<h3 class="text-base font-black">הוספת תפקיד שלם חדש ברשת</h3>
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

		<!-- תוכן -->
		<div class="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
			{#if errorMsg}
				<div class="rounded-xl border border-red-500/30 bg-red-500/15 p-2.5 text-xs text-red-200">
					{errorMsg}
				</div>
			{/if}

			<!-- חלק 1: פרטי האתר / התפקיד -->
			<div class="rounded-xl border border-white/10 bg-[#0e1422] p-3.5 space-y-2.5">
				<div class="text-xs font-black text-sky-300">1. פרטי האתר / התפקיד</div>

				<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
					<div>
						<label for="new-site-name" class="mb-1 block font-bold text-gray-300">שם האתר / התפקיד *</label>
						<input
							id="new-site-name"
							value={siteName}
							oninput={(e) => onSiteNameInput((e.currentTarget as HTMLInputElement).value)}
							placeholder="למשל: חירות TV"
							class={inputCls}
						/>
					</div>
					<div>
						<label for="new-site-id" class="mb-1 block font-bold text-gray-300">מזהה באנגלית (siteId) *</label>
						<input
							id="new-site-id"
							value={siteId}
							oninput={(e) => {
								siteIdEdited = true;
								siteId = (e.currentTarget as HTMLInputElement).value;
							}}
							placeholder="למשל: cherut_tv"
							dir="ltr"
							class={inputCls}
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
					<div class="sm:col-span-2">
						<label for="new-site-url" class="mb-1 block font-bold text-gray-300">כתובת האתר (URL)</label>
						<input
							id="new-site-url"
							bind:value={siteUrl}
							placeholder="https://tv.gofreeil.com/"
							dir="ltr"
							class={inputCls}
						/>
					</div>
					<div>
						<label for="new-site-cat" class="mb-1 block font-bold text-gray-300">קטגוריה</label>
						<select id="new-site-cat" bind:value={siteCategory} class={inputCls}>
							<option value="ראשי">ראשי</option>
							<option value="קהילה">קהילה</option>
							<option value="משילות">משילות</option>
							<option value="כלכלה">כלכלה</option>
						</select>
					</div>
				</div>

				<div>
					<label for="new-site-desc" class="mb-1 block font-bold text-gray-300">שורת תיאור של האתר / התפקיד</label>
					<input
						id="new-site-desc"
						bind:value={siteDescription}
						placeholder="תיאור קצר שמתאר את האתר או התחום..."
						class={inputCls}
					/>
				</div>

				<div
					role="region"
					aria-label="תמונת אתר"
					ondragover={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					ondrop={(e) => {
						e.preventDefault();
						e.stopPropagation();
						const f = e.dataTransfer?.files?.[0];
						if (f && f.type.startsWith('image/')) pickedSiteFile = f;
					}}
					class="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/15 p-2 transition hover:border-sky-400/50"
				>
					<div class="flex-1 min-w-[180px]">
						<label for="new-site-img" class="mb-1 block font-bold text-gray-300">תמונת אתר (נתיב / קישור / העלאה)</label>
						<input
							id="new-site-img"
							bind:value={siteImage}
							placeholder="/images/cherut-tv.png"
							dir="ltr"
							class={inputCls}
						/>
					</div>
					<label class="mt-4 cursor-pointer rounded-xl border border-white/15 bg-[#1b2335] px-3 py-2 text-xs font-bold text-gray-200 hover:bg-[#27314a]">
						📷 העלאת תמונה
						<input type="file" accept="image/*" class="hidden" onchange={onPickSiteImage} />
					</label>
					{#if siteImage}
						<img src={siteImage} alt="" class="mt-3 h-10 w-10 rounded-lg object-cover border border-white/15" />
						<button
							type="button"
							onclick={() => (cropExistingSiteImg = true)}
							class="mt-3 rounded-xl border border-sky-500/30 bg-sky-500/15 px-2.5 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/25"
						>
							✂️ זום וחיתוך
						</button>
					{/if}
				</div>
			</div>

			<!-- חלק 2: האדמין ושורת תיאור התפקיד -->
			<div class="rounded-xl border border-white/10 bg-[#0e1422] p-3.5 space-y-2.5">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<span class="text-xs font-black text-amber-300">2. אדמין התפקיד ותיאור <span class="font-normal text-gray-400">(אופציונלי — אפשר להשאיר פנוי)</span></span>
					<div class="flex rounded-lg border border-white/10 bg-[#161e30] p-0.5 text-[11px]">
						<button
							type="button"
							onclick={() => (adminMode = 'strapi')}
							class="rounded-md px-2.5 py-1 font-bold transition {adminMode === 'strapi'
								? 'bg-sky-600 text-white'
								: 'text-gray-400 hover:text-white'}"
						>
							בחירה מ-Strapi
						</button>
						<button
							type="button"
							onclick={() => (adminMode = 'manual')}
							class="rounded-md px-2.5 py-1 font-bold transition {adminMode === 'manual'
								? 'bg-sky-600 text-white'
								: 'text-gray-400 hover:text-white'}"
						>
							הזנה ידנית
						</button>
					</div>
				</div>

				{#if adminMode === 'strapi'}
					{#if !selectedUser}
						<div class="relative">
							<input
								type="text"
								value={searchQuery}
								oninput={(e) => onSearchInput((e.currentTarget as HTMLInputElement).value)}
								placeholder="חיפוש משתמש ב-Strapi (שם, 05x, אימייל)..."
								class={inputCls}
							/>
							{#if searching}
								<span class="absolute left-3 top-2 text-[11px] text-gray-400 animate-pulse">מחפש...</span>
							{/if}
						</div>
						<div class="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-white/5 bg-[#121929] p-1">
							{#if searchResults.length === 0 && !searching}
								<div class="p-2 text-center text-[11px] text-gray-500">לא נמצאו משתמשים</div>
							{/if}
							{#each searchResults as u (u.id)}
								<button
									type="button"
									onclick={() => (selectedUser = u)}
									class="flex w-full items-center justify-between gap-2 rounded-lg p-1.5 text-right hover:bg-white/10"
								>
									<div class="min-w-0">
										<div class="truncate font-bold text-white">{u.nickname || u.username || 'ללא שם'}</div>
										<div class="truncate text-[11px] text-gray-400" dir="ltr">{u.email}</div>
									</div>
									<div class="flex-shrink-0 text-[11px] text-amber-300" dir="ltr">{u.phone || '—'}</div>
								</button>
							{/each}
						</div>
					{:else}
						<div class="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
							<div>
								<div class="font-bold text-white">{selectedUser.nickname || selectedUser.username}</div>
								<div class="text-[11px] text-gray-300" dir="ltr">{selectedUser.email} {selectedUser.phone ? `• ${selectedUser.phone}` : ''}</div>
							</div>
							<button
								type="button"
								onclick={() => (selectedUser = null)}
								class="text-xs text-gray-300 underline hover:text-white"
							>
								החלף
							</button>
						</div>
					{/if}
				{:else}
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<div>
							<label for="manual-admin-name" class="mb-1 block font-bold text-gray-300">שם האדמין *</label>
							<input id="manual-admin-name" bind:value={manualName} placeholder="שם מלא" class={inputCls} />
						</div>
						<div>
							<label for="manual-admin-phone" class="mb-1 block font-bold text-gray-300">טלפון (לוואטסאפ)</label>
							<input id="manual-admin-phone" bind:value={manualPhone} placeholder="05x-xxxxxxx" dir="ltr" class={inputCls} />
						</div>
						<div>
							<label for="manual-admin-email" class="mb-1 block font-bold text-gray-300">אימייל</label>
							<input id="manual-admin-email" type="email" bind:value={manualEmail} placeholder="name@example.com" dir="ltr" class={inputCls} />
						</div>
						<div>
							<label for="manual-admin-cid" class="mb-1 block font-bold text-gray-300">מזהה בקהילה בשכונה</label>
							<input id="manual-admin-cid" bind:value={manualCommunityId} placeholder="אופציונלי" dir="ltr" class={inputCls} />
						</div>
					</div>
				{/if}

				<div>
					<label for="new-role-title" class="mb-1 block font-bold text-gray-300">שורת תיאור תפקיד האדמין (תופיע בשורה בטבלה)</label>
					<input
						id="new-role-title"
						bind:value={roleTitle}
						placeholder="למשל: מנהל ערוץ השידורים והפקות חירות TV"
						class={inputCls}
					/>
				</div>
			</div>
		</div>

		<!-- כפתורי פעולה -->
		<div class="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3">
			<button
				type="button"
				onclick={onclose}
				class="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-gray-300 hover:bg-white/10"
			>
				ביטול
			</button>
			<button
				type="button"
				onclick={submit}
				disabled={saving}
				class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 px-5 py-2 text-xs font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-40"
			>
				{#if saving}
					<span class="animate-spin">⏳</span> יוצר תפקיד...
				{:else}
					<span>✅</span> צור תפקיד שלם
				{/if}
			</button>
		</div>
	</div>
</div>

{#if pickedSiteFile}
	<AvatarCropper
		file={pickedSiteFile}
		shape="square"
		onsave={(dataUrl) => {
			siteImage = dataUrl;
			pickedSiteFile = null;
		}}
		oncancel={() => (pickedSiteFile = null)}
	/>
{:else if cropExistingSiteImg && siteImage}
	<AvatarCropper
		src={siteImage}
		shape="square"
		onsave={(dataUrl) => {
			siteImage = dataUrl;
			cropExistingSiteImg = false;
		}}
		oncancel={() => (cropExistingSiteImg = false)}
	/>
{/if}
