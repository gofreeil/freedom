<script lang="ts">
	// ============================================================
	// טבלת הרכזים הניתנת לעריכה — מוצגת לסופר-אדמין בדף /admin ("ניהול הרשת").
	// מאפשרת ניהול בשני כיוונים:
	// 1. לפי תפקידים ואתרים: בחירת משתמש מ-Strapi לכל תפקיד/אתר.
	// 2. לפי משתמשי הרשת: חיפוש בכל משתמשי ה-Strapi והכתרתם לתפקיד קיים/חדש.
	// ============================================================
	import type { ComponentProps } from 'svelte';
	import SiteAdminRow from '$lib/components/admin/SiteAdminRow.svelte';
	import NetworkUsersTab from '$lib/components/admin/NetworkUsersTab.svelte';
	import UserCrownModal from '$lib/components/admin/UserCrownModal.svelte';
	import NewFullRoleModal, { type CreatedFullRole } from '$lib/components/admin/NewFullRoleModal.svelte';
	import { SITE_ROWS_GRID_COLS } from '$lib/components/admin/sitesGrid';

	type Panel = {
		order: string[];
		sites: ComponentProps<typeof SiteAdminRow>['site'][];
		error: string;
	};

	let { panelData }: { panelData: Promise<Panel> } = $props();

	// מבט: 'sites' (לפי תפקידים ואתרים) או 'users' (כל משתמשי Strapi)
	let activeSubTab = $state<'sites' | 'users'>('sites');

	// מצב עריכה לטבלת האתרים
	let editMode = $state(false);

	// מודאל הכתרה ומודאל יצירת תפקיד שלם
	let crownTargetSite = $state<any | null>(null);
	let showNewRoleModal = $state(false);
	let showNewFullRoleModal = $state(false);

	// סדר האתרים
	const ORDER_KEY = 'admin:sitesOrder';
	let order = $state<string[]>([]);
	let orderError = $state('');

	// ── נתוני הטבלה מגיעים בזרימה ──────────────────────────────────────────
	let panel = $state<Panel | null>(null);
	let migrated = false;
	let seq = 0;
	$effect(() => {
		const mine = ++seq;
		panelData.then((p) => {
			if (mine !== seq) return;
			panel = p;
			if (p.order.length) order = p.order;
			migrateLegacyOrder(p.order);
		});
	});

	const sites = $derived.by(() => {
		const list = panel?.sites ?? [];
		if (!order.length) return list;
		const pos = new Map(order.map((id, i) => [id, i]));
		return [...list].sort((a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity));
	});

	function migrateLegacyOrder(serverOrder: string[]) {
		if (migrated || serverOrder.length) return;
		migrated = true;
		try {
			const saved = JSON.parse(localStorage.getItem(ORDER_KEY) ?? '[]');
			const ids = Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [];
			if (!ids.length) return;
			order = ids;
			saveOrder(ids);
		} catch {}
	}

	async function saveOrder(next: string[]) {
		orderError = '';
		try {
			const body = new FormData();
			body.set('order', JSON.stringify(next));
			const res = await fetch('?/order', {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body
			});
			if (!res.ok) throw new Error(String(res.status));
		} catch {
			orderError = 'שמירת הסדר נכשלה — נסו שוב';
		}
	}

	function move(index: number, dir: -1 | 1) {
		const next = sites.map((s) => s.id);
		const to = index + dir;
		if (to < 0 || to >= next.length) return;
		[next[index], next[to]] = [next[to], next[index]];
		order = next;
		saveOrder(next);
	}

	// עדכון מיידי של האתר ברשימה המקומית אחרי הכתרה
	function handleAssigned(result: { siteId: string; adminName: string; adminEmail: string; phone: string; role: string }) {
		if (!panel) return;
		const target = panel.sites.find((s) => s.id === result.siteId);
		if (target) {
			target.admin = {
				...(target.admin ?? {}),
				adminName: result.adminName,
				adminEmail: result.adminEmail,
				phone: result.phone,
				role: result.role,
				updatedAt: new Date().toISOString(),
				updatedBy: 'me'
			};
		}
	}

	function handleFullRoleCreated(res: CreatedFullRole) {
		if (!panel) return;
		const newRow = {
			...res.site,
			admin: {
				adminName: res.adminName,
				adminEmail: res.adminEmail,
				phone: res.phone,
				role: res.role,
				communityId: res.communityId ?? '',
				avatar: res.avatar ?? '',
				updatedAt: new Date().toISOString(),
				updatedBy: 'me'
			}
		};
		panel = {
			...panel,
			sites: [...panel.sites, newRow]
		};
		if (order.length && !order.includes(res.site.id)) {
			const nextOrder = [...order, res.site.id];
			order = nextOrder;
			saveOrder(nextOrder);
		}
	}

	const GRID_COLS = SITE_ROWS_GRID_COLS;
</script>

<svelte:window
	ondragover={(e) => {
		if (e.dataTransfer?.types?.includes('Files')) {
			e.preventDefault();
		}
	}}
	ondrop={(e) => {
		if (e.dataTransfer?.types?.includes('Files')) {
			e.preventDefault();
		}
	}}
/>

<section class="space-y-3">
	<!-- כותרת ובורר תצוגה קומפקטי -->
	<div class="flex flex-wrap items-center justify-between gap-2.5">
		<h2 class="flex items-center gap-2 text-base font-black text-white sm:text-xl">
			<span aria-hidden="true">🛡️</span> צוות הרכזים והאדמינים
		</h2>

		<!-- בורר שתי התצוגות: לפי תפקידים / לפי משתמשי הרשת -->
		<div class="flex items-center rounded-xl border border-white/10 bg-[#161e30] p-1 text-xs">
			<button
				type="button"
				onclick={() => (activeSubTab = 'sites')}
				class="rounded-lg px-3 py-1.5 font-bold transition {activeSubTab === 'sites'
					? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow'
					: 'text-gray-400 hover:text-white'}"
			>
				🏢 לפי תפקידים ואתרים
			</button>
			<button
				type="button"
				onclick={() => (activeSubTab = 'users')}
				class="rounded-lg px-3 py-1.5 font-bold transition {activeSubTab === 'users'
					? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow'
					: 'text-gray-400 hover:text-white'}"
			>
				👥 כלל משתמשי הרשת (Strapi)
			</button>
		</div>
	</div>

	{#if panel?.error}
		<p class="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-300">
			{panel.error}
		</p>
	{/if}

	{#if activeSubTab === 'sites'}
		<!-- ── תצוגה 1: לפי תפקידים ואתרים ── -->
		<div class="overflow-x-auto rounded-2xl border border-white/10 bg-[#141c2f] p-3">
			{#if panel}
				<div class="grid items-center gap-x-2 gap-y-1" style={GRID_COLS}>
					{#each sites as site, i (site.id)}
						<SiteAdminRow
							{site}
							{editMode}
							canUp={i > 0}
							canDown={i < sites.length - 1}
							onmove={(dir) => move(i, dir)}
							oncrown={(s) => (crownTargetSite = s)}
						/>
					{/each}
				</div>
			{:else}
				<!-- שלד טעינה -->
				<div class="grid items-center gap-x-2 gap-y-1" style={GRID_COLS} aria-hidden="true">
					{#each Array.from({ length: 12 }) as _, i (i)}
						<div class="mx-auto h-[86px] w-[86px] animate-pulse rounded-full bg-[#1b2335]"></div>
						<div class="h-9 animate-pulse rounded-lg bg-[#1b2335]"></div>
						<div class="h-9 animate-pulse rounded-lg bg-[#1b2335]"></div>
						<div class="flex items-center gap-2">
							<div class="h-[80px] w-[80px] animate-pulse rounded-xl bg-[#1b2335]"></div>
							<div class="h-4 w-24 animate-pulse rounded bg-[#1b2335]"></div>
						</div>
						<div class="mx-auto h-7 w-16 animate-pulse rounded-lg bg-[#1b2335]"></div>
						<div></div>
					{/each}
				</div>
				<p class="sr-only">טוען את רשימת האתרים…</p>
			{/if}
		</div>

		<!-- סרגל כפתורי פעולה מתחת לטבלה -->
		<div class="flex flex-wrap items-center justify-between gap-3 pt-1">
			<div class="flex items-center gap-2.5">
				<button
					type="button"
					onclick={() => (editMode = !editMode)}
					disabled={!panel}
					class="rounded-xl px-4 py-1.5 text-xs font-bold transition disabled:opacity-40 {editMode
						? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white hover:opacity-90'
						: 'border border-white/10 bg-[#1b2335] text-gray-300 hover:bg-[#272f3f]'}"
				>
					{editMode ? 'סיום עריכה' : '✏️ עריכת פרטי קשר'}
				</button>

				<button
					type="button"
					onclick={() => (showNewRoleModal = true)}
					class="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/15 px-3.5 py-1.5 text-xs font-bold text-purple-200 transition hover:bg-purple-500/25"
				>
					<span>✨</span> מנה אדמין לתפקיד
				</button>

				<button
					type="button"
					onclick={() => (showNewFullRoleModal = true)}
					disabled={!panel}
					class="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-40"
				>
					<span>➕</span> הוסף תפקיד שלם
				</button>
			</div>

			{#if orderError}
				<span class="text-xs font-semibold text-red-400">{orderError}</span>
			{/if}
		</div>
	{:else}
		<!-- ── תצוגה 2: כלל משתמשי הרשת (Strapi) ── -->
		<NetworkUsersTab onassigned={handleAssigned} />
	{/if}
</section>

<!-- מודאל הכתרת אדמין לאתר נבחר -->
{#if crownTargetSite}
	<UserCrownModal
		site={crownTargetSite}
		onclose={() => (crownTargetSite = null)}
		onassigned={(res) => {
			handleAssigned(res);
			crownTargetSite = null;
		}}
	/>
{/if}

<!-- מודאל יצירת תפקיד חדש -->
{#if showNewRoleModal}
	<UserCrownModal
		site={null}
		onclose={() => (showNewRoleModal = false)}
		onassigned={(res) => {
			handleAssigned(res);
			showNewRoleModal = false;
		}}
	/>
{/if}

<!-- מודאל הוספת תפקיד שלם (אתר + תיאור + אדמין) -->
{#if showNewFullRoleModal}
	<NewFullRoleModal
		existingIds={sites.map((s) => s.id)}
		onclose={() => (showNewFullRoleModal = false)}
		oncreated={(res) => {
			handleFullRoleCreated(res);
			showNewFullRoleModal = false;
		}}
	/>
{/if}
