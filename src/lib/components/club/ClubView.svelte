<script lang="ts">
	import type { ClubSection } from '$lib/server/clubBenefits';

	interface Props {
		club: {
			price: string;
			intro: string;
			motto: string;
			sections: ClubSection[];
			totalSaving?: string;
		};
	}

	let { club }: Props = $props();

	// מספור רציף של ההטבות לאורך כל הקטגוריות (1–9)
	const numbered = $derived.by(() => {
		let n = 0;
		return club.sections.map((s) => ({
			...s,
			benefits: s.benefits.map((b) => ({ ...b, n: ++n }))
		}));
	});
</script>

<div class="mx-auto max-w-4xl px-2 sm:px-4 py-2 sm:py-4" dir="rtl">
	<div class="mb-1.5">
		<span class="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-200/90">
			🚧 דף זה הינו בבניה ומשמש כטיוטא בלבד
		</span>
	</div>

	<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
		<h2 class="flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
			<span aria-hidden="true">🕊️</span> מועדון יוצאים לחירות
		</h2>
		<span class="rounded-xl border-2 border-red-500 bg-red-500/20 px-3.5 py-1 text-base sm:text-xl font-black text-red-400 shadow-md shadow-red-500/30">
			{club.price}
		</span>
		<p class="basis-full text-[15px] leading-snug text-gray-300">{club.intro}</p>
	</div>

	<!-- רשימה אחת רציפה: כותרת קטגוריה, ומתחתיה שורות מופרדות בקו דק -->
	<div class="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#141c2f]/90">
		{#each numbered as section}
			<section>
				<h3 class="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-1 text-[15px] leading-tight font-black text-amber-200">
					<span aria-hidden="true">{section.icon}</span> {section.title}
				</h3>
				<ul class="divide-y divide-white/5">
					{#each section.benefits as b}
						<li class="grid grid-cols-[1.75rem_1fr] gap-x-3 gap-y-0.5 px-4 py-1.5 md:grid-cols-[1.75rem_22rem_1fr]">
							<span class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/15 text-sm font-black text-amber-200">
								{b.n}
							</span>
							<div class="self-center">
								<h4 class="text-base font-bold leading-tight text-white">
									<span aria-hidden="true">{b.icon}</span> {b.title}
								</h4>
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

		{#if club.totalSaving}
			<div class="flex flex-wrap items-center justify-between gap-3 border-t-2 border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 sm:px-6 sm:py-3">
				<span class="text-base sm:text-xl font-black text-emerald-200">
					סה"כ שווי ההטבה:
				</span>
				<span class="rounded-xl border border-emerald-400/50 bg-emerald-400/20 px-3.5 py-1 text-lg sm:text-2xl font-black text-emerald-300 shadow-md shadow-emerald-400/20">
					{club.totalSaving}
				</span>
			</div>
		{/if}
	</div>

	<!-- במה דמי החבר תומכים (תרומת האתרים לעם ישראל) -->
	<div class="mt-3.5 rounded-2xl border border-white/10 bg-[#141c2f]/80 p-3 sm:p-4">
		<h3 class="mb-1 text-center text-[15px] font-black text-amber-200 sm:text-base">
			🕊️ {club.motto}
		</h3>
		<p class="mb-2.5 text-center text-xs text-gray-400">
			בדמי החבר (59 ש"ח) אתם לא רק חוסכים לעצמכם – אתם מחזיקים ומפתחים את רשת הפלטפורמות החופשית של עם ישראל:
		</p>
		<div class="grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-3">
			<div class="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
				<span class="block text-[13px] font-bold text-sky-200">🤝 קהילה וערבות הדדית</span>
				<p class="mt-1 text-xs leading-relaxed text-gray-300">
					גיבוש שכונות, בתי דין ופיוס לשלום בית, גמ"ח ארצי, שידוכים והשבת אבידה.
				</p>
			</div>
			<div class="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
				<span class="block text-[13px] font-bold text-purple-200">⚖️ משילות וזכויות</span>
				<p class="mt-1 text-xs leading-relaxed text-gray-300">
					ביקורת רשויות וחשיפת שחיתויות, ועדי שכונות מאוחדים, דירוג עובדי ציבור ומשאלי עם.
				</p>
			</div>
			<div class="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
				<span class="block text-[13px] font-bold text-emerald-200">🛒 כלכלה והורדת יוקר המחיה</span>
				<p class="mt-1 text-xs leading-relaxed text-gray-300">
					שבירת מונופולים ברכישות קבוצתיות, בעלי מקצוע כשירים ומסחר ישיר ללא פערי תיווך.
				</p>
			</div>
		</div>
	</div>

	<div class="mt-3 flex justify-center">
		<a
			href="/club/charter"
			class="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-400/10 px-3.5 py-1 text-xs font-bold text-sky-200 transition-colors hover:bg-sky-400/20 hover:text-white"
		>
			📜 אמנת החברים
		</a>
	</div>
</div>
