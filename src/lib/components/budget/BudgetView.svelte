<script lang="ts">
	// BudgetView.svelte — רכיב תצוגת תקציב והצבעה
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import BudgetAllocation from '$lib/components/budget/BudgetAllocation.svelte';
	import { nis, parseAllocation, type Allocation, type Ballot, type BudgetRound } from '$lib/budgetVote';

	interface Props {
		canVote: boolean;
	}

	let { canVote }: Props = $props();

	const BUDGET = [
		{ id: 'infra', label: 'עורכי דין', amount: 30_000, color: '#6366f1' },
		{ id: 'dev', label: 'פיתוח האתרים', amount: 25_000, color: '#a855f7' },
		{ id: 'marketing', label: 'שיווק ופרסום', amount: 20_000, color: '#f5d57a' },
		{ id: 'events', label: 'אירועים וקהילה', amount: 15_000, color: '#34d399' },
		{ id: 'charity', label: 'צדקה', amount: 5_000, color: '#f472b6' },
		{ id: 'reserve', label: 'רזרבה', amount: 5_000, color: '#64748b' }
	];
	const total = BUDGET.reduce((s, b) => s + b.amount, 0);
	const IDS = BUDGET.map((b) => b.id);

	const DAY = 86_400_000;
	const round = $derived<BudgetRound>({
		id: 'demo',
		total,
		categories: BUDGET,
		eligible: 12,
		closesAt: new Date(Date.now() + (page.url.searchParams.has('closed') ? -DAY : 14 * DAY)).toISOString()
	});

	const OTHER_VOTES: Allocation[] = [
		[30, 25, 20, 15, 5, 5],
		[25, 30, 20, 15, 5, 5],
		[20, 25, 30, 15, 5, 5],
		[35, 20, 15, 15, 10, 5],
		[25, 25, 25, 15, 5, 5],
		[30, 30, 15, 10, 10, 5],
		[20, 20, 35, 15, 5, 5]
	].map((row) => Object.fromEntries(IDS.map((id, i) => [id, row[i]])));

	const VOTE_KEY = 'budget_alloc_vote_mock';
	let mine = $state<Ballot | null>(null);

	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(VOTE_KEY) ?? 'null');
			const alloc = parseAllocation(saved?.alloc, IDS);
			if (alloc) mine = { alloc, at: typeof saved.at === 'string' ? saved.at : '' };
		} catch {}
	});

	async function save(alloc: Allocation) {
		mine = { alloc, at: new Date().toISOString() };
		try {
			localStorage.setItem(VOTE_KEY, JSON.stringify(mine));
		} catch {}
	}

	async function withdraw() {
		mine = null;
		try {
			localStorage.removeItem(VOTE_KEY);
		} catch {}
	}

	const INCOME = [
		{ label: 'דמי חבר במועדון', amount: 55_000, color: '#34d399' },
		{ label: 'תרומות', amount: 30_000, color: '#38bdf8' },
		{ label: 'עמלות קבוצות רכישה', amount: 15_000, color: '#f5d57a' }
	];
	const incomeTotal = INCOME.reduce((s, b) => s + b.amount, 0);

	const FLOW_H = 140;
	const FLOW_GAP = 8;
	const flowUsable = FLOW_H - FLOW_GAP * (INCOME.length - 1);
	const flowPad = (FLOW_H - flowUsable) / 2;
	const flows = (() => {
		let sy = 0;
		let ty = flowPad;
		return INCOME.map((b) => {
			const h = (b.amount / incomeTotal) * flowUsable;
			const f = { ...b, h, pct: (b.amount / incomeTotal) * 100, sy, ty };
			sy += h + FLOW_GAP;
			ty += h;
			return f;
		});
	})();

	const band = (f: { sy: number; ty: number; h: number }) =>
		`M100,${f.sy} C50,${f.sy} 50,${f.ty} 0,${f.ty} L0,${f.ty + f.h} C50,${f.ty + f.h} 50,${f.sy + f.h} 100,${f.sy + f.h} Z`;

	const EXPENSE_FLOW_H = 156;
	const expenseRowH = EXPENSE_FLOW_H / BUDGET.length;
	const expenseFlowUsable = 132;
	const expenseFlowPad = (EXPENSE_FLOW_H - expenseFlowUsable) / 2;
	const expenseFlows = (() => {
		let ty = expenseFlowPad;
		return BUDGET.map((b, i) => {
			const pct = (b.amount / total) * 100;
			const th = (b.amount / total) * expenseFlowUsable;
			const cy = (i + 0.5) * expenseRowH;
			const rh = Math.max(6, Math.min(20, (b.amount / total) * 36));
			const sy = cy - rh / 2;
			const f = { ...b, pct, sy, rh, ty, th };
			ty += th;
			return f;
		});
	})();

	const expenseBand = (f: { sy: number; rh: number; ty: number; th: number }) =>
		`M100,${f.sy} C50,${f.sy} 50,${f.ty} 0,${f.ty} L0,${f.ty + f.th} C50,${f.ty + f.th} 50,${f.sy + f.rh} 100,${f.sy + f.rh} Z`;
</script>

<div class="mx-auto max-w-4xl px-2 sm:px-4 py-2 sm:py-4" dir="rtl">
	<div class="mb-4 flex flex-wrap items-center gap-3">
		<h2 class="flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">💰</span> ניהול תקציב
		</h2>
		<span class="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-200">
			הדגמה — הנתונים אינם אמיתיים
		</span>
	</div>

	<!-- כסף נכנס: שלושה מקורות שמתנקזים לקופת התקציב -->
	<section class="mb-3 rounded-2xl border border-white/10 bg-[#141c2f] p-4 sm:p-5">
		<header class="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
			<div class="flex items-center gap-2.5">
				<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-sm ring-1 ring-emerald-500/30" aria-hidden="true">💰</span>
				<div class="flex items-baseline gap-2">
					<h3 class="text-sm font-black text-white sm:text-base">הכנסות</h3>
					<span class="text-xs text-gray-400">כסף נכנס לפי מקור</span>
				</div>
			</div>
			<span class="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
				3 מקורות
			</span>
		</header>
		<div class="flex items-stretch" style="height:{FLOW_H}px">
			<ul class="flex-shrink-0 text-[13px]">
				{#each flows as f, i}
					<li
						class="flex items-center gap-2 border-e-4 pe-2"
						style="height:{f.h}px; border-color:{f.color}; margin-bottom:{i < flows.length - 1 ? FLOW_GAP : 0}px"
					>
						<span class="font-bold text-white">{f.label}</span>
						<span class="tabular-nums text-gray-300">{nis(f.amount)}</span>
						<span class="hidden tabular-nums text-gray-400 sm:inline">{Math.round(f.pct)}%</span>
					</li>
				{/each}
			</ul>
			<svg viewBox="0 0 100 {FLOW_H}" preserveAspectRatio="none" class="h-full min-w-0 flex-1" aria-hidden="true">
				{#each flows as f}
					<path d={band(f)} fill={f.color} opacity="0.4" />
				{/each}
			</svg>
			<div
				class="flex flex-shrink-0 flex-col items-center justify-center rounded-lg border-s-4 border-indigo-400 bg-indigo-500/15 px-3 text-center"
				style="height:{flowUsable}px; margin-top:{flowPad}px"
			>
				<span class="text-[11px] text-gray-400">סך ההכנסות</span>
				<span class="text-base font-black text-white">{nis(incomeTotal)}</span>
			</div>
		</div>
	</section>

	<!-- הוצאות: סעיפי ההוצאות שיוצאים מקופת התקציב -->
	<section class="mb-3 rounded-2xl border border-white/10 bg-[#141c2f] p-4 sm:p-5">
		<header class="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
			<div class="flex items-center gap-2.5">
				<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-sm ring-1 ring-rose-500/30" aria-hidden="true">💸</span>
				<div class="flex items-baseline gap-2">
					<h3 class="text-sm font-black text-white sm:text-base">הוצאות</h3>
					<span class="text-xs text-gray-400">כסף יוצא לפי סעיף</span>
				</div>
			</div>
			<span class="rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-0.5 text-xs font-bold text-rose-300">
				6 סעיפים
			</span>
		</header>
		<div class="flex items-stretch" style="height:{EXPENSE_FLOW_H}px">
			<ul class="flex-shrink-0 text-[13px]">
				{#each expenseFlows as f}
					<li
						class="flex items-center gap-2 border-e-4 pe-2"
						style="height:{expenseRowH}px; border-color:{f.color}"
					>
						<span class="font-bold text-white">{f.label}</span>
						<span class="tabular-nums text-gray-300">{nis(f.amount)}</span>
						<span class="hidden tabular-nums text-gray-400 sm:inline">{Math.round(f.pct)}%</span>
					</li>
				{/each}
			</ul>
			<svg viewBox="0 0 100 {EXPENSE_FLOW_H}" preserveAspectRatio="none" class="h-full min-w-0 flex-1" aria-hidden="true">
				{#each expenseFlows as f}
					<path d={expenseBand(f)} fill={f.color} opacity="0.4" />
				{/each}
			</svg>
			<div
				class="flex flex-shrink-0 flex-col items-center justify-center rounded-lg border-s-4 border-rose-400/80 bg-rose-500/15 px-3 text-center"
				style="height:{expenseFlowUsable}px; margin-top:{expenseFlowPad}px"
			>
				<span class="text-[11px] text-gray-400">סך ההוצאות</span>
				<span class="text-base font-black text-white">{nis(total)}</span>
			</div>
		</div>
	</section>

	<!-- חלוקת התקציב: עוגה + סעיפים, ולמורשים — הצבעה על החלוקה -->
	<BudgetAllocation
		{round}
		others={OTHER_VOTES}
		{mine}
		{canVote}
		{save}
		{withdraw}
		note="בהדגמה ההצבעה נשמרת במכשיר זה בלבד"
	/>
</div>
