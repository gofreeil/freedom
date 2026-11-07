<script lang="ts">
	// ============================================================
	// טבלת מתנדבים בסגנון גיליון: כל רכז מוסיף את המתנדבים שלו ועורך את השורות שלו;
	// הסופר-אדמין בלבד עורך את הכותרות (שם, סוג, סדר, הוספה ומחיקה של עמודות)
	// ועורך/מוחק כל שורה.
	// ============================================================
	import { COLUMN_KINDS, COL_WIDTH, canEditRow, newId, waLink, type SheetColumn, type SheetRow } from '$lib/teamBoard';
	import type { TeamStore } from './teamStore.svelte';

	let { store }: { store: TeamStore } = $props();

	const sheet = $derived(store.board.sheet);
	const isSuper = $derived(!!store.me?.isSuper);
	let q = $state('');
	let colMenu = $state(''); // id העמודה שתפריט הכותרת שלה פתוח
	let newColLabel = $state('');

	// עמודה מוסתרת: מנהל הרשת רואה פס צר עם חץ להצגה; לשאר הרכזים היא לא קיימת
	const HIDDEN_W = 22;
	const shown = $derived(sheet.columns.filter((c) => isSuper || !c.hidden));
	let drag = $state<{ id: string; width: number } | null>(null);
	const widthOf = (c: SheetColumn) =>
		c.hidden ? HIDDEN_W : drag?.id === c.id ? drag.width : (c.width ?? COL_WIDTH.def);
	const tableW = $derived(36 + 100 + 36 + shown.reduce((n, c) => n + widthOf(c), 0));

	function startResize(e: PointerEvent, col: SheetColumn) {
		e.preventDefault();
		const handle = e.currentTarget as HTMLElement;
		const rtl = getComputedStyle(handle).direction === 'rtl';
		const x0 = e.clientX;
		const w0 = col.width ?? COL_WIDTH.def;
		const clamp = (w: number) => Math.round(Math.min(COL_WIDTH.max, Math.max(COL_WIDTH.min, w)));
		handle.setPointerCapture(e.pointerId);
		drag = { id: col.id, width: w0 };
		const move = (ev: PointerEvent) => {
			drag = { id: col.id, width: clamp(w0 + (rtl ? x0 - ev.clientX : ev.clientX - x0)) };
		};
		const up = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', up);
			handle.removeEventListener('pointercancel', up);
			const w = drag?.width ?? w0;
			if (w !== w0) store.run({ type: 'sheet.col.update', id: col.id, width: w });
			drag = null;
		};
		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', up);
		handle.addEventListener('pointercancel', up);
	}

	const rows = $derived.by(() => {
		const t = q.trim().toLowerCase();
		const list = [...sheet.rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
		if (!t) return list;
		return list.filter((r) =>
			Object.values(r.cells).some((v) => v.toLowerCase().includes(t)) ||
			store.member(r.createdBy).name.toLowerCase().includes(t)
		);
	});

	// מספר השורות המינימלי שמוצג (ריקות מסומנות במספר עוקב); לא בזמן חיפוש
	const MIN_ROWS = 10;
	const blanks = $derived(q.trim() ? 0 : Math.max(0, MIN_ROWS - rows.length));

	/** לחיצה על תא בשורה ריקה: פותחת שורה אמיתית וממקדת את אותו תא */
	function addRowAt(ci: number) {
		const id = newId();
		if (store.run({ type: 'sheet.row.add', id }))
			setTimeout(() => document.querySelector<HTMLInputElement>(`[data-cell="${id}:${ci}"]`)?.focus(), 0);
	}

	function addRow() {
		const id = newId();
		if (store.run({ type: 'sheet.row.add', id })) {
			q = '';
			queueMicrotask(() => document.querySelector<HTMLInputElement>(`[data-cell="${id}:0"]`)?.focus());
		}
	}

	function commit(row: SheetRow, col: SheetColumn, e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		const value = el.value.trim();
		if (value === (row.cells[col.id] ?? '')) {
			el.value = value;
			return;
		}
		if (!store.run({ type: 'sheet.cell.set', rowId: row.id, colId: col.id, value })) el.value = row.cells[col.id] ?? '';
	}

	function onKey(e: KeyboardEvent, ri: number, ci: number) {
		const el = e.currentTarget as HTMLInputElement;
		if (e.key === 'Escape') {
			el.value = el.defaultValue;
			el.blur();
			return;
		}
		if (e.key !== 'Enter') return;
		e.preventDefault();
		const next = document.querySelector<HTMLInputElement>(`[data-cell="${rows[ri + 1]?.id}:${ci}"]`);
		el.blur();
		next?.focus();
	}

	function href(col: SheetColumn, v: string): string {
		if (!v) return '';
		if (col.kind === 'phone') return waLink(v, '');
		if (col.kind === 'email') return `mailto:${v}`;
		if (col.kind === 'link') {
			if (/^https?:\/\//i.test(v)) return v;
			if (/^[\w.-]+\.[a-z]{2,}/i.test(v)) return `https://${v}`;
			if (/^@?[\w.]{4,}$/.test(v)) return `https://t.me/${v.replace(/^@/, '')}`;
		}
		return '';
	}

	function removeRow(row: SheetRow) {
		const who = row.cells[sheet.columns[0]?.id] || 'השורה';
		if (confirm(`למחוק את "${who}"?`)) store.run({ type: 'sheet.row.remove', id: row.id });
	}

	function addCol() {
		const label = newColLabel.trim();
		if (!label) return;
		if (store.run({ type: 'sheet.col.add', id: newId(), label })) newColLabel = '';
	}

	function removeCol(col: SheetColumn) {
		if (confirm(`למחוק את העמודה "${col.label}" ואת כל הנתונים שבה?`)) {
			colMenu = '';
			store.run({ type: 'sheet.col.remove', id: col.id });
		}
	}

	function csvCell(v: string) {
		return `"${v.replace(/"/g, '""')}"`;
	}

	function exportCsv() {
		const head = [...sheet.columns.map((c) => c.label), 'נוסף על ידי'];
		const lines = [head, ...sheet.rows.map((r) => [...sheet.columns.map((c) => r.cells[c.id] ?? ''), store.member(r.createdBy).name])];
		const blob = new Blob(['﻿' + lines.map((l) => l.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'volunteers.csv';
		a.click();
		URL.revokeObjectURL(a.href);
	}

	const inputCls =
		'w-full min-w-0 text-ellipsis bg-transparent px-2.5 py-1.5 text-[14px] text-gray-100 outline-none placeholder:text-gray-600 focus:bg-sky-500/10 focus:ring-1 focus:ring-inset focus:ring-sky-400/60 disabled:cursor-default disabled:text-gray-300';
</script>

<div class="mb-2 flex flex-wrap items-center gap-2">
	<input
		type="search"
		bind:value={q}
		placeholder="חיפוש בטבלה…"
		class="w-44 rounded-lg border border-white/10 bg-[#141c2f] px-3 py-1.5 text-[14px] text-gray-100 outline-none placeholder:text-gray-500 focus:border-sky-400/50"
	/>
	<span class="text-[13px] text-gray-500">{sheet.rows.length} מתנדבים</span>
	<div class="ms-auto flex gap-2">
		<button type="button" onclick={exportCsv} class="rounded-lg border border-white/10 px-3 py-1.5 text-[13px] font-bold text-gray-300 hover:bg-white/5">⬇ הורד</button>
		<button type="button" onclick={addRow} class="rounded-lg bg-sky-500 px-3 py-1.5 text-[13px] font-black text-white hover:bg-sky-400">+ שורה</button>
	</div>
</div>

<div class="overflow-hidden rounded-xl border border-white/10 bg-[#141c2f]">
<div class="overflow-x-auto">
	<table class="table-fixed border-collapse text-start" style="width:max(100%, {tableW}px)">
		<colgroup>
			<col style="width:36px" />
			{#each shown as col (col.id)}<col style="width:{widthOf(col)}px" />{/each}
			<col style="width:100px" />
			<col style="width:36px" />
		</colgroup>
		<thead>
			<tr class="bg-[#1b2335]">
				<th class="border-b border-s border-white/10 px-1 py-2 text-center text-[12px] font-bold text-gray-500">#</th>
				{#each shown as col (col.id)}
					{@const ci = sheet.columns.indexOf(col)}
					{#if col.hidden}
						<th class="border-b border-s border-white/10 bg-white/[0.04] p-0 text-center align-middle">
							<button
								type="button"
								onclick={() => store.run({ type: 'sheet.col.update', id: col.id, hidden: false })}
								class="w-full py-2 text-[11px] leading-none font-black text-amber-300 hover:bg-white/10"
								title="הצג את העמודה &quot;{col.label}&quot;"
								aria-label="הצג את העמודה {col.label}">◂▸</button>
						</th>
					{:else}
					<th class="relative border-b border-s border-white/10 p-0 text-start align-top">
						{#if isSuper}
							<div
								role="separator"
								aria-orientation="vertical"
								title="גררו לשינוי רוחב"
								onpointerdown={(e) => startResize(e, col)}
								class="absolute end-0 top-0 z-10 h-full w-2 cursor-col-resize touch-none hover:bg-sky-400/40 {drag?.id === col.id ? 'bg-sky-400/60' : ''}"
							></div>
						{/if}
						<div class="flex items-center gap-1 px-2.5 py-2 text-[13px] font-black text-amber-200">
							<span class="truncate">{col.label}</span>
							{#if isSuper}
								<button
									type="button"
									onclick={() => (colMenu = colMenu === col.id ? '' : col.id)}
									class="ms-auto rounded px-1 text-gray-400 hover:bg-white/10 hover:text-white"
									aria-label="עריכת עמודה {col.label}"
									title="עריכת העמודה">✎</button>
							{/if}
						</div>
						{#if isSuper && colMenu === col.id}
							<div class="absolute start-0 top-full z-20 w-56 space-y-2 rounded-xl border border-white/15 bg-[#0f1626] p-3 text-[13px] font-normal shadow-2xl">
								<input
									value={col.label}
									maxlength="60"
									onchange={(e) => store.run({ type: 'sheet.col.update', id: col.id, label: e.currentTarget.value })}
									class="w-full rounded-lg border border-white/15 bg-[#141c2f] px-2 py-1.5 text-gray-100 outline-none focus:border-sky-400/60"
								/>
								<select
									value={col.kind}
									onchange={(e) => store.run({ type: 'sheet.col.update', id: col.id, kind: e.currentTarget.value as SheetColumn['kind'] })}
									class="w-full rounded-lg border border-white/15 bg-[#141c2f] px-2 py-1.5 text-gray-100"
								>
									{#each COLUMN_KINDS as k (k.id)}<option value={k.id}>{k.label}</option>{/each}
								</select>
								<div class="flex gap-1">
									<button type="button" disabled={ci === 0} onclick={() => store.run({ type: 'sheet.col.move', id: col.id, dir: -1 })} class="flex-1 rounded-lg border border-white/15 py-1 text-gray-200 hover:bg-white/5 disabled:opacity-30" title="הזז ימינה">→</button>
									<button type="button" disabled={ci === sheet.columns.length - 1} onclick={() => store.run({ type: 'sheet.col.move', id: col.id, dir: 1 })} class="flex-1 rounded-lg border border-white/15 py-1 text-gray-200 hover:bg-white/5 disabled:opacity-30" title="הזז שמאלה">←</button>
									<button type="button" onclick={() => removeCol(col)} class="flex-1 rounded-lg border border-red-400/30 py-1 text-red-300 hover:bg-red-500/10" title="מחק עמודה">🗑</button>
								</div>
								<button
									type="button"
									onclick={() => {
										colMenu = '';
										store.run({ type: 'sheet.col.update', id: col.id, hidden: true });
									}}
									class="w-full rounded-lg border border-white/15 py-1 text-gray-200 hover:bg-white/5"
									title="העמודה תוסתר מכל הרכזים">הסתר עמודה</button>
								<button type="button" onclick={() => (colMenu = '')} class="w-full rounded-lg bg-white/10 py-1 font-bold text-white hover:bg-white/15">סגור</button>
							</div>
						{/if}
					</th>
					{/if}
				{/each}
				<th class="border-b border-s border-white/10 px-2.5 py-2 text-start text-[13px] font-black text-gray-400">נוסף ע״י</th>
				<th class="w-9 border-b border-s border-white/10"></th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, ri (row.id)}
				{@const editable = !!store.me && canEditRow(row, store.me)}
				<tr class="group border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
					<td class="border-s border-white/5 px-1 text-center text-[12px] text-gray-600">{ri + 1}</td>
					{#each shown as col (col.id)}
						{@const ci = sheet.columns.indexOf(col)}
						{@const v = row.cells[col.id] ?? ''}
						{@const url = href(col, v)}
						{#if col.hidden}
							<td class="border-s border-white/5 bg-white/[0.04]"></td>
						{:else}
						<td class="border-s border-white/5 p-0">
							<div class="flex items-center">
								<input
									data-cell="{row.id}:{ci}"
									value={v}
									disabled={!editable}
									maxlength="500"
									dir={col.kind === 'text' ? 'auto' : 'ltr'}
									class="{inputCls} {col.kind !== 'text' ? 'text-start' : ''}"
									onchange={(e) => commit(row, col, e)}
									onkeydown={(e) => onKey(e, ri, ci)}
								/>
								{#if url}
									<a href={url} target="_blank" rel="noopener noreferrer" class="px-1.5 text-[13px] text-sky-300 hover:text-sky-200" title={col.kind === 'phone' ? 'פתח בוואטסאפ' : 'פתח'}>{col.kind === 'phone' ? '💬' : '↗'}</a>
								{/if}
							</div>
						</td>
						{/if}
					{/each}
					<td class="border-s border-white/5 px-2.5 text-[12px] whitespace-nowrap text-gray-500">{store.member(row.createdBy).name.split(' ')[0]}</td>
					<td class="border-s border-white/5 text-center">
						{#if editable}
							<button type="button" onclick={() => removeRow(row)} class="px-1.5 text-gray-600 hover:text-red-300" aria-label="מחיקת שורה" title="מחק שורה">✕</button>
						{/if}
					</td>
				</tr>
			{:else}
				{#if q}
					<tr>
						<td colspan={shown.length + 3} class="px-4 py-8 text-center text-[14px] text-gray-500">לא נמצאו תוצאות</td>
					</tr>
				{/if}
			{/each}
			<!-- שורות ריקות ממוספרות (כמו בגיליון): לחיצה על תא פותחת שורה חדשה -->
			{#each Array.from({ length: blanks }) as _, bi (bi)}
				<tr class="border-b border-white/5 last:border-0">
					<td class="border-s border-white/5 px-1 text-center text-[12px] text-gray-700">{rows.length + bi + 1}</td>
					{#each shown as col (col.id)}
						{@const ci = sheet.columns.indexOf(col)}
						<td class="border-s border-white/5 p-0 {col.hidden ? 'bg-white/[0.04]' : ''}">
							{#if !col.hidden}
								<input class={inputCls} aria-label="שורה חדשה" onfocus={() => addRowAt(ci)} />
							{/if}
						</td>
					{/each}
					<td class="border-s border-white/5"></td>
					<td class="border-s border-white/5"></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if isSuper}
	<form
		class="flex items-center justify-end gap-2 border-t border-white/10 bg-[#1b2335]/60 px-2 py-1.5"
		onsubmit={(e) => {
			e.preventDefault();
			addCol();
		}}
	>
		<input
			bind:value={newColLabel}
			maxlength="60"
			placeholder="עמודה חדשה (למשל: טיקטוק)"
			class="w-56 rounded-lg border border-white/10 bg-[#141c2f] px-3 py-1.5 text-[13px] text-gray-100 outline-none placeholder:text-gray-500 focus:border-sky-400/50"
		/>
		<button type="submit" class="rounded-lg border border-white/15 px-3 py-1.5 text-[13px] font-bold text-gray-200 hover:bg-white/5">+ עמודה</button>
		<span class="me-auto hidden text-[12px] text-gray-500 sm:inline">רק מנהל הרשת עורך כותרות</span>
	</form>
{/if}
</div>
