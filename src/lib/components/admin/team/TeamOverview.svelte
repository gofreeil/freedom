<script lang="ts">
	// ============================================================
	// סקירת צוות: מספרי המפתח ומי עושה מה — עומס, איחורים, השלמות ודיווחים לכל
	// חבר צוות, ומי שקט כבר זמן רב (כדי לדעת למי כדאי לפנות). לחיצה על חבר צוות
	// מסננת את לוח המשימות אליו.
	// ============================================================
	import { getSite } from '$lib/sitesData';
	import { isOverdue, timeAgo, todayStr, waLink, type Member } from '$lib/teamBoard';
	import type { TeamStore } from './teamStore.svelte';
	import MemberAvatar from './MemberAvatar.svelte';

	let { store, onfilter }: { store: TeamStore; onfilter: (assignee: string) => void } = $props();

	const today = todayStr();
	const DAY = 86_400_000;
	const since7 = new Date(Date.now() - 7 * DAY).toISOString();
	const since30 = new Date(Date.now() - 30 * DAY).toISOString();
	const QUIET_DAYS = 14;

	const tasks = $derived(store.board.tasks);
	const reports = $derived(store.board.reports);

	const kpi = $derived({
		open: tasks.filter((t) => t.status !== 'done').length,
		overdue: tasks.filter((t) => isOverdue(t, today)).length,
		done7: tasks.filter((t) => t.status === 'done' && t.completedAt >= since7).length,
		reports7: reports.filter((r) => r.at >= since7).length,
		reach30: reports.filter((r) => r.at >= since30).reduce((n, r) => n + r.reach, 0),
		unassigned: tasks.filter((t) => t.status !== 'done' && !t.assignees.length).length
	});

	/** הפעילות האחרונה של חבר צוות בלוח — דיווח, תגובה או שינוי במשימה */
	function lastActive(id: string): string {
		let last = '';
		for (const r of reports) {
			if (r.by === id && r.at > last) last = r.at;
			for (const x of r.replies) if (x.by === id && x.at > last) last = x.at;
		}
		for (const t of tasks) for (const e of t.entries) if (e.by === id && e.at > last) last = e.at;
		return last;
	}

	const rows = $derived(
		store.team.map((m: Member) => {
			const mine = tasks.filter((t) => t.assignees.includes(m.id));
			const last = lastActive(m.id);
			return {
				m,
				open: mine.filter((t) => t.status !== 'done').length,
				overdue: mine.filter((t) => isOverdue(t, today)).length,
				done30: mine.filter((t) => t.status === 'done' && t.completedAt >= since30).length,
				reports30: reports.filter((r) => r.by === m.id && r.at >= since30).length,
				last,
				quiet: !last || Date.now() - Date.parse(last) > QUIET_DAYS * DAY
			};
		})
	);

	const TILE = 'rounded-2xl border border-white/10 bg-[#161e30] p-3 sm:p-4';
</script>

<!-- ── מספרי מפתח ── -->
<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
	<div class={TILE}>
		<p class="text-[12px] font-bold text-gray-400">📋 משימות פתוחות</p>
		<p class="mt-1 text-3xl font-black text-white">{kpi.open}</p>
		{#if kpi.unassigned}
			<button type="button" onclick={() => onfilter('__none')} class="mt-1 text-[12px] font-semibold text-amber-300 hover:underline">
				{kpi.unassigned} ללא אחראי ←
			</button>
		{/if}
	</div>
	<div class={TILE}>
		<p class="text-[12px] font-bold text-gray-400">⏰ באיחור</p>
		<p class="mt-1 text-3xl font-black {kpi.overdue ? 'text-red-300' : 'text-white'}">{kpi.overdue}</p>
		<p class="mt-1 text-[12px] text-gray-500">{kpi.overdue ? 'עברו את תאריך היעד' : 'הכל בזמן 👌'}</p>
	</div>
	<div class={TILE}>
		<p class="text-[12px] font-bold text-gray-400">✅ הושלמו השבוע</p>
		<p class="mt-1 text-3xl font-black text-emerald-300">{kpi.done7}</p>
		<p class="mt-1 text-[12px] text-gray-500">ב-7 הימים האחרונים</p>
	</div>
	<div class={TILE}>
		<p class="text-[12px] font-bold text-gray-400">📣 דיווחי פעילות השבוע</p>
		<p class="mt-1 text-3xl font-black text-amber-300">{kpi.reports7}</p>
		<p class="mt-1 text-[12px] text-gray-500">
			{kpi.reach30 ? `👥 ${kpi.reach30.toLocaleString('he-IL')} נחשפו ב-30 יום` : 'ב-7 הימים האחרונים'}
		</p>
	</div>
</div>

<!-- ── חברי הצוות ── -->
<h3 class="mt-6 mb-3 text-[15px] font-black text-white">👥 חברי הצוות</h3>
{#if !rows.length}
	<p class="rounded-2xl border border-white/10 bg-[#161e30] p-4 text-sm text-gray-400">
		עוד לא מונו רכזים לאתרי הרשת. מינוי רכז בלשונית "צוות הרכזים" מוסיף אותו לכאן.
	</p>
{:else}
	<div class="overflow-hidden rounded-2xl border border-white/10">
		<!-- כותרות (מחשב בלבד) -->
		<div class="hidden grid-cols-[minmax(0,1fr)_repeat(4,4.5rem)_7.5rem_5.5rem] items-center gap-2 border-b border-white/10 bg-[#182034] px-3 py-2 text-[11px] font-bold text-gray-400 md:grid">
			<span>חבר/ת צוות</span>
			<span class="text-center">פתוחות</span>
			<span class="text-center">באיחור</span>
			<span class="text-center">הושלמו<br />30 יום</span>
			<span class="text-center">דיווחים<br />30 יום</span>
			<span>פעילות אחרונה</span>
			<span></span>
		</div>
		{#each rows as row (row.m.id)}
			{@const m = row.m}
			<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-white/5 bg-[#141c2f] px-3 py-2.5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_repeat(4,4.5rem)_7.5rem_5.5rem]">
				<div class="flex min-w-0 items-center gap-2.5">
					<MemberAvatar member={m} cls="h-9 w-9 text-sm" />
					<div class="min-w-0">
						<p class="truncate text-[14px] font-bold text-white">
							{m.name}{m.id === store.me?.id ? ' (אני)' : ''}
							{#if m.isSuper}<span class="ms-1 text-[11px] font-semibold text-amber-300">מנהל הרשת</span>{/if}
						</p>
						<p class="truncate text-[12px] text-gray-500">
							{m.siteIds.map((id) => getSite(id)?.name).filter(Boolean).join(' · ') || m.role}
						</p>
						<!-- נייד: המספרים בשורה אחת מתחת לשם -->
						<p class="mt-0.5 flex flex-wrap gap-x-2 text-[12px] text-gray-300 md:hidden">
							<span>📋 {row.open}</span>
							{#if row.overdue}<span class="text-red-300">⏰ {row.overdue}</span>{/if}
							<span>✅ {row.done30}</span>
							<span>📣 {row.reports30}</span>
							<span class={row.quiet ? 'text-amber-300' : 'text-gray-500'}>· {row.last ? timeAgo(row.last) : 'טרם פעל/ה'}</span>
						</p>
					</div>
				</div>
				<span class="hidden text-center text-[15px] font-bold text-white md:block">{row.open}</span>
				<span class="hidden text-center text-[15px] font-bold md:block {row.overdue ? 'text-red-300' : 'text-gray-500'}">{row.overdue}</span>
				<span class="hidden text-center text-[15px] font-bold text-emerald-300 md:block">{row.done30}</span>
				<span class="hidden text-center text-[15px] font-bold text-amber-300 md:block">{row.reports30}</span>
				<span class="hidden text-[12px] md:block {row.quiet ? 'font-semibold text-amber-300' : 'text-gray-400'}">
					{row.last ? timeAgo(row.last) : 'טרם פעל/ה בלוח'}
					{#if row.quiet && row.last}<span class="block text-[11px] font-normal text-amber-300/80">שקט {QUIET_DAYS}+ ימים</span>{/if}
				</span>
				<span class="flex items-center justify-end gap-1">
					<button
						type="button"
						onclick={() => onfilter(m.id)}
						title="המשימות של {m.name}"
						class="rounded-lg border border-white/10 px-2 py-1 text-[12px] text-gray-200 hover:bg-[#272f3f]"
					>
						📋
					</button>
					{#if m.phone && m.id !== store.me?.id}
						<a
							href={waLink(m.phone, `היי ${m.name} 👋`)}
							target="_blank"
							rel="noopener noreferrer"
							title="וואטסאפ ל{m.name}"
							class="rounded-lg border border-emerald-500/30 px-2 py-1 text-[12px] text-emerald-200 hover:bg-emerald-500/10"
						>
							📲
						</a>
					{/if}
				</span>
			</div>
		{/each}
	</div>
{/if}
