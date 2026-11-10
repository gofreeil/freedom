<script lang="ts">
	// כרטיס חלוקת התקציב: עוגה + סעיפים.
	// מי שמורשה להצביע (canVote) מחלק 100% בין הסעיפים — מחוון, כפתורי פלוס/מינוס או הקלדה — ושולח.
	// תוצאות הביניים (ממוצע + פיזור ההצבעות) נחשפות רק אחרי שהצביע, כדי שלא יושפע מהן;
	// עד סגירת ההצבעה אפשר לעדכן או לבטל. שאר המשתמשים רואים את התקציב הנוכחי בלבד.
	// הרכיב לא יודע איפה ההצבעות נשמרות: הדף מעביר save / withdraw ומעדכן את mine.
	import {
		allocationSum,
		averageAllocation,
		currentAllocation,
		nis,
		rebalance,
		sameAllocation,
		type Allocation,
		type Ballot,
		type BudgetRound
	} from '$lib/budgetVote';

	let {
		round,
		others = [],
		mine = null,
		canVote = false,
		save,
		withdraw,
		note = ''
	}: {
		round: BudgetRound;
		/** ההצבעות של שאר המצביעים (אנונימי) */
		others?: Allocation[];
		/** ההצבעה השמורה של המשתמש, אם הצביע */
		mine?: Ballot | null;
		canVote?: boolean;
		/** שומר את ההצבעה; עד שהוא מסתיים mine כבר מעודכן */
		save: (alloc: Allocation) => Promise<void>;
		withdraw: () => Promise<void>;
		/** הערה קצרה בתחתית הכרטיס */
		note?: string;
	} = $props();

	type View = 'current' | 'mine' | 'avg';

	// השינויים שעוד לא נשלחו; null = אין, והמחוונים עומדים על ההצבעה השמורה / התקציב הנוכחי
	let edits = $state<Allocation | null>(null);
	// הסעיפים שהמצביע הזיז, לפי הסדר — "חלק את היתרה" לא נוגע בהם
	let touched = $state<string[]>([]);
	let picked = $state<View | null>(null);
	let hovered = $state(-1);
	let busy = $state(false);
	let error = $state('');
	const now = Date.now();

	const cats = $derived(round.categories);
	const ids = $derived(cats.map((c) => c.id));
	const current = $derived(currentAllocation(round));
	const baseline = $derived(mine?.alloc ?? current);
	const draft = $derived(edits ?? baseline);
	const left = $derived(100 - allocationSum(draft, ids));
	const dirty = $derived(!sameAllocation(draft, baseline, ids));
	const closed = $derived(Date.parse(round.closesAt) <= now);
	const editable = $derived(canVote && !closed);

	const ballots = $derived(mine ? [...others, mine.alloc] : others);
	const average = $derived(canVote && (mine || closed) ? averageAllocation(ballots, ids) : null);
	const voters = $derived(ballots.length);
	const eligible = $derived(Math.max(round.eligible, voters));

	// מה מוצג בעוגה: אחרי הצבעה — הממוצע; נגיעה במחוון מעבירה להצעה שלי
	const view = $derived<View>(
		picked && (picked !== 'avg' || average) ? picked : average ? 'avg' : 'current'
	);
	const views = $derived([
		{ id: 'current' as View, label: 'כיום', locked: false },
		...(closed && !mine ? [] : [{ id: 'mine' as View, label: 'שלי', locked: false }]),
		{ id: 'avg' as View, label: closed ? 'תוצאה' : average ? 'ממוצע' : '🔒 ממוצע', locked: !average }
	]);
	const shown = $derived(view === 'mine' ? draft : view === 'avg' && average ? average : current);

	// פרוסות הדונאט: היקף המעגל מנורמל ל-100, כך שאורך הקשת = האחוז.
	// חלוקה חסרה משאירה רווח ריק; חלוקה עודפת מכווצת את כולן יחסית.
	const slices = $derived.by(() => {
		const scale = 100 / Math.max(allocationSum(shown, ids), 100);
		let offset = 0;
		return cats.map((c) => {
			const value = shown[c.id] ?? 0;
			const slice = { ...c, value, pct: value * scale, offset };
			offset += slice.pct;
			return slice;
		});
	});

	const amount = (pct: number) => Math.round((round.total * pct) / 100);

	// הטקסט שבמרכז העוגה: הפרוסה שמרחפים מעליה, ואחרת סיכום התצוגה הנוכחית
	const center = $derived.by(() => {
		if (hovered >= 0) {
			const s = slices[hovered];
			return { small: s.label, big: `${s.value}%`, sub: nis(amount(s.value)), tone: '' };
		}
		if (view === 'avg')
			return { small: closed ? 'התוצאה הסופית' : 'ממוצע ההצבעות', big: `${voters} מצביעים`, sub: '', tone: '' };
		if (view === 'mine' && left > 0)
			return { small: 'חולקו עד כה', big: `${100 - left}%`, sub: '', tone: 'text-amber-300' };
		if (view === 'mine' && left < 0) return { small: 'חריגה', big: `${100 - left}%`, sub: '', tone: 'text-rose-300' };
		return {
			small: view === 'mine' ? (mine && !dirty ? 'ההצבעה שלי' : 'ההצעה שלי') : 'סך התקציב',
			big: nis(round.total),
			sub: '',
			tone: ''
		};
	});

	// בשורות: בזמן ההצבעה — ההצעה שלי; אחרי הסגירה — התוצאה
	const rows = $derived(closed && average ? average : draft);

	const dateOpts = { day: 'numeric', month: 'numeric', timeZone: 'Asia/Jerusalem' } as const;
	const closeDate = $derived(new Date(round.closesAt).toLocaleDateString('he-IL', dateOpts));
	// ימים שנותרו — לפי תאריכי לוח בשעון ישראל, לא לפי 24 שעות מעכשיו
	const dayStart = (ms: number) =>
		Date.parse(new Date(ms).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }) + 'T00:00:00Z');
	const timeLeft = $derived.by(() => {
		const days = Math.round((dayStart(Date.parse(round.closesAt)) - dayStart(now)) / 86_400_000);
		return days <= 0 ? 'נסגרת היום' : days === 1 ? 'נסגרת מחר' : `עוד ${days} ימים`;
	});
	const votedAt = $derived(
		mine?.at
			? new Date(mine.at).toLocaleString('he-IL', { ...dateOpts, hour: '2-digit', minute: '2-digit' })
			: ''
	);

	const TONE = {
		ok: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
		warn: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
		bad: 'border-rose-400/40 bg-rose-500/15 text-rose-200',
		off: 'border-white/15 bg-white/5 text-gray-300'
	};
	const status = $derived.by(() => {
		if (closed)
			return { tone: TONE.off, text: mine ? 'ההצבעה נסגרה — הצבעתך נספרה' : 'ההצבעה נסגרה — לא הצבעת בסבב הזה' };
		if (left > 0) return { tone: TONE.warn, text: `נותרו לחלוקה ${left}% · ${nis(amount(left))}` };
		if (left < 0) return { tone: TONE.bad, text: `חריגה של ${-left}% · ${nis(amount(-left))}` };
		if (mine && !dirty)
			return { tone: TONE.ok, text: `✓ הצבעת${votedAt ? ` ב-${votedAt}` : ''} · אפשר לעדכן עד הסגירה` };
		return { tone: TONE.ok, text: mine ? '✓ חולקו 100% — השינוי עוד לא נשמר' : '✓ חולקו 100% — אפשר לשלוח' };
	});

	function setValue(id: string, value: number) {
		if (!editable || !Number.isFinite(value)) return;
		edits = { ...draft, [id]: Math.max(0, Math.min(100, Math.round(value))) };
		touched = [...touched.filter((t) => t !== id), id];
		picked = 'mine';
		error = '';
	}

	function balance() {
		edits = rebalance(draft, ids, touched);
		picked = 'mine';
	}

	function reset() {
		edits = null;
		touched = [];
		error = '';
	}

	const failure = (e: unknown) => (e instanceof Error && e.message ? e.message : 'הפעולה נכשלה — נסו שוב');

	async function submit() {
		if (!editable || left !== 0 || busy) return;
		busy = true;
		error = '';
		try {
			await save({ ...draft });
			edits = null;
			touched = [];
			picked = 'avg';
		} catch (e) {
			error = failure(e);
		} finally {
			busy = false;
		}
	}

	async function cancelVote() {
		if (!editable || !mine || busy) return;
		// המחוונים נשארים במקומם, כך שאפשר לשלוח שוב בלחיצה
		const keep = { ...draft };
		busy = true;
		error = '';
		try {
			await withdraw();
			edits = keep;
			touched = [];
			picked = 'mine';
		} catch (e) {
			error = failure(e);
		} finally {
			busy = false;
		}
	}
</script>

<section class="rounded-2xl border border-white/10 bg-[#141c2f] p-4 sm:p-5">
	{#if canVote}
		<header class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-white/10 pb-3">
			<h2 class="text-sm font-black text-white">
				<span aria-hidden="true">🗳️</span> איך לחלק את התקציב?
			</h2>
			<div class="ms-auto flex flex-wrap items-center gap-1.5 text-xs">
				<!-- בנייד הניסוח מקוצר, כדי ששתי התגיות ייכנסו בשורה אחת -->
				<span class="rounded-full border px-2.5 py-0.5 font-bold {closed ? TONE.off : TONE.ok}">
					{#if closed}
						ההצבעה נסגרה ב-{closeDate}
					{:else}
						<span class="hidden sm:inline">פתוחה</span> עד {closeDate} · {timeLeft}
					{/if}
				</span>
				<span class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-gray-200">
					<span class="relative h-1.5 w-9 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
						<span
							class="absolute inset-y-0 start-0 rounded-full bg-emerald-400"
							style="width:{(voters / eligible) * 100}%"
						></span>
					</span>
					<span>
						<span class="sm:hidden">{voters}/{eligible}</span><span class="hidden sm:inline">{voters} מתוך {eligible}</span>
						הצביעו
					</span>
				</span>
			</div>
		</header>
	{/if}

	<div class="grid items-center gap-x-5 gap-y-3 {canVote ? 'sm:grid-cols-[184px_1fr]' : 'sm:grid-cols-[220px_1fr]'}">
		<!-- עוגת התקציב -->
		<div class="flex items-center justify-center gap-4 sm:flex-col sm:gap-2">
			<div class="relative {canVote ? 'w-36' : 'w-48'} sm:w-full">
				<svg viewBox="0 0 42 42" class="-rotate-90" role="img" aria-label="עוגת התקציב לפי סעיפים">
					<circle cx="21" cy="21" r="15.9155" fill="none" stroke="rgb(255 255 255 / 0.07)" stroke-width="6" />
					{#each slices as s, i (s.id)}
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
					<span class="text-[11px] text-gray-400">{center.small}</span>
					<span class="text-lg font-black leading-6 {center.tone || 'text-white'}">{center.big}</span>
					{#if center.sub}
						<span class="text-[11px] tabular-nums text-gray-300">{center.sub}</span>
					{/if}
				</div>
			</div>
			{#if canVote}
				<div class="flex flex-col gap-1 text-[11px] sm:flex-row" role="group" aria-label="מה מוצג בעוגה">
					{#each views as o (o.id)}
						<button
							type="button"
							onclick={() => (picked = o.id)}
							aria-pressed={view === o.id}
							disabled={o.locked}
							title={o.locked ? 'נחשף אחרי ההצבעה' : undefined}
							class="rounded-full border px-2.5 py-0.5 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 {view ===
							o.id
								? 'border-indigo-400 bg-indigo-500/25 text-white'
								: 'border-white/15 text-gray-300 enabled:hover:bg-white/5'}"
						>
							{o.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		{#if canVote}
			<!-- סעיפים: מחוון + אחוז + סכום -->
			<ul class="divide-y divide-white/5">
				{#each cats as c, i (c.id)}
					{@const v = rows[c.id] ?? 0}
					{@const delta = v - current[c.id]}
					<li
						class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded px-1 py-1.5 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto_4.75rem] {hovered ===
						i
							? 'bg-white/5'
							: ''}"
						onmouseenter={() => (hovered = i)}
						onmouseleave={() => (hovered = -1)}
					>
						<div class="min-w-0">
							<div class="flex items-center gap-2">
								<span class="h-3 w-3 flex-shrink-0 rounded-sm" style="background:{c.color}" aria-hidden="true"></span>
								<span class="truncate text-sm font-bold text-white">{c.label}</span>
							</div>
							<div class="ps-5 text-[11px] leading-4 text-gray-400">
								{#if editable}
									<button type="button" class="ref" title="החזרה לערך בתקציב הנוכחי" onclick={() => setValue(c.id, current[c.id])}>
										כיום {current[c.id]}%
									</button>
									{#if average}
										<span aria-hidden="true">·</span>
										<button type="button" class="ref" title="אימוץ ממוצע ההצבעות" onclick={() => setValue(c.id, average[c.id])}>
											ממוצע {average[c.id]}%
										</button>
									{/if}
								{:else}
									כיום {current[c.id]}%{#if mine}{' · '}הצבעתך {mine.alloc[c.id]}%{/if}
								{/if}
							</div>
						</div>

						<div class="slider order-3 sm:order-none" class:has-lane={!!average} style="--c:{c.color}">
							<div class="rail" aria-hidden="true">
								<span class="fill" style="width:{v}%"></span>
								<span class="tick" style="inset-inline-start:{current[c.id]}%"></span>
							</div>
							{#if editable}
								<input
									type="range"
									min="0"
									max="100"
									step="1"
									value={v}
									oninput={(e) => setValue(c.id, e.currentTarget.valueAsNumber)}
									aria-label="{c.label} — אחוז מהתקציב"
									aria-valuetext="{v}% — {nis(amount(v))}"
								/>
							{/if}
							{#if average}
								<div class="lane" aria-hidden="true">
									{#each ballots as b}
										<i class="dot" style="inset-inline-start:{b[c.id] ?? 0}%"></i>
									{/each}
									<i class="avg" style="inset-inline-start:{average[c.id]}%"></i>
								</div>
							{/if}
						</div>

						<div class="order-4 flex items-center gap-1 sm:order-none">
							{#if editable}
								<button
									type="button"
									class="step"
									aria-label="הפחתת אחוז: {c.label}"
									disabled={v <= 0}
									onclick={() => setValue(c.id, v - 1)}>−</button
								>
								<label class="pct">
									<input
										type="number"
										inputmode="numeric"
										min="0"
										max="100"
										step="1"
										value={v}
										oninput={(e) => setValue(c.id, e.currentTarget.valueAsNumber)}
										onfocus={(e) => e.currentTarget.select()}
										onblur={(e) => (e.currentTarget.value = String(draft[c.id] ?? 0))}
										aria-label="{c.label} — אחוז מהתקציב"
									/>
									<span aria-hidden="true">%</span>
								</label>
								<button
									type="button"
									class="step"
									aria-label="הוספת אחוז: {c.label}"
									disabled={v >= 100}
									onclick={() => setValue(c.id, v + 1)}>+</button
								>
							{:else}
								<span class="w-12 text-end text-sm font-black tabular-nums text-white">{v}%</span>
							{/if}
						</div>

						<div class="order-2 text-end sm:order-none">
							<div class="text-sm font-bold tabular-nums text-white">{nis(amount(v))}</div>
							<!-- ההפרש מהתקציב הנוכחי; השורה שמורה גם כשאין הפרש, כדי שהסכום לא יקפוץ -->
							<div class="h-4 text-[11px] leading-4 tabular-nums {delta > 0 ? 'text-emerald-300' : 'text-rose-300'}">
								{#if delta !== 0}
									<span dir="ltr">{delta > 0 ? '+' : '−'}{nis(amount(Math.abs(delta)))}</span>
								{/if}
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<div>
				<ul class="divide-y divide-white/5 text-sm">
					{#each slices as s, i (s.id)}
						<li
							class="flex items-center gap-2.5 rounded px-1 py-1.5 {hovered === i ? 'bg-white/5' : ''}"
							onmouseenter={() => (hovered = i)}
							onmouseleave={() => (hovered = -1)}
						>
							<span class="h-3 w-3 flex-shrink-0 rounded-sm" style="background:{s.color}" aria-hidden="true"></span>
							<span class="flex-1 font-bold text-white">{s.label}</span>
							<span class="tabular-nums text-gray-300">{nis(s.amount)}</span>
							<span class="w-10 text-end tabular-nums text-gray-400">{s.value}%</span>
						</li>
					{/each}
				</ul>
				<p class="mt-3 border-t border-white/10 pt-3 text-xs text-gray-400">
					ההצבעה על חלוקת התקציב פתוחה לאדמינים ולרכזי שכונות בלבד.
				</p>
			</div>
		{/if}
	</div>

	{#if canVote}
		<footer class="mt-3 border-t border-white/10 pt-3">
			<div class="flex flex-wrap items-center gap-2">
				<p class="rounded-lg border px-2.5 py-1 text-[13px] font-bold {status.tone}" role="status">{status.text}</p>
				{#if editable && left !== 0}
					<button
						type="button"
						onclick={balance}
						title="מתחלק באופן יחסי בין הסעיפים שלא שינית"
						class="rounded-lg border border-white/15 px-2.5 py-1 text-[13px] font-bold text-gray-100 hover:bg-white/10"
					>
						{left > 0 ? 'חלק את היתרה' : 'קצץ את החריגה'}
					</button>
				{/if}
				<div class="flex grow items-center justify-end gap-2">
					{#if editable && mine && !dirty}
						<button
							type="button"
							onclick={cancelVote}
							disabled={busy}
							class="text-xs text-gray-400 underline underline-offset-2 hover:text-white disabled:opacity-50"
						>
							ביטול ההצבעה
						</button>
					{/if}
					{#if editable && dirty}
						<button
							type="button"
							onclick={reset}
							class="rounded-lg border border-white/15 px-3 py-1.5 text-[13px] font-bold text-gray-200 hover:bg-white/10"
						>
							{mine ? 'ביטול השינוי' : 'איפוס'}
						</button>
					{/if}
					{#if editable && (!mine || dirty)}
						<button
							type="button"
							onclick={submit}
							disabled={left !== 0 || busy}
							class="grow rounded-lg bg-indigo-500 px-4 py-1.5 text-[13px] font-black text-white transition-colors enabled:hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40 sm:grow-0"
						>
							{busy ? 'שומר…' : mine ? 'עדכון ההצבעה' : 'שליחת ההצבעה'}
						</button>
					{/if}
				</div>
			</div>
			{#if error}
				<p class="mt-2 text-xs font-bold text-rose-300" role="alert">{error}</p>
			{/if}
			<p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] leading-4 text-gray-400">
				<span class="key"><i class="k-tick"></i> התקציב כיום</span>
				{#if average}
					<span class="key"><i class="k-dot"></i> הצבעות</span>
					<span class="key"><i class="k-avg"></i> {closed ? 'התוצאה' : 'ממוצע'}</span>
				{:else}
					<span>🔒 תוצאות הביניים נחשפות אחרי ההצבעה</span>
				{/if}
				<span>התוצאה הסופית: ממוצע כל ההצבעות</span>
				{#if note}<span>{note}</span>{/if}
			</p>
		</footer>
	{/if}
</section>

<style>
	/* המחוון: פס מצויר (rail) ומעליו input שקוף שנותן רק את הידית. הפס והמסלול שמתחתיו
	   מוזחים בחצי ידית מכל צד, כך שאחוז X בפס נופל בדיוק מתחת למרכז הידית. */
	.slider {
		--thumb: 18px;
		position: relative;
		height: 20px;
		min-width: 0;
	}
	.slider.has-lane {
		height: 30px;
	}
	.rail {
		position: absolute;
		inset-inline: calc(var(--thumb) / 2);
		top: 6px;
		height: 8px;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.1);
	}
	.fill {
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		border-radius: 999px;
		background: var(--c);
	}
	/* התקציב הנוכחי */
	.tick {
		position: absolute;
		top: -3px;
		bottom: -3px;
		width: 2px;
		margin-inline-start: -1px;
		border-radius: 1px;
		background: #fff;
		box-shadow: 0 0 0 1px rgb(0 0 0 / 0.45);
	}
	/* מסלול התוצאות: נקודה לכל הצבעה, משולש לממוצע */
	.lane {
		position: absolute;
		inset-inline: calc(var(--thumb) / 2);
		top: 20px;
		height: 8px;
	}
	.dot {
		position: absolute;
		top: 2px;
		width: 5px;
		height: 5px;
		margin-inline-start: -2.5px;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.4);
	}
	.avg {
		position: absolute;
		top: 0;
		width: 0;
		height: 0;
		margin-inline-start: -5px;
		border-inline: 5px solid transparent;
		border-bottom: 8px solid #f5d57a;
	}

	.slider input {
		position: absolute;
		inset-inline: 0;
		top: -4px;
		width: 100%;
		height: 28px;
		margin: 0;
		padding: 0;
		background: transparent;
		appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
		touch-action: pan-y;
	}
	.slider input::-webkit-slider-runnable-track {
		height: 28px;
		background: transparent;
	}
	.slider input::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: var(--thumb);
		height: var(--thumb);
		margin-top: 5px;
		border: 3px solid var(--c);
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 4px rgb(0 0 0 / 0.6);
	}
	.slider input::-moz-range-track {
		height: 28px;
		background: transparent;
	}
	.slider input::-moz-range-thumb {
		box-sizing: border-box;
		width: var(--thumb);
		height: var(--thumb);
		border: 3px solid var(--c);
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 4px rgb(0 0 0 / 0.6);
	}

	.step {
		width: 28px;
		height: 28px;
		border: 1px solid rgb(255 255 255 / 0.15);
		border-radius: 6px;
		color: #e5e7eb;
		font-size: 16px;
		font-weight: 800;
		line-height: 1;
	}
	.step:enabled:hover {
		background: rgb(255 255 255 / 0.1);
	}
	.step:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	/* שדה האחוז: המספר והסימן % תמיד משמאל לימין */
	.pct {
		position: relative;
		display: block;
		width: 52px;
		height: 28px;
		direction: ltr;
	}
	.pct input {
		width: 100%;
		height: 100%;
		padding: 0 20px 0 2px;
		border: 1px solid rgb(255 255 255 / 0.15);
		border-radius: 6px;
		background: rgb(0 0 0 / 0.25);
		color: #fff;
		font-size: 13px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		text-align: right;
		appearance: textfield;
		-moz-appearance: textfield;
	}
	.pct input::-webkit-outer-spin-button,
	.pct input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.pct span {
		position: absolute;
		top: 50%;
		right: 8px;
		transform: translateY(-50%);
		color: #9ca3af;
		font-size: 11px;
		pointer-events: none;
	}
	/* במסך מגע: שדה עם גופן קטן מ-16px גורם ל-iOS להגדיל את הדף בכל הקלדה */
	@media (pointer: coarse) {
		.pct {
			width: 58px;
		}
		.pct input {
			font-size: 16px;
		}
	}

	/* "כיום 30%" / "ממוצע 27%" — לחיצה מעתיקה את הערך למחוון */
	.ref {
		text-decoration: underline dotted rgb(255 255 255 / 0.35);
		text-underline-offset: 2px;
	}
	.ref:hover {
		color: #fff;
	}

	/* מקרא הסימנים שעל המחוון */
	.key {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.k-tick {
		width: 2px;
		height: 11px;
		border-radius: 1px;
		background: #fff;
	}
	.k-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.55);
	}
	.k-avg {
		width: 0;
		height: 0;
		border-inline: 4px solid transparent;
		border-bottom: 7px solid #f5d57a;
	}
</style>
