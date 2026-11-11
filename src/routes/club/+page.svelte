<script lang="ts">
	// /club — "מועדון יוצאים לחירות": ההטבות לחבר המועדון. פתוח לכל גולש, מסומן כטיוטא.
	let { data } = $props();

	// מספור רציף של ההטבות לאורך כל הקטגוריות (1–10)
	const numbered = $derived.by(() => {
		let n = 0;
		return data.club.sections.map((s) => ({
			...s,
			benefits: s.benefits.map((b) => ({ ...b, n: ++n }))
		}));
	});
</script>

<svelte:head>
	<title>מועדון יוצאים לחירות | יוצאים לחירות</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-4 sm:py-6" dir="rtl">
		<div class="mb-1.5">
			<span class="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-200/90">
				🚧 דף זה הינו בבניה ומשמש כטיוטא בלבד
			</span>
		</div>

		<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
			<h1 class="flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
				<span aria-hidden="true">🕊️</span> מועדון יוצאים לחירות
			</h1>
			<span class="rounded-xl border-2 border-red-500 bg-red-500/20 px-3.5 py-1 text-base sm:text-xl font-black text-red-400 shadow-md shadow-red-500/30">
				{data.club.price}
			</span>
			<p class="basis-full text-[15px] leading-snug text-gray-300">{data.club.intro}</p>
		</div>

		<!-- רשימה אחת רציפה: כותרת קטגוריה, ומתחתיה שורות מופרדות בקו דק (בלי כרטיס לכל סעיף) -->
		<div class="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#141c2f]/90">
			{#each numbered as section}
				<section>
					<h2 class="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-1 text-[15px] leading-tight font-black text-amber-200">
						<span aria-hidden="true">{section.icon}</span> {section.title}
					</h2>
					<ul class="divide-y divide-white/5">
						{#each section.benefits as b}
							<li class="grid grid-cols-[1.75rem_1fr] gap-x-3 gap-y-0.5 px-4 py-1.5 md:grid-cols-[1.75rem_22rem_1fr]">
								<span class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/15 text-sm font-black text-amber-200">
									{b.n}
								</span>
								<div class="self-center">
									<h3 class="text-base font-bold leading-tight text-white">
										<span aria-hidden="true">{b.icon}</span> {b.title}
									</h3>
									{#if b.note}
										<p class="mt-0.5 text-[13px] italic text-amber-200/80">{b.note}</p>
									{/if}
								</div>
								<svelte:element
									this={b.ordered ? 'ol' : 'ul'}
									class="col-start-2 self-center ps-4 text-[15px] leading-tight text-gray-300 marker:text-amber-200/60 md:col-start-3 {b.ordered ? 'list-decimal' : 'list-disc'}"
								>
									{#each b.points as p}
										<li>{p}</li>
									{/each}
								</svelte:element>
							</li>
						{/each}
					</ul>
					{#if section.saving}
						<p class="flex justify-end border-t border-white/5 px-4 py-1">
							<span class="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[13px] font-bold text-emerald-200">
								{section.saving}
							</span>
						</p>
					{/if}
				</section>
			{/each}

			{#if data.club.totalSaving}
				<div class="flex flex-wrap items-center justify-between gap-3 border-t-2 border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 sm:px-6 sm:py-3">
					<span class="text-base sm:text-xl font-black text-emerald-200">
						סה"כ שווי ההטבה:
					</span>
					<span class="rounded-xl border border-emerald-400/50 bg-emerald-400/20 px-3.5 py-1 text-lg sm:text-2xl font-black text-emerald-300 shadow-md shadow-emerald-400/20">
						{data.club.totalSaving}
					</span>
				</div>
			{/if}
		</div>

		<div class="mt-4 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-right">
			<p class="text-sm font-bold text-gray-300">🕊️ {data.club.motto}</p>
			<a
				href="/club/charter"
				class="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200 transition-colors hover:bg-sky-400/20 hover:text-white"
			>
				📜 אמנת החברים
			</a>
		</div>
</div>
