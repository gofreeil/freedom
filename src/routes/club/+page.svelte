<script lang="ts">
	// /club — "מועדון יוצאים לחירות": ההטבות לחבר המועדון. אדמינים בלבד בינתיים;
	// לכל השאר data.club = null ומוצג "דף זה בבנייה" (ההרשאה והתוכן ב-load).
	let { data } = $props();

	// מספור רציף של ההטבות לאורך כל הקטגוריות (1–10)
	const numbered = $derived.by(() => {
		let n = 0;
		return (data.club?.sections ?? []).map((s) => ({
			...s,
			benefits: s.benefits.map((b) => ({ ...b, n: ++n }))
		}));
	});
</script>

<svelte:head>
	<title>מועדון יוצאים לחירות | יוצאים לחירות</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-6" dir="rtl">
	{#if !data.club}
		<div class="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#141c2f] p-6 text-center">
			<h1 class="flex items-center justify-center gap-2.5 text-xl font-black text-white">
				<span aria-hidden="true">🚧</span> דף זה בבנייה
			</h1>
			<p class="mt-1.5 text-sm text-gray-400">הדף ייפתח בקרוב.</p>
			<a href="/" class="mt-3 inline-block rounded-lg border border-white/15 px-3 py-1.5 text-[13px] font-bold text-gray-200 hover:bg-white/5">חזרה לדף הבית</a>
		</div>
	{:else}
		<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
			<h1 class="flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
				<span aria-hidden="true">🕊️</span> מועדון יוצאים לחירות
			</h1>
			<span class="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-200">
				{data.club.price}
			</span>
			<span class="rounded-full border border-white/15 px-2.5 py-0.5 text-xs font-bold text-gray-300">
				🚧 בבנייה — גלוי לאדמינים בלבד
			</span>
			<p class="basis-full text-sm text-gray-300">{data.club.intro}</p>
		</div>

		<div class="space-y-3">
			{#each numbered as section}
				<section>
					<h2 class="mb-1.5 flex items-center gap-2 text-sm font-black text-amber-200">
						<span aria-hidden="true">{section.icon}</span> {section.title}
					</h2>
					<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{#each section.benefits as b}
							<article class="rounded-xl border border-white/10 bg-[#141c2f] p-3">
								<h3 class="flex items-start gap-2 text-sm font-bold leading-snug text-white">
									<span aria-hidden="true">{b.icon}</span>
									<span>{b.n}. {b.title}</span>
								</h3>
								{#if b.note}
									<p class="mt-1 text-xs italic text-amber-200/80">{b.note}</p>
								{/if}
								<svelte:element
									this={b.ordered ? 'ol' : 'ul'}
									class="mt-1.5 space-y-0.5 ps-5 text-[13px] leading-snug text-gray-300 {b.ordered ? 'list-decimal' : 'list-disc'}"
								>
									{#each b.points as p}
										<li>{p}</li>
									{/each}
								</svelte:element>
							</article>
						{/each}
					</div>
				</section>
			{/each}
		</div>

		<p class="mt-4 text-center text-sm font-bold text-gray-300">🕊️ {data.club.motto}</p>
	{/if}
</div>
