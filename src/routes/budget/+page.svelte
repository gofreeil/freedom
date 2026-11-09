<script lang="ts">
	// /budget — "ניהול תקציב": צפייה לכל משתמש מחובר; הצבעה לאדמינים ולרכזי שכונות (data.canVote).
	// מוקאפ: נתוני העוגה קבועים כאן, וההצבעה נשמרת בדפדפן בלבד — עד שיחובר מקור נתונים.
	import { onMount } from 'svelte';

	let { data } = $props();

	const BUDGET = [
		{ label: 'שרתים ותשתיות', amount: 30_000, color: '#6366f1' },
		{ label: 'פיתוח האתרים', amount: 25_000, color: '#a855f7' },
		{ label: 'שיווק ופרסום', amount: 20_000, color: '#f5d57a' },
		{ label: 'אירועים וקהילה', amount: 15_000, color: '#34d399' },
		{ label: 'רזרבה', amount: 10_000, color: '#64748b' }
	];
	const total = BUDGET.reduce((s, b) => s + b.amount, 0);

	// פרוסות הדונאט: היקף המעגל מנורמל ל-100, כך שאורך הקשת = האחוז
	const slices = (() => {
		let offset = 0;
		return BUDGET.map((b) => {
			const pct = (b.amount / total) * 100;
			const slice = { ...b, pct, offset };
			offset += pct;
			return slice;
		});
	})();

	// כסף נכנס — שלושה מקורות (מוקאף). הסכום זהה לסך התקציב שבעוגה.
	const INCOME = [
		{ label: 'דמי חבר במועדון', amount: 55_000, color: '#34d399' },
		{ label: 'תרומות', amount: 30_000, color: '#38bdf8' },
		{ label: 'עמלות קבוצות רכישה', amount: 15_000, color: '#f5d57a' }
	];
	const incomeTotal = INCOME.reduce((s, b) => s + b.amount, 0);

	// דיאגרמת זרימה: כל מקור הוא רצועה שגובהה יחסי לסכום, והרצועות מתנקזות לעמודה אחת.
	// הגבהים בפיקסלים — כך התוויות (HTML) מתיישרות בדיוק מול הרצועות (SVG).
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
	/** רצועה מהמקור (ימין, x=100) אל עמודת הסך (שמאל, x=0) */
	const band = (f: { sy: number; ty: number; h: number }) =>
		`M100,${f.sy} C50,${f.sy} 50,${f.ty} 0,${f.ty} L0,${f.ty + f.h} C50,${f.ty + f.h} 50,${f.sy + f.h} 100,${f.sy + f.h} Z`;

	const nis = (n: number) => `₪${n.toLocaleString('he-IL')}`;

	const VOTE_KEY = 'budget_vote_mock';
	const VOTES = [
		{ id: 'for', label: '👍 בעד', on: 'border-emerald-400 bg-emerald-500/20 text-emerald-200' },
		{ id: 'against', label: '👎 נגד', on: 'border-red-400 bg-red-500/20 text-red-200' },
		{ id: 'abstain', label: '🤷 נמנע', on: 'border-slate-300 bg-slate-500/25 text-slate-100' }
	];
	let vote = $state('');
	let hovered = $state(-1);

	onMount(() => {
		try {
			vote = localStorage.getItem(VOTE_KEY) ?? '';
		} catch {}
	});

	function cast(id: string) {
		vote = vote === id ? '' : id;
		try {
			if (vote) localStorage.setItem(VOTE_KEY, vote);
			else localStorage.removeItem(VOTE_KEY);
		} catch {}
	}
</script>

<svelte:head>
	<title>ניהול תקציב | יוצאים לחירות</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-6" dir="rtl">
	<div class="mb-4 flex flex-wrap items-center gap-3">
		<h1 class="flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">💰</span> ניהול תקציב
		</h1>
		<span class="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-200">
			הדגמה — הנתונים אינם אמיתיים
		</span>
	</div>

	<!-- כסף נכנס: שלושה מקורות שמתנקזים לקופת התקציב -->
	<section class="mb-3 rounded-2xl border border-white/10 bg-[#141c2f] p-4 sm:p-5">
		<h2 class="mb-2 text-sm font-black text-white">כסף נכנס — לפי מקור</h2>
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

	<div class="grid items-center gap-5 rounded-2xl border border-white/10 bg-[#141c2f] p-4 sm:grid-cols-[220px_1fr] sm:p-5">
		<!-- עוגת התקציב -->
		<div class="relative mx-auto w-48 sm:w-full">
			<svg viewBox="0 0 42 42" class="-rotate-90" role="img" aria-label="עוגת התקציב לפי סעיפים">
				{#each slices as s, i}
					<circle
						cx="21"
						cy="21"
						r="15.9155"
						fill="none"
						stroke={s.color}
						stroke-width={hovered === i ? 7 : 6}
						stroke-dasharray="{Math.max(s.pct - 0.6, 0)} {100 - Math.max(s.pct - 0.6, 0)}"
						stroke-dashoffset={-s.offset}
						opacity={hovered === -1 || hovered === i ? 1 : 0.45}
						class="transition-all duration-150"
						role="presentation"
						onmouseenter={() => (hovered = i)}
						onmouseleave={() => (hovered = -1)}
					/>
				{/each}
			</svg>
			<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
				{#if hovered >= 0}
					<span class="text-[11px] text-gray-400">{slices[hovered].label}</span>
					<span class="text-lg font-black text-white">{Math.round(slices[hovered].pct)}%</span>
				{:else}
					<span class="text-[11px] text-gray-400">סך התקציב</span>
					<span class="text-lg font-black text-white">{nis(total)}</span>
				{/if}
			</div>
		</div>

		<div>
			<!-- מקרא -->
			<ul class="divide-y divide-white/5 text-sm">
				{#each slices as s, i}
					<li
						class="flex items-center gap-2.5 rounded px-1 py-1.5 {hovered === i ? 'bg-white/5' : ''}"
						onmouseenter={() => (hovered = i)}
						onmouseleave={() => (hovered = -1)}
					>
						<span class="h-3 w-3 flex-shrink-0 rounded-sm" style="background:{s.color}" aria-hidden="true"></span>
						<span class="flex-1 font-bold text-white">{s.label}</span>
						<span class="tabular-nums text-gray-300">{nis(s.amount)}</span>
						<span class="w-10 text-end tabular-nums text-gray-400">{Math.round(s.pct)}%</span>
					</li>
				{/each}
			</ul>

			<!-- הצבעה -->
			{#if !data.canVote}
				<p class="mt-3 border-t border-white/10 pt-3 text-xs text-gray-400">
					ההצבעה על התקציב פתוחה לאדמינים ולרכזי שכונות בלבד.
				</p>
			{:else}
			<div class="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
				<span class="text-sm font-bold text-white">ההצבעה שלך:</span>
				{#each VOTES as v}
					<button
						type="button"
						onclick={() => cast(v.id)}
						aria-pressed={vote === v.id}
						class="rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-colors {vote === v.id
							? v.on
							: 'border-white/15 text-gray-200 hover:bg-white/5'}"
					>
						{v.label}
					</button>
				{/each}
				<span class="basis-full text-xs text-gray-400">
					{vote ? '✓ ההצבעה נרשמה. ' : ''}בשלב ההדגמה ההצבעה נשמרת במכשיר זה בלבד.
				</span>
			</div>
			{/if}
		</div>
	</div>
</div>
