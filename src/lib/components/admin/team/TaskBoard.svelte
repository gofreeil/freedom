<script lang="ts">
	// ============================================================
	// לשונית המשימות: הוספה מהירה, סינון, ותצוגת לוח (קנבן) או רשימה.
	// בלוח — גוררים כרטיס בין עמודות (במחשב); בנייד משנים סטטוס מתוך הכרטיס.
	// ============================================================
	import { SITES, getSite } from '$lib/sitesData';
	import {
		STATUSES,
		canEditTask,
		dueLabel,
		isOverdue,
		newId,
		priorityOf,
		statusOf,
		todayStr,
		type BoardTask,
		type TaskStatus
	} from '$lib/teamBoard';
	import type { TeamStore } from './teamStore.svelte';
	import TaskCard from './TaskCard.svelte';
	import MemberAvatar from './MemberAvatar.svelte';

	let { store, onopen }: { store: TeamStore; onopen: (id: string) => void } = $props();

	const today = todayStr();
	const DONE_RECENT_DAYS = 14;

	// ── תצוגה (נזכרת בדפדפן) ──
	let view = $state<'board' | 'list'>('board');
	let showAllDone = $state(false);
	$effect(() => {
		try {
			const v = localStorage.getItem('teamboard:view');
			if (v === 'list' || v === 'board') view = v;
		} catch {}
	});
	function setView(v: 'board' | 'list') {
		view = v;
		try {
			localStorage.setItem('teamboard:view', v);
		} catch {}
	}

	// ── הוספה מהירה ──
	let newTitle = $state('');
	let newAssignee = $state<string | null>(null); // null = ברירת המחדל (ראו למטה)
	const defaultAssignee = $derived(store.me && !store.me.isSuper ? store.me.id : '');
	const assigneeValue = $derived(newAssignee ?? defaultAssignee);

	function quickAdd(e: SubmitEvent) {
		e.preventDefault();
		const title = newTitle.trim();
		if (!title) return;
		const ok = store.run(
			{
				type: 'task.create',
				id: newId(),
				title,
				assignees: assigneeValue ? [assigneeValue] : [],
				siteId: store.filter.site && store.filter.site !== '__network' ? store.filter.site : ''
			},
			'המשימה נוספה — לחצו עליה כדי להוסיף פרטים'
		);
		if (ok) newTitle = '';
	}

	// ── סינון ──
	const f = $derived(store.filter);
	const filtered = $derived.by(() => {
		const me = store.me?.id ?? '';
		const q = f.q.trim().toLowerCase();
		return store.board.tasks.filter((t) => {
			if (f.scope === 'mine' && !t.assignees.includes(me)) return false;
			if (f.scope === 'created' && t.createdBy !== me) return false;
			if (f.scope === 'overdue' && !isOverdue(t, today)) return false;
			if (f.assignee === '__none' ? t.assignees.length > 0 : f.assignee && !t.assignees.includes(f.assignee))
				return false;
			if (f.site === '__network' ? !!t.siteId : f.site && t.siteId !== f.site) return false;
			if (q && !`${t.title}\n${t.description}`.toLowerCase().includes(q)) return false;
			return true;
		});
	});
	const filtering = $derived(f.scope !== 'all' || !!f.assignee || !!f.site || !!f.q.trim());

	const doneCutoff = new Date(Date.now() - DONE_RECENT_DAYS * 86_400_000).toISOString();
	const columns = $derived(
		STATUSES.map((s) => {
			let tasks = filtered.filter((t) => t.status === s.id).sort((a, b) => a.order - b.order);
			let hidden = 0;
			if (s.id === 'done' && !showAllDone) {
				const recent = tasks.filter((t) => (t.completedAt || t.updatedAt) >= doneCutoff);
				hidden = tasks.length - recent.length;
				tasks = recent;
			}
			return { ...s, tasks, hidden };
		})
	);

	const myOpen = $derived(
		store.board.tasks.filter((t) => t.status !== 'done' && t.assignees.includes(store.me?.id ?? '')).length
	);
	const overdueCount = $derived(store.board.tasks.filter((t) => isOverdue(t, today)).length);

	// ── גרירה בין עמודות ──
	let dragId = $state<string | null>(null);
	let dropAt = $state<{ status: TaskStatus; beforeId: string | null } | null>(null);

	function onDragStart(e: DragEvent, task: BoardTask) {
		dragId = task.id;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', task.id);
		}
	}

	function onDragEnd() {
		dragId = null;
		dropAt = null;
	}

	function onDragOver(e: DragEvent, status: TaskStatus) {
		if (!dragId) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		const cards = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[data-task-id]')];
		let beforeId: string | null = null;
		for (const c of cards) {
			const r = c.getBoundingClientRect();
			if (e.clientY < r.top + r.height / 2) {
				beforeId = c.dataset.taskId ?? null;
				break;
			}
		}
		if (dropAt?.status !== status || dropAt.beforeId !== beforeId) dropAt = { status, beforeId };
	}

	function onDrop(e: DragEvent, status: TaskStatus) {
		e.preventDefault();
		const id = dragId;
		const target = dropAt;
		onDragEnd();
		if (!id || !target || target.beforeId === id) return;
		store.run({ type: 'task.move', id, status, beforeId: target.beforeId });
	}

	// ── רשימה: באיחור קודם, אחר כך לפי תאריך יעד ועדיפות ──
	const PRIO_RANK: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
	const STATUS_RANK: Record<string, number> = { doing: 0, review: 1, todo: 2, done: 3 };
	const listRows = $derived(
		[...filtered]
			.filter((t) => showAllDone || t.status !== 'done' || (t.completedAt || t.updatedAt) >= doneCutoff)
			.sort(
				(a, b) =>
					STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
					Number(isOverdue(b, today)) - Number(isOverdue(a, today)) ||
					(a.due || '9999').localeCompare(b.due || '9999') ||
					PRIO_RANK[a.priority] - PRIO_RANK[b.priority]
			)
	);

	const SCOPES = [
		{ id: 'all', label: 'הכל' },
		{ id: 'mine', label: 'שלי' },
		{ id: 'created', label: 'פתחתי' },
		{ id: 'overdue', label: 'באיחור' }
	] as const;

	const CHIP =
		'rounded-full border px-3 py-1 text-[13px] font-semibold transition whitespace-nowrap';
	const SELECT =
		'rounded-lg border border-white/10 bg-[#1b2335] px-2 py-1.5 text-[13px] text-gray-200 focus:border-sky-500 focus:outline-none';
</script>

<!-- ── הוספה מהירה ── -->
<form onsubmit={quickAdd} class="mb-4 flex flex-wrap items-stretch gap-2 rounded-2xl border border-white/10 bg-[#161e30] p-2.5">
	<label for="quick-task" class="sr-only">משימה חדשה</label>
	<input
		id="quick-task"
		bind:value={newTitle}
		maxlength="200"
		autocomplete="off"
		placeholder="＋ משימה חדשה — מה צריך לעשות?"
		class="min-w-0 flex-[1_1_16rem] rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-[15px] text-white placeholder:text-gray-500 focus:border-sky-500 focus:outline-none"
	/>
	<label for="quick-assignee" class="sr-only">אחראי/ת</label>
	<select
		id="quick-assignee"
		value={assigneeValue}
		onchange={(e) => (newAssignee = (e.currentTarget as HTMLSelectElement).value)}
		class="{SELECT} flex-[0_1_12rem] py-2.5"
	>
		<option value="">👤 ללא אחראי</option>
		{#each store.team as m (m.id)}
			<option value={m.id}>{m.id === store.me?.id ? `${m.name} (אני)` : m.name}</option>
		{/each}
	</select>
	<button
		type="submit"
		disabled={!newTitle.trim()}
		class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-black text-white transition hover:opacity-90 disabled:opacity-40"
	>
		הוספה
	</button>
</form>

<!-- ── סינון ותצוגה ── -->
<div class="mb-4 flex flex-wrap items-center gap-2">
	<div class="flex flex-wrap gap-1.5" role="group" aria-label="סינון מהיר">
		{#each SCOPES as s (s.id)}
			<button
				type="button"
				onclick={() => (store.filter.scope = s.id)}
				aria-pressed={f.scope === s.id}
				class="{CHIP} {f.scope === s.id
					? 'border-sky-400/60 bg-sky-500/20 text-sky-100'
					: 'border-white/10 bg-[#1b2335] text-gray-300 hover:bg-[#272f3f]'}"
			>
				{s.label}
				{#if s.id === 'mine' && myOpen}<span class="ms-1 text-sky-300">{myOpen}</span>{/if}
				{#if s.id === 'overdue' && overdueCount}<span class="ms-1 text-red-300">{overdueCount}</span>{/if}
			</button>
		{/each}
	</div>

	<label for="f-assignee" class="sr-only">אחראי/ת</label>
	<select id="f-assignee" bind:value={store.filter.assignee} class={SELECT}>
		<option value="">כל האחראים</option>
		<option value="__none">ללא אחראי</option>
		{#each store.team as m (m.id)}
			<option value={m.id}>{m.name}</option>
		{/each}
	</select>

	<label for="f-site" class="sr-only">אתר</label>
	<select id="f-site" bind:value={store.filter.site} class={SELECT}>
		<option value="">כל האתרים</option>
		<option value="__network">כלל הרשת</option>
		{#each SITES as s (s.id)}
			<option value={s.id}>{s.name}</option>
		{/each}
	</select>

	<label for="f-q" class="sr-only">חיפוש</label>
	<input
		id="f-q"
		type="search"
		bind:value={store.filter.q}
		placeholder="🔍 חיפוש"
		class="{SELECT} w-36 placeholder:text-gray-500"
	/>

	{#if filtering}
		<button
			type="button"
			onclick={() => Object.assign(store.filter, { scope: 'all', assignee: '', site: '', q: '' })}
			class="text-[13px] font-semibold text-gray-400 underline-offset-2 hover:text-white hover:underline"
		>
			ניקוי
		</button>
	{/if}

	<div class="ms-auto flex overflow-hidden rounded-lg border border-white/10" role="group" aria-label="תצוגה">
		<button
			type="button"
			onclick={() => setView('board')}
			aria-pressed={view === 'board'}
			class="px-3 py-1.5 text-[13px] font-semibold transition {view === 'board' ? 'bg-white/15 text-white' : 'text-gray-400 hover:bg-[#1b2335]'}"
		>
			▦ לוח
		</button>
		<button
			type="button"
			onclick={() => setView('list')}
			aria-pressed={view === 'list'}
			class="px-3 py-1.5 text-[13px] font-semibold transition {view === 'list' ? 'bg-white/15 text-white' : 'text-gray-400 hover:bg-[#1b2335]'}"
		>
			☰ רשימה
		</button>
	</div>
</div>

{#if !store.board.tasks.length}
	<div class="rounded-2xl border border-dashed border-white/15 bg-[#141c2f] p-8 text-center">
		<p class="text-3xl" aria-hidden="true">🗂️</p>
		<p class="mt-2 font-bold text-white">עוד אין משימות בלוח</p>
		<p class="mt-1 text-sm text-gray-400">
			כתבו משימה בשורה למעלה ובחרו אחראי/ת. אחר כך לחיצה על הכרטיס פותחת פרטים, תאריך יעד, רשימת תיוג ושרשור עדכונים.
		</p>
	</div>
{:else if view === 'board'}
	<!-- ── לוח: בנייד גלילה אופקית בין העמודות, במחשב ארבע עמודות ── -->
	<div class="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
		{#each columns as col (col.id)}
			<section
				aria-label={col.label}
				class="flex w-[82%] flex-shrink-0 snap-start flex-col rounded-2xl border bg-[#141c2f] p-2.5 transition sm:w-[46%] lg:w-auto {dropAt?.status === col.id
					? 'border-sky-500/50 bg-sky-500/[0.04]'
					: 'border-white/10'}"
				ondragover={(e) => onDragOver(e, col.id)}
				ondrop={(e) => onDrop(e, col.id)}
			>
				<header class="mb-2 flex items-center gap-2 px-1">
					<span aria-hidden="true">{col.icon}</span>
					<h3 class="text-[14px] font-black text-white">{col.label}</h3>
					<span class="rounded-full bg-white/10 px-2 text-[12px] font-bold text-gray-300">{col.tasks.length}</span>
				</header>

				<div class="flex min-h-[4rem] flex-1 flex-col gap-2">
					{#each col.tasks as task (task.id)}
						{#if dropAt?.status === col.id && dropAt.beforeId === task.id && dragId !== task.id}
							<div class="h-1 rounded-full bg-sky-400" aria-hidden="true"></div>
						{/if}
						<TaskCard
							{task}
							{store}
							{onopen}
							ondragstart={onDragStart}
							ondragend={onDragEnd}
							dragging={dragId === task.id}
						/>
					{/each}
					{#if dropAt?.status === col.id && dropAt.beforeId === null}
						<div class="h-1 rounded-full bg-sky-400" aria-hidden="true"></div>
					{/if}
					{#if !col.tasks.length && dropAt?.status !== col.id}
						<p class="py-4 text-center text-[12px] text-gray-500">
							{filtering ? 'אין משימות תואמות' : 'ריק'}
						</p>
					{/if}
				</div>

				{#if col.id === 'done' && (col.hidden || showAllDone)}
					<button
						type="button"
						onclick={() => (showAllDone = !showAllDone)}
						class="mt-2 text-[12px] font-semibold text-gray-400 hover:text-white"
					>
						{showAllDone ? `הצגת ${DONE_RECENT_DAYS} הימים האחרונים בלבד` : `+ עוד ${col.hidden} שהושלמו מזמן`}
					</button>
				{/if}
			</section>
		{/each}
	</div>
	<p class="mt-2 hidden text-[12px] text-gray-500 lg:block">טיפ: גררו כרטיס בין העמודות כדי לעדכן סטטוס.</p>
{:else}
	<!-- ── רשימה ── -->
	<div class="overflow-hidden rounded-2xl border border-white/10">
		{#each listRows as task (task.id)}
			{@const st = statusOf(task.status)}
			{@const site = task.siteId ? getSite(task.siteId) : undefined}
			{@const overdue = isOverdue(task, today)}
			{@const editable = !!store.me && canEditTask(task, store.me)}
			<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-white/5 bg-[#141c2f] px-3 py-2.5 last:border-b-0 hover:bg-[#1b2335]">
				{#if editable}
					<label class="sr-only" for="st-{task.id}">סטטוס</label>
					<select
						id="st-{task.id}"
						value={task.status}
						onchange={(e) =>
							store.run({
								type: 'task.update',
								id: task.id,
								patch: { status: (e.currentTarget as HTMLSelectElement).value as TaskStatus }
							})}
						class="{SELECT} w-[9.5rem] py-1"
					>
						{#each STATUSES as s (s.id)}
							<option value={s.id}>{s.icon} {s.label}</option>
						{/each}
					</select>
				{:else}
					<span class="w-[9.5rem] text-[13px] text-gray-300">{st.icon} {st.label}</span>
				{/if}

				<button
					type="button"
					onclick={() => onopen(task.id)}
					class="min-w-0 flex-[1_1_14rem] truncate text-start text-[14px] font-semibold hover:underline {task.status === 'done'
						? 'text-gray-400 line-through'
						: 'text-white'}"
				>
					{#if store.isTaskUnread(task)}<span class="me-1 inline-block h-2 w-2 rounded-full bg-sky-400" title="עדכון חדש"></span>{/if}
					{task.title}
				</button>

				<span class="flex items-center gap-2 text-[12px]">
					{#if task.priority === 'urgent' || task.priority === 'high'}
						<span class="rounded-md border px-1.5 py-0.5 font-bold {priorityOf(task.priority).cls}">{priorityOf(task.priority).label}</span>
					{/if}
					{#if site}<span class="max-w-[8rem] truncate text-gray-400">{site.name}</span>{/if}
					{#if task.due}
						<span class="font-semibold {overdue ? 'text-red-300' : 'text-gray-300'}">📅 {dueLabel(task.due, today)}</span>
					{/if}
					<span class="flex -space-x-2 space-x-reverse">
						{#each task.assignees.slice(0, 3) as id (id)}
							<MemberAvatar member={store.member(id)} cls="h-6 w-6 text-[10px]" ring />
						{/each}
					</span>
				</span>
			</div>
		{:else}
			<p class="p-6 text-center text-sm text-gray-400">אין משימות תואמות</p>
		{/each}
	</div>
	{#if !showAllDone}
		<button type="button" onclick={() => (showAllDone = true)} class="mt-2 text-[12px] font-semibold text-gray-400 hover:text-white">
			הצגת גם משימות שהושלמו לפני יותר מ-{DONE_RECENT_DAYS} ימים
		</button>
	{/if}
{/if}
