<script lang="ts">
	// ============================================================
	// מרכז העבודה של צוות הרשת (/admin): משימות, דיווחי פעילות, סקירת צוות,
	// ובלשונית האחרונה — טבלת הרכזים (מועברת כ-children מהדף).
	// הלשונית והמשימה הפתוחה נשמרות בכתובת (?tab= / ?task=) — כך קישור למשימה
	// שנשלח בוואטסאפ פותח אותה ישירות.
	// ============================================================
	import { onMount, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { isOverdue, todayStr } from '$lib/teamBoard';
	import { TeamStore } from './teamStore.svelte';
	import TaskBoard from './TaskBoard.svelte';
	import TaskDrawer from './TaskDrawer.svelte';
	import ReportsFeed from './ReportsFeed.svelte';
	import TeamOverview from './TeamOverview.svelte';

	let { children }: { children: Snippet } = $props();

	const store = new TeamStore();

	const TABS = [
		{ id: 'tasks', label: 'משימות', icon: '📋' },
		{ id: 'reports', label: 'דיווחי פעילות', icon: '📣' },
		{ id: 'overview', label: 'סקירת צוות', icon: '📊' },
		{ id: 'coordinators', label: 'צוות הרכזים', icon: '🛡️' }
	] as const;
	type Tab = (typeof TABS)[number]['id'];

	const initialTab = page.url.searchParams.get('tab');
	let tab = $state<Tab>(TABS.some((t) => t.id === initialTab) ? (initialTab as Tab) : 'tasks');
	let openTaskId = $state(page.url.searchParams.get('task') ?? '');
	let presetReportTask = $state('');

	onMount(() => {
		store.load();
		return store.startPolling();
	});

	function syncUrl() {
		const url = new URL(page.url);
		if (tab === 'tasks') url.searchParams.delete('tab');
		else url.searchParams.set('tab', tab);
		if (openTaskId) url.searchParams.set('task', openTaskId);
		else url.searchParams.delete('task');
		if (url.search !== page.url.search) replaceState(url, page.state);
	}

	function setTab(t: Tab) {
		tab = t;
		syncUrl();
	}

	function openTask(id: string) {
		openTaskId = id;
		syncUrl();
	}

	function closeTask() {
		openTaskId = '';
		syncUrl();
	}

	function reportOn(taskId: string) {
		presetReportTask = taskId;
		openTaskId = '';
		setTab('reports');
	}

	function filterByAssignee(id: string) {
		Object.assign(store.filter, { scope: 'all', assignee: id, site: '', q: '' });
		setTab('tasks');
	}

	// ── תגיות "חדש" על הלשוניות ──
	const unreadTasks = $derived(store.loaded ? store.board.tasks.filter((t) => store.isTaskUnread(t)).length : 0);
	const newReports = $derived(
		store.loaded && tab !== 'reports'
			? store.board.reports.filter((r) => r.by !== store.me?.id && r.at > (store.seen.r || store.seen.base)).length
			: 0
	);
	const badge = (id: Tab) => (id === 'tasks' ? unreadTasks : id === 'reports' ? newReports : 0);

	const today = todayStr();
	const myOpen = $derived(
		store.board.tasks.filter((t) => t.status !== 'done' && t.assignees.includes(store.me?.id ?? ''))
	);
	const myOverdue = $derived(myOpen.filter((t) => isOverdue(t, today)).length);
	const myName = $derived(store.me ? store.member(store.me.id).name.split(' ')[0] : '');
</script>

{#if store.loaded && store.me}
	<p class="-mt-3 mb-4 text-[14px] text-gray-400">
		שלום {myName} 👋
		{#if myOpen.length}
			· יש לך
			<button type="button" onclick={() => filterByAssignee(store.me!.id)} class="font-bold text-sky-300 hover:underline">
				{myOpen.length} משימות פתוחות
			</button>
			{#if myOverdue}<span class="font-bold text-red-300">({myOverdue} באיחור)</span>{/if}
		{:else}
			· אין לך משימות פתוחות כרגע
		{/if}
	</p>
{/if}

<!-- ── לשוניות ── -->
<div class="-mx-4 mb-5 overflow-x-auto px-4 [scrollbar-width:none]">
	<div class="flex min-w-max gap-1 border-b border-white/10" role="tablist" aria-label="אזורי ניהול">
		{#each TABS as t (t.id)}
			<button
				type="button"
				role="tab"
				id="tab-{t.id}"
				aria-selected={tab === t.id}
				aria-controls="panel-{t.id}"
				onclick={() => setTab(t.id)}
				class="relative -mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[14px] font-bold whitespace-nowrap transition sm:px-4 sm:text-[15px] {tab === t.id
					? 'border-amber-400 text-white'
					: 'border-transparent text-gray-400 hover:text-gray-200'}"
			>
				<span aria-hidden="true">{t.icon}</span>
				{t.label}
				{#if badge(t.id)}
					<span class="rounded-full bg-sky-500 px-1.5 text-[11px] leading-5 font-black text-white" title="חדש בשבילך">{badge(t.id)}</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<div role="tabpanel" id="panel-{tab}" aria-labelledby="tab-{tab}">
	{#if tab === 'coordinators'}
		{@render children()}
	{:else if store.loadError && !store.loaded}
		<div class="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
			<p>{store.loadError}</p>
			<button type="button" onclick={() => store.load()} class="mt-2 rounded-lg border border-red-400/30 px-3 py-1 font-bold hover:bg-red-500/10">נסו שוב</button>
		</div>
	{:else if !store.loaded}
		<!-- שלד טעינה -->
		<div class="grid gap-3 lg:grid-cols-4" aria-hidden="true">
			{#each Array.from({ length: 4 }) as _, i (i)}
				<div class="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
					<div class="h-5 w-24 animate-pulse rounded bg-white/10"></div>
					<div class="h-20 animate-pulse rounded-xl bg-white/5"></div>
					<div class="h-16 animate-pulse rounded-xl bg-white/5"></div>
				</div>
			{/each}
		</div>
		<p class="sr-only">טוען את לוח הצוות…</p>
	{:else if tab === 'tasks'}
		<TaskBoard {store} onopen={openTask} />
	{:else if tab === 'reports'}
		<ReportsFeed {store} presetTaskId={presetReportTask} onpresetused={() => (presetReportTask = '')} onopentask={openTask} />
	{:else if tab === 'overview'}
		<TeamOverview {store} onfilter={filterByAssignee} />
	{/if}
</div>

{#if openTaskId && store.loaded}
	<TaskDrawer {store} taskId={openTaskId} onclose={closeTask} onreport={reportOn} />
{/if}

<!-- ── הודעות קצרות ── -->
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
