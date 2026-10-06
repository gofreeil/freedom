<script lang="ts">
	// ============================================================
	// פרטי משימה — חלונית צד (מסך מלא בנייד): סטטוס, אחראים, יעד, תיאור,
	// רשימת תיוג, שליחה בוואטסאפ, ושרשור העדכונים/פידבק עם יומן הפעילות.
	// שדות טקסט נשמרים ביציאה מהשדה; כל השאר — מיד בלחיצה.
	// ============================================================
	import { tick, untrack } from 'svelte';
	import { SITES, getSite } from '$lib/sitesData';
	import {
		PRIORITIES,
		STATUSES,
		canDeleteTask,
		canEditTask,
		dueLabel,
		isOverdue,
		newId,
		priorityOf,
		statusOf,
		timeAgo,
		todayStr,
		waLink,
		type BoardTask,
		type TaskEntry,
		type TaskPatch
	} from '$lib/teamBoard';
	import type { TeamStore } from './teamStore.svelte';
	import MemberAvatar from './MemberAvatar.svelte';

	let {
		store,
		taskId,
		onclose,
		onreport
	}: {
		store: TeamStore;
		taskId: string;
		onclose: () => void;
		onreport: (taskId: string) => void;
	} = $props();

	const task = $derived(store.board.tasks.find((t) => t.id === taskId));
	const editable = $derived(!!task && !!store.me && canEditTask(task, store.me));
	const deletable = $derived(!!task && !!store.me && canDeleteTask(task, store.me));
	const today = todayStr();

	// טיוטות מקומיות לשדות טקסט — מתאפסות כשעוברים למשימה אחרת
	let title = $state('');
	let description = $state('');
	let comment = $state('');
	let newCheck = $state('');
	let pickAssignees = $state(false);
	let copied = $state(false);
	let loadedFor = '';
	$effect(() => {
		if (task && loadedFor !== task.id) {
			loadedFor = task.id;
			title = task.title;
			description = task.description;
			comment = '';
			newCheck = '';
			pickAssignees = false;
		}
	});
	// כל עוד החלונית פתוחה — מה שמגיע בה (גם מרענון) נחשב כנקרא
	$effect(() => {
		if (!task) return;
		void task.entries.length;
		const id = task.id;
		untrack(() => store.markTaskSeen(id));
	});
	// עדכון מבחוץ (רענון מהשרת) — מעדכן את השדה רק אם לא עורכים אותו עכשיו
	let editingTitle = false;
	let editingDesc = false;
	$effect(() => {
		if (!task) return;
		if (!editingTitle) title = task.title;
		if (!editingDesc) description = task.description;
	});

	function update(patch: TaskPatch) {
		if (task) store.run({ type: 'task.update', id: task.id, patch });
	}

	function saveTitle() {
		editingTitle = false;
		const t = title.trim();
		if (!task || !t || t === task.title) {
			if (task) title = task.title;
			return;
		}
		update({ title: t });
	}

	function saveDescription() {
		editingDesc = false;
		if (task && description.trim() !== task.description) update({ description });
	}

	function toggleAssignee(id: string) {
		if (!task) return;
		const next = task.assignees.includes(id) ? task.assignees.filter((a) => a !== id) : [...task.assignees, id];
		update({ assignees: next });
	}

	function addCheck(e: SubmitEvent) {
		e.preventDefault();
		if (!task || !newCheck.trim()) return;
		if (store.run({ type: 'check.add', taskId: task.id, id: newId(), text: newCheck })) newCheck = '';
	}

	let scroller: HTMLElement | undefined = $state();
	async function sendComment(e?: Event) {
		e?.preventDefault();
		if (!task || !comment.trim()) return;
		if (store.run({ type: 'comment.add', taskId: task.id, id: newId(), text: comment })) {
			comment = '';
			await tick();
			scroller?.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
		}
	}

	function remove() {
		if (!task) return;
		if (!confirm(`למחוק את המשימה "${task.title}"? אי אפשר לשחזר.`)) return;
		store.run({ type: 'task.delete', id: task.id }, 'המשימה נמחקה');
		onclose();
	}

	const link = $derived(typeof location !== 'undefined' ? `${location.origin}/admin?task=${taskId}` : '');
	async function copyLink() {
		try {
			await navigator.clipboard.writeText(link);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {}
	}

	function waText(t: BoardTask, name: string): string {
		const lines = [`היי ${name} 👋`, `משימה בלוח הצוות של יוצאים לחירות:`, `📌 ${t.title}`];
		if (t.due) lines.push(`📅 יעד: ${dueLabel(t.due, today)}`);
		if (t.priority === 'urgent') lines.push('🔴 דחוף');
		lines.push('', `לפרטים ולעדכון: ${link}`);
		return lines.join('\n');
	}

	function entryText(e: Extract<TaskEntry, { kind: 'event' }>): string {
		switch (e.event) {
			case 'created':
				return 'יצר/ה את המשימה';
			case 'status': {
				const s = statusOf(e.value);
				return `העביר/ה ל${s.icon} «${s.label}»`;
			}
			case 'priority':
				return `קבע/ה עדיפות «${priorityOf(e.value).label}»`;
			case 'due':
				return e.value ? `קבע/ה תאריך יעד ${dueLabel(e.value, today)}` : 'הסיר/ה את תאריך היעד';
			case 'assign': {
				const names = e.value
					.split(',')
					.filter(Boolean)
					.map((id) => store.member(id).name);
				return names.length ? `שייך/ה ל${names.join(', ')}` : 'הסיר/ה את האחראים';
			}
		}
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && !pickAssignees) onclose();
	}

	const LABEL = 'text-[12px] font-bold text-gray-400';
	const FIELD =
		'w-full rounded-lg border border-white/10 bg-[#1b2335] px-2.5 py-2 text-[14px] text-white focus:border-sky-500 focus:outline-none disabled:opacity-70';
</script>

<svelte:window onkeydown={onKey} />

<div
	class="fixed inset-0 z-[70] flex justify-end bg-black/60 backdrop-blur-[2px]"
	role="presentation"
	onclick={(e) => e.target === e.currentTarget && onclose()}
>
	<div
		class="flex h-full w-full flex-col border-white/10 bg-[#0b1220] shadow-2xl sm:max-w-xl sm:border-s"
		role="dialog"
		aria-modal="true"
		aria-labelledby="task-title"
		dir="rtl"
	>
		{#if !task}
			<div class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
				<p class="text-gray-300">המשימה לא נמצאה — אולי נמחקה.</p>
				<button type="button" onclick={onclose} class="rounded-lg border border-white/15 px-4 py-1.5 text-sm text-gray-200 hover:bg-[#272f3f]">סגירה</button>
			</div>
		{:else}
			<!-- ── כותרת עליונה ── -->
			<div class="flex items-center gap-2 border-b border-white/10 px-4 py-3">
				<span class="text-[12px] font-semibold text-gray-400">
					{statusOf(task.status).icon} {statusOf(task.status).label}
					{#if isOverdue(task, today)}<span class="ms-1 font-bold text-red-300">· באיחור</span>{/if}
				</span>
				<div class="ms-auto flex items-center gap-1">
					<button type="button" onclick={copyLink} class="rounded-lg px-2 py-1 text-[12px] text-gray-300 hover:bg-[#272f3f]" title="העתקת קישור ישיר למשימה">
						{copied ? '✓ הועתק' : '🔗 קישור'}
					</button>
					{#if deletable}
						<button type="button" onclick={remove} class="rounded-lg px-2 py-1 text-[12px] text-red-300 hover:bg-red-500/10">🗑️ מחיקה</button>
					{/if}
					<button type="button" onclick={onclose} aria-label="סגירה" class="rounded-lg px-2 py-1 text-lg leading-none text-gray-300 hover:bg-[#272f3f]">✕</button>
				</div>
			</div>

			<div bind:this={scroller} class="flex-1 overflow-y-auto px-4 py-4">
				<!-- כותרת המשימה -->
				<label for="task-title" class="sr-only">כותרת</label>
				<textarea
					id="task-title"
					bind:value={title}
					disabled={!editable}
					rows="2"
					maxlength="200"
					onfocus={() => (editingTitle = true)}
					onblur={saveTitle}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							(e.currentTarget as HTMLTextAreaElement).blur();
						}
					}}
					class="w-full resize-none rounded-lg border border-transparent bg-transparent px-1 py-1 text-xl leading-snug font-black text-white hover:border-white/10 focus:border-sky-500 focus:outline-none disabled:hover:border-transparent"
				></textarea>

				<!-- סטטוס -->
				<div class="mt-3 grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-[#161e30] p-1" role="group" aria-label="סטטוס">
					{#each STATUSES as s (s.id)}
						<button
							type="button"
							disabled={!editable}
							onclick={() => update({ status: s.id })}
							aria-pressed={task.status === s.id}
							class="rounded-lg px-1 py-2 text-[12px] font-bold transition disabled:cursor-default sm:text-[13px] {task.status === s.id
								? s.id === 'done'
									? 'bg-emerald-600 text-white'
									: 'bg-sky-600 text-white'
								: 'text-gray-300 enabled:hover:bg-[#272f3f]'}"
						>
							<span aria-hidden="true">{s.icon}</span>
							{s.label}
						</button>
					{/each}
				</div>

				{#if task.status === 'done' && task.assignees.includes(store.me?.id ?? '')}
					<button
						type="button"
						onclick={() => onreport(task.id)}
						class="mt-2 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[13px] font-bold text-emerald-200 transition hover:bg-emerald-500/20"
					>
						🎉 כל הכבוד! ספרו לצוות מה עשיתם — דיווח פעילות
					</button>
				{/if}

				<!-- מאפיינים -->
				<div class="mt-4 grid grid-cols-2 gap-3">
					<div>
						<label for="task-prio" class={LABEL}>עדיפות</label>
						<select id="task-prio" disabled={!editable} value={task.priority} onchange={(e) => update({ priority: (e.currentTarget as HTMLSelectElement).value as BoardTask['priority'] })} class="{FIELD} mt-1">
							{#each PRIORITIES as p (p.id)}
								<option value={p.id}>{p.icon} {p.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="task-due" class={LABEL}>תאריך יעד</label>
						<div class="mt-1 flex gap-1">
							<input
								id="task-due"
								type="date"
								disabled={!editable}
								value={task.due}
								onchange={(e) => update({ due: (e.currentTarget as HTMLInputElement).value })}
								class="{FIELD} [color-scheme:dark]"
							/>
							{#if task.due && editable}
								<button type="button" onclick={() => update({ due: '' })} aria-label="הסרת תאריך" class="rounded-lg border border-white/10 px-2 text-gray-400 hover:bg-[#272f3f]">✕</button>
							{/if}
						</div>
					</div>
					<div class="col-span-2">
						<label for="task-site" class={LABEL}>אתר</label>
						<select id="task-site" disabled={!editable} value={task.siteId} onchange={(e) => update({ siteId: (e.currentTarget as HTMLSelectElement).value })} class="{FIELD} mt-1">
							<option value="">🌐 כלל הרשת</option>
							{#each SITES as s (s.id)}
								<option value={s.id}>{s.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- אחראים -->
				<div class="mt-4">
					<div class="flex items-center justify-between">
						<span class={LABEL}>אחראים</span>
						{#if editable}
							<button type="button" onclick={() => (pickAssignees = !pickAssignees)} class="text-[12px] font-bold text-sky-300 hover:text-sky-200">
								{pickAssignees ? 'סיום' : '＋ שינוי'}
							</button>
						{/if}
					</div>
					{#if pickAssignees}
						<div class="mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[#161e30] p-1">
							{#each store.team as m (m.id)}
								{@const on = task.assignees.includes(m.id)}
								<button
									type="button"
									onclick={() => toggleAssignee(m.id)}
									aria-pressed={on}
									class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition hover:bg-[#272f3f] {on ? 'bg-sky-500/15' : ''}"
								>
									<span class="flex h-4 w-4 items-center justify-center rounded border text-[10px] {on ? 'border-sky-400 bg-sky-500 text-white' : 'border-white/30'}">{on ? '✓' : ''}</span>
									<MemberAvatar member={m} cls="h-7 w-7 text-xs" />
									<span class="min-w-0 flex-1">
										<span class="block truncate text-[13px] font-bold text-white">{m.name}{m.id === store.me?.id ? ' (אני)' : ''}</span>
										<span class="block truncate text-[11px] text-gray-400">
											{m.siteIds.map((id) => getSite(id)?.name).filter(Boolean).join(' · ') || m.role}
										</span>
									</span>
								</button>
							{/each}
						</div>
					{:else if task.assignees.length}
						<ul class="mt-2 space-y-1.5">
							{#each task.assignees as id (id)}
								{@const m = store.member(id)}
								<li class="flex items-center gap-2 rounded-xl border border-white/5 bg-[#161e30] px-2 py-1.5">
									<MemberAvatar member={m} cls="h-8 w-8 text-xs" />
									<span class="min-w-0 flex-1 truncate text-[14px] font-semibold text-white">{m.name}</span>
									{#if m.phone && id !== store.me?.id}
										<a
											href={waLink(m.phone, waText(task, m.name))}
											target="_blank"
											rel="noopener noreferrer"
											class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[12px] font-bold text-emerald-200 transition hover:bg-emerald-500/20"
											title="שליחת המשימה בוואטסאפ עם קישור ישיר אליה"
										>
											📲 וואטסאפ
										</a>
									{/if}
									{#if m.email && id !== store.me?.id}
										<a href="mailto:{m.email}?subject={encodeURIComponent('משימה: ' + task.title)}&body={encodeURIComponent(waText(task, m.name))}" class="rounded-lg border border-white/10 px-2 py-1 text-[12px] text-gray-300 hover:bg-[#272f3f]" title="שליחה במייל">📧</a>
									{/if}
								</li>
							{/each}
						</ul>
					{:else}
						<p class="mt-1 text-[13px] text-gray-500">אין אחראי/ת עדיין{editable ? ' — לחצו "שינוי" כדי לשייך' : ''}</p>
					{/if}
				</div>

				<!-- תיאור -->
				<div class="mt-4">
					<label for="task-desc" class={LABEL}>תיאור</label>
					<textarea
						id="task-desc"
						bind:value={description}
						disabled={!editable}
						rows="4"
						maxlength="5000"
						placeholder={editable ? 'פרטים, קישורים, הקשר — מה בדיוק צריך לקרות?' : ''}
						onfocus={() => (editingDesc = true)}
						onblur={saveDescription}
						class="{FIELD} mt-1 resize-y leading-relaxed placeholder:text-gray-500"
					></textarea>
				</div>

				<!-- רשימת תיוג -->
				<div class="mt-4">
					{#if task.checklist.length}
						{@const done = task.checklist.filter((c) => c.done).length}
						<div class="flex items-center justify-between">
							<span class={LABEL}>רשימת תיוג</span>
							<span class="text-[12px] font-bold text-gray-400">{done}/{task.checklist.length}</span>
						</div>
						<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
							<div class="h-full rounded-full bg-emerald-500 transition-all" style="width: {(done / task.checklist.length) * 100}%"></div>
						</div>
						<ul class="mt-2 space-y-0.5">
							{#each task.checklist as c (c.id)}
								<li class="group flex items-start gap-2 rounded-lg px-1 py-1 hover:bg-[#182034]">
									<input
										type="checkbox"
										id="chk-{c.id}"
										checked={c.done}
										disabled={!editable}
										onchange={() => store.run({ type: 'check.toggle', taskId: task.id, id: c.id })}
										class="mt-0.5 h-4 w-4 accent-emerald-500"
									/>
									<label for="chk-{c.id}" class="flex-1 text-[14px] {c.done ? 'text-gray-500 line-through' : 'text-gray-200'}">{c.text}</label>
									{#if editable}
										<button type="button" onclick={() => store.run({ type: 'check.remove', taskId: task.id, id: c.id })} aria-label="הסרה" class="text-[12px] text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-300 focus:opacity-100">✕</button>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
					{#if editable}
						<form onsubmit={addCheck} class="mt-2 flex gap-1.5">
							<label for="new-check" class="sr-only">פריט חדש לרשימת התיוג</label>
							<input id="new-check" bind:value={newCheck} maxlength="300" placeholder="☑ הוספת שלב / תת-משימה" class="{FIELD} placeholder:text-gray-500" />
							<button type="submit" disabled={!newCheck.trim()} class="rounded-lg border border-white/10 px-3 text-[13px] font-bold text-gray-200 hover:bg-[#272f3f] disabled:opacity-40">הוספה</button>
						</form>
					{/if}
				</div>

				<!-- שרשור: עדכונים ופידבק + יומן פעילות -->
				<div class="mt-6">
					<h3 class="mb-2 text-[14px] font-black text-white">💬 עדכונים ופידבק</h3>
					<ol class="space-y-2">
						{#each task.entries as e (e.id)}
							{@const m = store.member(e.by)}
							{#if e.kind === 'event'}
								<li class="flex items-center gap-2 ps-1 text-[12px] text-gray-500">
									<span aria-hidden="true">•</span>
									<span><span class="font-semibold text-gray-400">{m.name}</span> {entryText(e)}</span>
									<span class="ms-auto whitespace-nowrap">{timeAgo(e.at)}</span>
								</li>
							{:else}
								<li class="flex gap-2">
									<MemberAvatar member={m} cls="h-8 w-8 text-xs" />
									<div class="min-w-0 flex-1 rounded-xl rounded-tr-sm border border-white/10 bg-[#182034] px-3 py-2">
										<div class="flex items-baseline gap-2">
											<span class="text-[13px] font-bold text-white">{m.name}</span>
											<span class="text-[11px] text-gray-500">{timeAgo(e.at)}</span>
											{#if e.by === store.me?.id || store.me?.isSuper}
												<button
													type="button"
													onclick={() => confirm('למחוק את התגובה?') && store.run({ type: 'comment.remove', taskId: task.id, id: e.id })}
													class="ms-auto text-[11px] text-gray-500 hover:text-red-300"
												>
													מחיקה
												</button>
											{/if}
										</div>
										<p class="mt-0.5 text-[14px] leading-relaxed break-words whitespace-pre-line text-gray-200">{e.text}</p>
									</div>
								</li>
							{/if}
						{/each}
					</ol>
				</div>
			</div>

			<!-- ── כתיבת עדכון (דבוק לתחתית) ── -->
			<form onsubmit={sendComment} class="flex items-end gap-2 border-t border-white/10 bg-[#0b1220] px-4 py-3">
				<label for="task-comment" class="sr-only">עדכון או פידבק</label>
				<textarea
					id="task-comment"
					bind:value={comment}
					rows="2"
					maxlength="2000"
					placeholder="כתבו עדכון, שאלה או פידבק… (Ctrl+Enter לשליחה)"
					onkeydown={(e) => {
						if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendComment(e);
					}}
					class="{FIELD} resize-none placeholder:text-gray-500"
				></textarea>
				<button
					type="submit"
					disabled={!comment.trim()}
					class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-black text-white transition hover:opacity-90 disabled:opacity-40"
				>
					שליחה
				</button>
			</form>
		{/if}
	</div>
</div>
