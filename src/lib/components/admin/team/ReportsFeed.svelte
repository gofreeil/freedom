<script lang="ts">
	// ============================================================
	// דיווחי פעילות: כל חבר צוות משתף מה עשה לקידום התנועה, והצוות מגיב —
	// תגובות מהירות באימוג'י ושרשור פידבק לכל דיווח. דיווח יכול להיקשר למשימה.
	// ============================================================
	import { onMount, tick } from 'svelte';
	import { getSite } from '$lib/sitesData';
	import {
		REACTIONS,
		REPORT_CATEGORIES,
		categoryOf,
		newId,
		timeAgo,
		type BoardReport,
		type ReportCategory
	} from '$lib/teamBoard';
	import type { TeamStore } from './teamStore.svelte';
	import MemberAvatar from './MemberAvatar.svelte';

	let {
		store,
		presetTaskId = '',
		onpresetused,
		onopentask
	}: {
		store: TeamStore;
		presetTaskId?: string;
		onpresetused?: () => void;
		onopentask: (id: string) => void;
	} = $props();

	// מה נחשב "חדש" — נקבע בכניסה ללשונית, כך שההדגשה נשארת עד היציאה ממנה
	let seenBefore = $state('');
	onMount(() => {
		seenBefore = store.seen.r || store.seen.base;
		store.markReportsSeen();
	});

	// ── כתיבת דיווח ──
	let text = $state('');
	let category = $state<ReportCategory>('outreach');
	let link = $state('');
	let reach = $state<number | null>(null);
	let taskId = $state('');
	let details = $state(false);
	let textEl: HTMLTextAreaElement | undefined = $state();

	$effect(() => {
		if (!presetTaskId) return;
		taskId = presetTaskId;
		details = true;
		onpresetused?.();
		tick().then(() => textEl?.focus());
	});

	const me = $derived(store.me ? store.member(store.me.id) : null);
	const myLast = $derived(
		store.board.reports.filter((r) => r.by === store.me?.id).reduce((m, r) => (r.at > m ? r.at : m), '')
	);
	const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
	const nudge = $derived(!myLast || myLast < weekAgo);

	// משימות לקישור: שלי קודם, פתוחות ושהושלמו לאחרונה
	const linkable = $derived(
		[...store.board.tasks]
			.filter((t) => t.status !== 'done' || (t.completedAt || '') >= weekAgo.slice(0, 10) || t.id === taskId)
			.sort(
				(a, b) =>
					Number(b.assignees.includes(store.me?.id ?? '')) - Number(a.assignees.includes(store.me?.id ?? '')) ||
					b.updatedAt.localeCompare(a.updatedAt)
			)
			.slice(0, 80)
	);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		const body = text.trim();
		if (body.length < 3) return;
		const ok = store.run(
			{
				type: 'report.add',
				id: newId(),
				category,
				text: body,
				link: link.trim(),
				reach: reach ?? 0,
				taskId
			},
			'הדיווח פורסם לצוות 🙌'
		);
		if (ok) {
			text = '';
			link = '';
			reach = null;
			taskId = '';
			details = false;
		}
	}

	// ── הפיד ──
	let filterBy = $state('');
	let filterCat = $state('');
	let shown = $state(20);
	const feed = $derived(
		[...store.board.reports]
			.filter((r) => (!filterBy || r.by === filterBy) && (!filterCat || r.category === filterCat))
			.sort((a, b) => b.at.localeCompare(a.at))
	);

	let replyDrafts = $state<Record<string, string>>({});
	let openReplies = $state<Record<string, boolean>>({});

	function reply(e: SubmitEvent, r: BoardReport) {
		e.preventDefault();
		const t = (replyDrafts[r.id] ?? '').trim();
		if (!t) return;
		if (store.run({ type: 'report.reply', reportId: r.id, id: newId(), text: t })) replyDrafts[r.id] = '';
	}

	const reactedBy = (ids: string[]) => ids.map((id) => store.member(id).name).join(', ');
	const hostOf = (url: string) => {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return url;
		}
	};

	const FIELD =
		'w-full rounded-lg border border-white/10 bg-[#0b1220] px-2.5 py-2 text-[14px] text-white placeholder:text-gray-500 focus:border-sky-500 focus:outline-none';
</script>

<!-- ── כתיבת דיווח ── -->
<form onsubmit={submit} class="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
	{#if nudge}
		<p class="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[13px] text-amber-100">
			👋 {myLast ? 'עבר שבוע מהדיווח האחרון שלך' : 'עוד לא שיתפת דיווח'} — ספר/י לצוות מה עשית לקידום התנועה. גם צעד קטן נחשב!
		</p>
	{/if}
	<div class="flex gap-3">
		{#if me}<MemberAvatar member={me} cls="hidden h-10 w-10 text-sm sm:inline-flex" />{/if}
		<div class="min-w-0 flex-1">
			<label for="report-text" class="sr-only">מה עשית לקידום התנועה?</label>
			<textarea
				id="report-text"
				bind:this={textEl}
				bind:value={text}
				rows="3"
				maxlength="3000"
				placeholder="מה עשית לקידום התנועה? פוסט, מפגש, שיחה עם שותף, שיפור באתר, מענה לגולשים…"
				class="{FIELD} resize-y leading-relaxed"
			></textarea>

			<div class="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="סוג הפעולה">
				{#each REPORT_CATEGORIES as c (c.id)}
					<button
						type="button"
						role="radio"
						aria-checked={category === c.id}
						onclick={() => (category = c.id)}
						class="rounded-full border px-2.5 py-1 text-[12px] font-semibold transition {category === c.id
							? 'border-amber-400/60 bg-amber-500/15 text-amber-100'
							: 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'}"
					>
						{c.icon} {c.label}
					</button>
				{/each}
			</div>

			{#if details}
				<div class="mt-3 grid gap-2 sm:grid-cols-3">
					<div class="sm:col-span-1">
						<label for="report-link" class="text-[12px] font-bold text-gray-400">קישור (לא חובה)</label>
						<input id="report-link" type="url" bind:value={link} maxlength="500" placeholder="https://…" dir="ltr" class="{FIELD} mt-1 text-left" />
					</div>
					<div>
						<label for="report-reach" class="text-[12px] font-bold text-gray-400">כמה אנשים נחשפו / השתתפו?</label>
						<input id="report-reach" type="number" min="0" inputmode="numeric" bind:value={reach} placeholder="למשל 250" class="{FIELD} mt-1" />
					</div>
					<div>
						<label for="report-task" class="text-[12px] font-bold text-gray-400">משימה קשורה</label>
						<select id="report-task" bind:value={taskId} class="{FIELD} mt-1">
							<option value="">— ללא —</option>
							{#each linkable as t (t.id)}
								<option value={t.id}>{t.title}</option>
							{/each}
						</select>
					</div>
				</div>
			{/if}

			<div class="mt-3 flex flex-wrap items-center gap-2">
				<button
					type="submit"
					disabled={text.trim().length < 3}
					class="rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 px-5 py-2 text-sm font-black text-white transition hover:opacity-90 disabled:opacity-40"
				>
					📣 פרסום לצוות
				</button>
				{#if !details}
					<button type="button" onclick={() => (details = true)} class="text-[13px] font-semibold text-gray-400 hover:text-white">
						＋ קישור, היקף חשיפה ומשימה קשורה
					</button>
				{/if}
			</div>
		</div>
	</div>
</form>

<!-- ── סינון ── -->
<div class="mb-3 flex flex-wrap items-center gap-2">
	<h3 class="me-auto text-[15px] font-black text-white">הפעילות של הצוות</h3>
	<label for="rf-by" class="sr-only">מדווח/ת</label>
	<select id="rf-by" bind:value={filterBy} class="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[13px] text-gray-200">
		<option value="">כל הצוות</option>
		{#each store.team as m (m.id)}
			<option value={m.id}>{m.name}</option>
		{/each}
	</select>
	<label for="rf-cat" class="sr-only">סוג</label>
	<select id="rf-cat" bind:value={filterCat} class="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[13px] text-gray-200">
		<option value="">כל הסוגים</option>
		{#each REPORT_CATEGORIES as c (c.id)}
			<option value={c.id}>{c.icon} {c.label}</option>
		{/each}
	</select>
</div>

<!-- ── הפיד ── -->
{#if !feed.length}
	<div class="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
		<p class="text-3xl" aria-hidden="true">📣</p>
		<p class="mt-2 font-bold text-white">{store.board.reports.length ? 'אין דיווחים תואמים' : 'עוד אין דיווחים'}</p>
		{#if !store.board.reports.length}
			<p class="mt-1 text-sm text-gray-400">היו הראשונים לשתף מה עשיתם — זה מה שמניע את כל הצוות.</p>
		{/if}
	</div>
{:else}
	<ul class="space-y-3">
		{#each feed.slice(0, shown) as r (r.id)}
			{@const m = store.member(r.by)}
			{@const cat = categoryOf(r.category)}
			{@const isNew = r.by !== store.me?.id && r.at > seenBefore}
			{@const task = r.taskId ? store.board.tasks.find((t) => t.id === r.taskId) : undefined}
			<li class="rounded-2xl border p-3 sm:p-4 {isNew ? 'border-sky-500/40 bg-sky-500/[0.05]' : 'border-white/10 bg-white/[0.03]'}">
				<div class="flex items-start gap-3">
					<MemberAvatar member={m} cls="h-10 w-10 text-sm" />
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
							<span class="text-[14px] font-black text-white">{m.name}</span>
							{#if m.siteIds.length}
								<span class="truncate text-[12px] text-gray-500">{m.siteIds.map((id) => getSite(id)?.name).filter(Boolean).join(' · ')}</span>
							{/if}
							<span class="text-[12px] text-gray-500">· {timeAgo(r.at)}</span>
							{#if isNew}<span class="rounded-full bg-sky-500 px-1.5 text-[10px] font-black text-white">חדש</span>{/if}
							<span class="ms-auto rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-gray-300">{cat.icon} {cat.label}</span>
						</div>

						<p class="mt-1.5 text-[14.5px] leading-relaxed break-words whitespace-pre-line text-gray-100">{r.text}</p>

						{#if r.link || r.reach || task}
							<div class="mt-2 flex flex-wrap gap-1.5 text-[12px]">
								{#if r.link}
									<a href={r.link} target="_blank" rel="noopener noreferrer" class="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-sky-300 hover:bg-white/10" dir="ltr">🔗 {hostOf(r.link)}</a>
								{/if}
								{#if r.reach}
									<span class="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-gray-200">👥 {r.reach.toLocaleString('he-IL')} נחשפו / השתתפו</span>
								{/if}
								{#if task}
									<button type="button" onclick={() => onopentask(task.id)} class="max-w-[16rem] truncate rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-gray-200 hover:bg-white/10">📌 {task.title}</button>
								{/if}
							</div>
						{/if}

						<!-- תגובות מהירות + פתיחת השרשור -->
						<div class="mt-2.5 flex flex-wrap items-center gap-1">
							{#each REACTIONS as emoji (emoji)}
								{@const who = r.reactions[emoji] ?? []}
								{@const mine = who.includes(store.me?.id ?? '')}
								<button
									type="button"
									onclick={() => store.run({ type: 'report.react', id: r.id, emoji })}
									aria-pressed={mine}
									title={who.length ? reactedBy(who) : 'הגיבו'}
									class="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[13px] transition {mine
										? 'border-sky-400/60 bg-sky-500/20'
										: who.length
											? 'border-white/15 bg-white/5 hover:bg-white/10'
											: 'border-transparent opacity-50 hover:border-white/10 hover:opacity-100'}"
								>
									<span>{emoji}</span>
									{#if who.length}<span class="text-[11px] font-bold text-gray-200">{who.length}</span>{/if}
								</button>
							{/each}
							<button
								type="button"
								onclick={() => (openReplies[r.id] = !openReplies[r.id])}
								class="ms-2 text-[12px] font-semibold text-gray-400 hover:text-white"
							>
								💬 {r.replies.length ? `${r.replies.length} תגובות` : 'פידבק'}
							</button>
							{#if r.by === store.me?.id || store.me?.isSuper}
								<button
									type="button"
									onclick={() => confirm('למחוק את הדיווח?') && store.run({ type: 'report.remove', id: r.id }, 'הדיווח נמחק')}
									class="ms-auto text-[11px] text-gray-500 hover:text-red-300"
								>
									מחיקה
								</button>
							{/if}
						</div>

						{#if openReplies[r.id] || r.replies.length}
							<div class="mt-2 space-y-1.5 border-s-2 border-white/10 ps-3">
								{#each r.replies as x (x.id)}
									{@const rm = store.member(x.by)}
									<div class="flex gap-2">
										<MemberAvatar member={rm} cls="h-6 w-6 text-[10px]" />
										<div class="min-w-0 flex-1">
											<span class="text-[12.5px] font-bold text-white">{rm.name}</span>
											<span class="text-[11px] text-gray-500">{timeAgo(x.at)}</span>
											{#if x.by === store.me?.id || store.me?.isSuper}
												<button
													type="button"
													onclick={() => confirm('למחוק את התגובה?') && store.run({ type: 'report.replyRemove', reportId: r.id, id: x.id })}
													class="ms-1 text-[11px] text-gray-500 hover:text-red-300"
												>
													מחיקה
												</button>
											{/if}
											<p class="text-[13.5px] leading-relaxed break-words whitespace-pre-line text-gray-200">{x.text}</p>
										</div>
									</div>
								{/each}
								{#if openReplies[r.id]}
									<form onsubmit={(e) => reply(e, r)} class="flex gap-1.5 pt-1">
										<label for="reply-{r.id}" class="sr-only">תגובה</label>
										<input
											id="reply-{r.id}"
											value={replyDrafts[r.id] ?? ''}
											oninput={(e) => (replyDrafts[r.id] = (e.currentTarget as HTMLInputElement).value)}
											maxlength="2000"
											placeholder="פידבק, מחמאה, שאלה…"
											class="{FIELD} py-1.5 text-[13px]"
										/>
										<button type="submit" class="rounded-lg border border-white/10 px-3 text-[12px] font-bold text-gray-200 hover:bg-white/10">שליחה</button>
									</form>
								{:else}
									<button type="button" onclick={() => (openReplies[r.id] = true)} class="text-[12px] text-gray-400 hover:text-white">↩ להגיב</button>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</li>
		{/each}
	</ul>
	{#if feed.length > shown}
		<button type="button" onclick={() => (shown += 20)} class="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 text-sm font-semibold text-gray-300 hover:bg-white/10">
			עוד דיווחים ({feed.length - shown})
		</button>
	{/if}
{/if}
