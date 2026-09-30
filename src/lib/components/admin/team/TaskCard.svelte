<script lang="ts">
	// כרטיס משימה בלוח — לחיצה פותחת את הפרטים; גרירה (במחשב) מעבירה בין עמודות
	import { getSite } from '$lib/sitesData';
	import { canEditTask, dueLabel, isOverdue, priorityOf, todayStr, type BoardTask } from '$lib/teamBoard';
	import type { TeamStore } from './teamStore.svelte';
	import MemberAvatar from './MemberAvatar.svelte';

	let {
		task,
		store,
		onopen,
		ondragstart,
		ondragend,
		dragging = false
	}: {
		task: BoardTask;
		store: TeamStore;
		onopen: (id: string) => void;
		ondragstart?: (e: DragEvent, task: BoardTask) => void;
		ondragend?: () => void;
		dragging?: boolean;
	} = $props();

	const today = todayStr();
	const site = $derived(task.siteId ? getSite(task.siteId) : undefined);
	const prio = $derived(priorityOf(task.priority));
	const overdue = $derived(isOverdue(task, today));
	const due = $derived(dueLabel(task.due, today));
	const soon = $derived(!overdue && task.status !== 'done' && (due === 'היום' || due === 'מחר'));
	const checks = $derived(task.checklist.length ? `${task.checklist.filter((c) => c.done).length}/${task.checklist.length}` : '');
	const comments = $derived(task.entries.filter((e) => e.kind === 'comment').length);
	const unread = $derived(store.isTaskUnread(task));
	const draggable = $derived(!!store.me && canEditTask(task, store.me));
</script>

<div
	role="button"
	tabindex="0"
	draggable={draggable ? 'true' : 'false'}
	ondragstart={(e) => ondragstart?.(e, task)}
	{ondragend}
	onclick={() => onopen(task.id)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onopen(task.id);
		}
	}}
	data-task-id={task.id}
	class="group relative cursor-pointer rounded-xl border bg-[#0f172a] p-3 text-start shadow-sm transition hover:border-white/25 hover:bg-[#131c33] {dragging
		? 'opacity-40'
		: ''} {task.status === 'done' ? 'border-white/5 opacity-75' : 'border-white/10'}"
>
	<!-- פס עדיפות בצד -->
	{#if task.priority === 'urgent' || task.priority === 'high'}
		<span
			class="absolute inset-y-2 right-0 w-1 rounded-l {task.priority === 'urgent' ? 'bg-red-500' : 'bg-orange-400'}"
			aria-hidden="true"
		></span>
	{/if}

	{#if unread}
		<span class="absolute -top-1 -left-1 flex h-3 w-3" title="עדכון חדש">
			<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60"></span>
			<span class="relative inline-flex h-3 w-3 rounded-full bg-sky-400"></span>
		</span>
		<span class="sr-only">עדכון חדש</span>
	{/if}

	<div class="flex items-start gap-2">
		<p
			class="line-clamp-3 flex-1 text-[14px] leading-snug font-semibold {task.status === 'done'
				? 'text-gray-400 line-through decoration-gray-600'
				: 'text-white'}"
		>
			{task.title}
		</p>
	</div>

	<div class="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
		{#if task.priority === 'urgent' || task.priority === 'high'}
			<span class="rounded-md border px-1.5 py-0.5 font-bold {prio.cls}">{prio.label}</span>
		{/if}
		{#if task.due}
			<span
				class="rounded-md border px-1.5 py-0.5 font-semibold {overdue
					? 'border-red-500/40 bg-red-500/15 text-red-300'
					: soon
						? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
						: 'border-white/10 bg-white/5 text-gray-300'}"
				title="תאריך יעד"
			>
				📅 {due}{overdue ? ' · באיחור' : ''}
			</span>
		{/if}
		{#if site}
			<span class="flex max-w-[9rem] items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-gray-300" title={site.name}>
				{#if site.image}<img src={site.image} alt="" class="h-3.5 w-3.5 rounded-sm object-cover" />{/if}
				<span class="truncate">{site.name}</span>
			</span>
		{/if}
		{#if checks}
			<span class="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-gray-300" title="רשימת תיוג">☑ {checks}</span>
		{/if}
		{#if comments}
			<span class="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-gray-300" title="תגובות">💬 {comments}</span>
		{/if}

		{#if task.assignees.length}
			<span class="ms-auto flex -space-x-2 space-x-reverse">
				{#each task.assignees.slice(0, 3) as id (id)}
					<MemberAvatar member={store.member(id)} cls="h-6 w-6 text-[10px]" ring />
				{/each}
				{#if task.assignees.length > 3}
					<span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-gray-200 ring-2 ring-[#0b1220]">
						+{task.assignees.length - 3}
					</span>
				{/if}
			</span>
		{/if}
	</div>
</div>
