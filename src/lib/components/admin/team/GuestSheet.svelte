<script lang="ts">
	// ============================================================
	// Freedom TV למי שאינו אדמין: תוכן השורות של אחרים מוצג ככוכביות (הוא בכלל לא
	// מגיע לדפדפן), והדבר היחיד שאפשר לעשות הוא להוסיף שורה: ממלאים טיוטה, עורכים
	// כמה שרוצים, ולוחצים "שמור" — מאותו רגע השורה קבועה, והיא היחידה שגלויה.
	// ============================================================
	import { onMount } from 'svelte';
	import { newId } from '$lib/teamBoard';

	interface Col {
		id: string;
		label: string;
		kind: string;
		width: number;
	}
	interface Row {
		id: string;
		cells: Record<string, string>;
		mine?: boolean;
	}

	let columns = $state<Col[]>([]);
	let mine = $state<Row[]>([]);
	let others = $state(0);
	let loaded = $state(false);
	let error = $state('');
	let draft = $state<{ id: string; cells: Record<string, string> } | null>(null);
	let saving = $state(false);
	let ok = $state('');
	let selectedId = $state('');

	const MASK = '********';
	const MAX_MASKED = 30;

	async function load() {
		try {
			const res = await fetch('/api/tv-guest', { cache: 'no-store' });
			const json = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(json.error || 'שגיאה בטעינה');
			columns = json.columns ?? [];
			mine = json.mine ?? [];
			others = Math.max(0, Number(json.others) || 0);
			error = '';
			loaded = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'שגיאה בטעינה';
		}
	}

	onMount(load);

	function startDraft() {
		ok = '';
		draft = { id: newId(), cells: {} };
		queueMicrotask(() => document.querySelector<HTMLInputElement>('[data-draft="0"]')?.focus());
	}

	async function save() {
		if (!draft || saving) return;
		if (!Object.values(draft.cells).some((v) => v?.trim())) {
			error = 'צריך למלא לפחות שדה אחד';
			return;
		}
		saving = true;
		error = '';
		try {
			const res = await fetch('/api/tv-guest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(draft)
			});
			const json = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(json.error || 'השמירה נכשלה — נסו שוב');
			draft = null;
			ok = 'השורה נשמרה ✓';
			await load();
		} catch (e) {
			error = e instanceof Error ? e.message : 'השמירה נכשלה — נסו שוב';
		}
		saving = false;
	}

	const inputCls =
		'w-full min-w-0 text-ellipsis bg-transparent px-2.5 py-1.5 text-[14px] text-gray-100 outline-none placeholder:text-gray-600 focus:bg-sky-500/10 focus:ring-1 focus:ring-inset focus:ring-sky-400/60';
</script>

{#if error && !loaded}
	<div class="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
		<p>{error}</p>
		<button type="button" onclick={load} class="mt-2 rounded-lg border border-red-400/30 px-3 py-1 font-bold hover:bg-red-500/10">נסו שוב</button>
	</div>
{:else if !loaded}
	<div class="h-40 animate-pulse rounded-xl bg-[#141c2f]" aria-hidden="true"></div>
{:else}
	<div class="mb-3 flex flex-wrap items-center gap-3">
		<button
			type="button"
			onclick={startDraft}
			disabled={!!draft}
			class="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-base font-black text-white shadow-lg shadow-sky-500/25 transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
		>
			＋ הוסף שורת נתונים
		</button>
		{#if ok}<span class="text-sm font-bold text-emerald-300">{ok}</span>{/if}
		{#if error}<span class="text-sm font-bold text-red-300">{error}</span>{/if}
	</div>

	<div class="overflow-x-auto rounded-xl border border-white/10 bg-[#141c2f]">
		<table class="w-full min-w-max border-collapse text-start">
			<thead>
				<tr class="bg-[#1b2335]">
					<th class="w-9 border-b border-s border-white/10 px-1 py-2 text-center text-[12px] font-bold text-gray-500">#</th>
					{#each columns as col (col.id)}
						<th class="border-b border-s border-white/10 px-2.5 py-2 text-start text-[13px] font-black text-amber-200">{col.label}</th>
					{/each}
					<th class="w-24 border-b border-s border-white/10"></th>
				</tr>
			</thead>
			<tbody>
				{#if draft}
					<tr class="border-b border-sky-400/30 bg-sky-500/10">
						<td class="border-s border-white/10 px-1 text-center text-[12px] text-sky-300">+</td>
						{#each columns as col, ci (col.id)}
							<td class="border-s border-white/10 p-0">
								<input
									data-draft={ci}
									bind:value={draft.cells[col.id]}
									maxlength="500"
									placeholder={col.label}
									dir={col.kind === 'text' ? 'auto' : 'ltr'}
									class="{inputCls} {col.kind !== 'text' ? 'text-start' : ''}"
									onkeydown={(e) => e.key === 'Enter' && save()}
								/>
							</td>
						{/each}
						<td class="border-s border-white/10 p-1">
							<div class="flex flex-col gap-1">
								<button type="button" onclick={save} disabled={saving} class="rounded-lg bg-emerald-500 px-2 py-1 text-[13px] font-black text-white hover:bg-emerald-400 disabled:opacity-50">{saving ? 'שומר…' : 'שמור'}</button>
								<button type="button" onclick={() => (draft = null)} disabled={saving} class="rounded-lg border border-white/15 px-2 py-0.5 text-[12px] text-gray-300 hover:bg-white/5">בטל</button>
							</div>
						</td>
					</tr>
				{/if}
				{#each mine as row, ri (row.id)}
					<tr
						class="border-b border-white/5 {selectedId === row.id ? 'bg-sky-500/10 outline outline-2 -outline-offset-2 outline-sky-400' : row.mine ? 'bg-emerald-500/5' : ''}"
						onclick={() => (selectedId = row.id)}
					>
						<td class="border-s border-white/5 px-1 text-center text-[12px] text-gray-500">{ri + 1}</td>
						{#each columns as col, ci (col.id)}
							<!-- רק השם מוצג במלואו; שאר העמודות מקוצרות לשורה אחת (התוכן נשמר במלואו) -->
							<td class="border-s border-white/5 px-2.5 py-1.5 text-[14px] text-gray-100 {ci === 0 ? '' : 'max-w-[11rem] truncate'}" dir={col.kind === 'text' ? 'auto' : 'ltr'} title={ci === 0 ? undefined : row.cells[col.id]}>{row.cells[col.id] ?? ''}</td>
						{/each}
						<td class="border-s border-white/5 px-2 text-center text-[12px] font-bold text-emerald-300">{row.mine ? '✓ שלך' : ''}</td>
					</tr>
				{/each}
				{#each Array.from({ length: Math.min(others, MAX_MASKED) }) as _, i (i)}
					<tr class="border-b border-white/5 select-none last:border-0" aria-hidden="true">
						<td class="border-s border-white/5 px-1 text-center text-[12px] text-gray-600">{mine.length + i + 1}</td>
						{#each columns as col (col.id)}
							<td class="border-s border-white/5 px-2.5 py-1.5 text-[14px] tracking-widest text-gray-600">{MASK}</td>
						{/each}
						<td class="border-s border-white/5"></td>
					</tr>
				{/each}
				{#if !draft && !mine.length && !others}
					<tr><td colspan={columns.length + 2} class="px-4 py-6 text-center text-[14px] text-gray-500">עוד אין שורות — לחצו על "הוסף שורת נתונים"</td></tr>
				{/if}
			</tbody>
		</table>
		{#if others > MAX_MASKED}
			<p class="border-t border-white/10 px-3 py-1.5 text-[12px] text-gray-500">ועוד {others - MAX_MASKED} שורות</p>
		{/if}
	</div>
	<p class="mt-2 text-[12px] text-gray-500">אפשר לערוך את השורה לפני השמירה. אחרי "שמור" היא נשמרת לצמיתות.</p>
{/if}
