<script lang="ts">
	// ProtocolsView.svelte — רכיב תצוגת פרוטוקולים והחלטות לאדמינים
	import { onMount } from 'svelte';

	interface Protocol {
		id: string;
		title: string;
		category: 'הנהלה' | 'תקציב' | 'פיתוח' | 'קהילה';
		date: string;
		participants: string[];
		summary: string;
		decisions: string[];
		fullText?: string;
		videoUrl?: string;
		status: 'approved' | 'in_progress';
	}

	const INITIAL_PROTOCOLS: Protocol[] = [];
	const MOCK_IDS = new Set(['p-14', 'p-13', 'p-12', 'p-11']);
	const STORAGE_KEY = 'freedom_protocols_v2';

	let protocols = $state<Protocol[]>(INITIAL_PROTOCOLS);
	let query = $state('');
	let categoryFilter = $state<string>('הכל');
	let expandedId = $state<string | null>(null);
	let showNewModal = $state(false);
	let copied = $state(false);

	// שדות טופס פרוטוקול חדש
	let newTitle = $state('');
	let newCategory = $state<'הנהלה' | 'תקציב' | 'פיתוח' | 'קהילה'>('הנהלה');
	let newDate = $state(new Date().toISOString().slice(0, 10));
	let newParticipants = $state('');
	let newSummary = $state('');
	let newDecisions = $state('');
	let newFullText = $state('');
	let newVideoUrl = $state('');

	function getEmbedUrl(rawUrl?: string): string | null {
		if (!rawUrl) return null;
		const url = rawUrl.trim();
		if (!url) return null;

		// YouTube: watch, embed, shorts, youtu.be
		const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
		if (yt && yt[1]) {
			return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
		}

		// Vimeo
		const vimeo = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|video\/|)(\d+)/);
		if (vimeo && vimeo[1]) {
			return `https://player.vimeo.com/video/${vimeo[1]}`;
		}

		return url;
	}

	function isDirectVideo(url?: string): boolean {
		if (!url) return false;
		return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url.trim());
	}

	function promptEditVideo(p: Protocol) {
		const next = prompt('הזינו קישור לוידאו (YouTube, Vimeo או קישור ישיר):', p.videoUrl || '');
		if (next === null) return;
		p.videoUrl = next.trim() || undefined;
		saveToStorage([...protocols]);
	}

	onMount(() => {
		try {
			// ניקוי מפתח מוקאפ ישן
			localStorage.removeItem('freedom_protocols_data_v1');
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) {
					// סינון כל נתוני דמה ישנים
					protocols = parsed.filter((p) => p && typeof p === 'object' && !MOCK_IDS.has(p.id));
				}
			}
		} catch {}
	});

	function saveToStorage(list: Protocol[]) {
		protocols = list;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
		} catch {}
	}

	function handleDeleteProtocol(id: string, title: string) {
		if (!confirm(`האם למחוק את הפרוטוקול "${title}"?`)) return;
		const updated = protocols.filter((p) => p.id !== id);
		saveToStorage(updated);
		if (expandedId === id) expandedId = null;
	}

	function handleAddProtocol(e: SubmitEvent) {
		e.preventDefault();
		if (!newTitle.trim()) return;

		const decisionsList = newDecisions
			.split('\n')
			.map((d) => d.trim())
			.filter(Boolean);

		const participantsList = newParticipants
			.split(',')
			.map((p) => p.trim())
			.filter(Boolean);

		const item: Protocol = {
			id: `p-${Date.now()}`,
			title: newTitle.trim(),
			category: newCategory,
			date: newDate,
			participants: participantsList.length > 0 ? participantsList : ['הנהלת הרשת'],
			summary: newSummary.trim() || newTitle.trim(),
			decisions: decisionsList.length > 0 ? decisionsList : ['ההחלטות מתועדות בפרוטוקול המלא.'],
			fullText: newFullText.trim() || undefined,
			videoUrl: newVideoUrl.trim() || undefined,
			status: 'approved'
		};

		saveToStorage([item, ...protocols]);
		expandedId = item.id;
		showNewModal = false;

		// איפוס
		newTitle = '';
		newSummary = '';
		newDecisions = '';
		newParticipants = '';
		newFullText = '';
		newVideoUrl = '';
	}

	async function share() {
		const url = `${window.location.origin}/protocols`;
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2500);
		} catch {
			prompt('העתיקו את הקישור:', url);
		}
	}

	const filtered = $derived(
		protocols.filter((p) => {
			const matchCategory = categoryFilter === 'הכל' || p.category === categoryFilter;
			const q = query.trim().toLowerCase();
			const matchQuery =
				!q ||
				p.title.toLowerCase().includes(q) ||
				p.summary.toLowerCase().includes(q) ||
				p.decisions.some((d) => d.toLowerCase().includes(q)) ||
				p.participants.some((pr) => pr.toLowerCase().includes(q));
			return matchCategory && matchQuery;
		})
	);

	const CATEGORY_STYLES: Record<string, string> = {
		'הנהלה': 'border-purple-400/30 bg-purple-500/15 text-purple-200',
		'תקציב': 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
		'פיתוח': 'border-blue-400/30 bg-blue-500/15 text-blue-200',
		'קהילה': 'border-amber-400/30 bg-amber-500/15 text-amber-200'
	};
</script>

<div class="mx-auto max-w-5xl px-2 sm:px-4 py-2 sm:py-4" dir="rtl">
	<!-- כותרת ראשית קומפקטית + פעולות -->
	<header class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-2.5">
			<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-2xl ring-1 ring-amber-500/30 shadow-sm" aria-hidden="true">
				📜
			</span>
			<div>
				<h1 class="text-xl font-black text-white sm:text-2xl flex items-center gap-2">
					פרוטוקולים והחלטות
					<span class="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
						אדמינים
					</span>
				</h1>
				<p class="text-sm text-gray-300">תיעוד ישיבות, החלטות הנהלה ומעקב ביצוע</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => (showNewModal = true)}
				class="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/20 px-3.5 py-2 text-sm font-bold text-amber-200 transition hover:bg-amber-500/30 cursor-pointer shadow-sm"
			>
				<span aria-hidden="true">➕</span>
				<span>הוספת פרוטוקול</span>
			</button>
			<button
				type="button"
				onclick={share}
				class="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/10 cursor-pointer"
				title="העתקת קישור לדף"
			>
				<span>{copied ? '✓ הועתק' : '🔗 שתף'}</span>
			</button>
		</div>
	</header>

	<!-- סרגל סינון וחיפוש קומפקטי -->
	<div class="mb-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#141c2f] p-2.5">
		<!-- חיפוש -->
		<div class="relative min-w-[200px] flex-1">
			<input
				type="search"
				bind:value={query}
				placeholder="חיפוש בפרוטוקולים, החלטות או משתתפים…"
				class="w-full rounded-lg border border-white/15 bg-white/5 py-2 pe-3 ps-9 text-sm sm:text-base text-white placeholder-gray-400 focus:border-amber-400/60 focus:bg-white/10 focus:outline-none"
			/>
			<span class="pointer-events-none absolute inset-y-0 start-2.5 flex items-center text-sm text-gray-400" aria-hidden="true">
				🔍
			</span>
		</div>

		<!-- קטגוריות -->
		<div class="flex items-center gap-1.5 overflow-x-auto text-sm" role="group" aria-label="סינון לפי קטגוריה">
			{#each ['הכל', 'הנהלה', 'תקציב', 'פיתוח', 'קהילה'] as cat}
				<button
					type="button"
					onclick={() => (categoryFilter = cat)}
					class="rounded-lg px-3 py-1.5 text-sm sm:text-base font-bold transition-colors cursor-pointer {categoryFilter === cat
						? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 shadow-sm'
						: 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}"
				>
					{cat}
				</button>
			{/each}
		</div>
	</div>

	<!-- רשימת פרוטוקולים -->
	<div class="space-y-2.5">
		{#if filtered.length === 0}
			<div class="rounded-2xl border border-white/10 bg-[#141c2f] p-8 text-center">
				<p class="text-base sm:text-lg font-bold text-gray-200">
					{query || categoryFilter !== 'הכל'
						? 'לא נמצאו פרוטוקולים התואמים את החיפוש.'
						: 'עדיין לא הוזנו פרוטוקולים במערכת.'}
				</p>
				{#if query || categoryFilter !== 'הכל'}
					<button
						type="button"
						onclick={() => {
							query = '';
							categoryFilter = 'הכל';
						}}
						class="mt-3 text-sm font-bold text-amber-300 hover:underline cursor-pointer"
					>
						איפוס סינונים
					</button>
				{:else}
					<p class="mt-1 text-sm text-gray-400">ניתן להוסיף פרוטוקול חדש בלחיצה על הכפתור למטה.</p>
					<button
						type="button"
						onclick={() => (showNewModal = true)}
						class="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/25 px-4 py-2 text-sm font-bold text-amber-200 transition hover:bg-amber-500/35 cursor-pointer shadow-sm"
					>
						<span>➕</span>
						<span>הוספת פרוטוקול ראשון</span>
					</button>
				{/if}
			</div>
		{:else}
			{#each filtered as p (p.id)}
				{@const isExpanded = expandedId === p.id}
				<article
					class="overflow-hidden rounded-2xl border transition-all {isExpanded
						? 'border-amber-400/40 bg-[#141c2f] shadow-lg shadow-amber-950/20'
						: 'border-white/10 bg-[#141c2f]/70 hover:border-white/20 hover:bg-[#141c2f]'}"
				>
					<!-- שורת כותרת ראשית (תמיד גלויה, לחיצה פותחת/סוגרת) -->
					<div
						role="button"
						tabindex="0"
						onclick={() => (expandedId = isExpanded ? null : p.id)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								expandedId = isExpanded ? null : p.id;
							}
						}}
						class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-3.5 sm:p-4 cursor-pointer select-none"
					>
						<div class="flex items-center gap-3 min-w-0 flex-1">
							<span
								class="rounded-md border px-2.5 py-1 text-xs sm:text-sm font-black shrink-0 {CATEGORY_STYLES[p.category] || 'border-white/20 bg-white/5 text-gray-200'}"
							>
								{p.category}
							</span>
							<h2 class="text-base sm:text-lg md:text-xl font-bold text-white truncate">{p.title}</h2>
						</div>

						<div class="flex items-center gap-3 shrink-0 text-sm sm:text-base">
							<time datetime={p.date} class="tabular-nums text-gray-300 font-semibold text-sm sm:text-base">
								{new Date(p.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' })}
							</time>
							{#if p.videoUrl}
								<span
									class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold bg-purple-500/15 text-purple-200 border border-purple-400/30"
									title="קיימת הקלטת וידאו לפרוטוקול זה"
								>
									🎥 וידאו
								</span>
							{/if}
							<span
								class="hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs sm:text-sm font-bold {p.status === 'approved'
									? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
									: 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}"
							>
								{p.status === 'approved' ? '✓ מאושר' : '⏳ בביצוע'}
							</span>
							<span class="text-gray-300 text-sm transition-transform {isExpanded ? 'rotate-180' : ''}" aria-hidden="true">
								▼
							</span>
						</div>
					</div>

					<!-- תוכן מורחב -->
					{#if isExpanded}
						<div class="border-t border-white/10 bg-white/[0.02] p-4 sm:p-5 text-sm sm:text-base">
							<!-- משתתפים ותקציר -->
							<div class="mb-3.5 flex flex-wrap items-center gap-2 text-gray-200 text-sm sm:text-base">
								<span class="font-bold text-amber-200">👥 משתתפים:</span>
								{#each p.participants as person, i}
									<span class="rounded bg-white/10 px-2.5 py-1 text-xs sm:text-sm text-gray-200">{person}</span>
									{#if i < p.participants.length - 1}<span class="text-gray-500">·</span>{/if}
								{/each}
							</div>

							<p class="mb-4 text-base sm:text-lg text-gray-100 leading-relaxed">{p.summary}</p>

							<!-- אזור וידאו / הקלטת ישיבה -->
							{#if p.videoUrl}
								<div class="mb-4 rounded-xl border border-white/10 bg-[#0a0f1d] p-3 sm:p-4">
									<div class="mb-2.5 flex items-center justify-between gap-2">
										<h3 class="flex items-center gap-2 text-sm sm:text-base font-black text-amber-200">
											<span>🎥</span>
											<span>הקלטת וידאו של הישיבה</span>
										</h3>
										<div class="flex items-center gap-2">
											<button
												type="button"
												onclick={() => promptEditVideo(p)}
												class="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-amber-300 cursor-pointer"
											>
												✏️ עריכת קישור
											</button>
											<button
												type="button"
												onclick={() => {
													if (confirm('האם להסיר את הוידאו מפרוטוקול זה?')) {
														p.videoUrl = undefined;
														saveToStorage([...protocols]);
													}
												}}
												class="rounded-lg border border-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-950/30 cursor-pointer"
											>
												✕ הסרה
											</button>
										</div>
									</div>

									<div class="relative aspect-video w-full overflow-hidden rounded-lg bg-black/60 shadow-lg">
										{#if isDirectVideo(p.videoUrl)}
											<video src={p.videoUrl} controls class="h-full w-full object-contain">
												<track kind="captions" />
											</video>
										{:else}
											<iframe
												src={getEmbedUrl(p.videoUrl)}
												title={`הקלטת וידאו: ${p.title}`}
												class="h-full w-full border-0"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
												allowfullscreen
											></iframe>
										{/if}
									</div>
								</div>
							{:else}
								<div class="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.015] p-3 sm:p-3.5">
									<div class="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300">
										<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-base" aria-hidden="true">📹</span>
										<span>טרם צורפה הקלטת וידאו לישיבה זו</span>
									</div>
									<button
										type="button"
										onclick={() => promptEditVideo(p)}
										class="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs sm:text-sm font-bold text-amber-200 hover:bg-amber-400/20 transition cursor-pointer"
									>
										➕ הוספת קישור לוידאו
									</button>
								</div>
							{/if}

							<!-- החלטות מרכזיות -->
							<div class="rounded-xl border border-white/10 bg-[#0f1626] p-4 mb-4">
								<h3 class="mb-3 font-black text-amber-200 flex items-center gap-2 text-sm sm:text-base">
									<span>⚖️</span>
									<span>החלטות עיקריות שהתקבלו:</span>
								</h3>
								<ul class="space-y-2 text-sm sm:text-base leading-relaxed">
									{#each p.decisions as decision}
										<li class="flex items-start gap-2.5 text-gray-100">
											<span class="text-emerald-400 shrink-0 font-bold" aria-hidden="true">✔</span>
											<span>{decision}</span>
										</li>
									{/each}
								</ul>
							</div>

							{#if p.fullText}
								<div class="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-4 text-sm sm:text-base leading-relaxed text-gray-200">
									<h4 class="mb-1.5 font-bold text-gray-400 text-xs sm:text-sm">תמליל / רקע נוסף:</h4>
									<p>{p.fullText}</p>
								</div>
							{/if}

							<!-- פעולות -->
							<div class="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
								<button
									type="button"
									onclick={() => handleDeleteProtocol(p.id, p.title)}
									class="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs sm:text-sm font-bold text-red-300 hover:bg-red-900/30 cursor-pointer"
								>
									🗑️ מחיקה
								</button>
								<div class="flex items-center gap-2">
									<button
										type="button"
										onclick={() => window.print()}
										class="rounded-lg border border-white/15 px-3 py-1.5 text-xs sm:text-sm font-bold text-gray-300 hover:bg-white/5 cursor-pointer"
									>
										🖨️ הדפסה
									</button>
									<button
										type="button"
										onclick={() => {
											const text = `${p.title}\nתאריך: ${p.date}\nהחלטות:\n${p.decisions.map((d) => `- ${d}`).join('\n')}`;
											navigator.clipboard.writeText(text);
											alert('תקציר הפרוטוקול הועתק ללוח!');
										}}
										class="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs sm:text-sm font-bold text-amber-200 hover:bg-amber-400/20 cursor-pointer"
									>
										📋 העתקת סיכום
									</button>
								</div>
							</div>
						</div>
					{/if}
				</article>
			{/each}
		{/if}
	</div>
</div>

<!-- מודל הוספת פרוטוקול חדש -->
{#if showNewModal}
	<div
		class="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div class="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f1626] p-4 sm:p-6 shadow-2xl text-right" dir="rtl">
			<div class="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
				<h3 id="modal-title" class="text-lg sm:text-xl font-black text-white flex items-center gap-2">
					<span>📜</span>
					<span>הוספת פרוטוקול חדש</span>
				</h3>
				<button
					type="button"
					onclick={() => (showNewModal = false)}
					class="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer text-base"
					aria-label="סגירה"
				>
					✕
				</button>
			</div>

			<form onsubmit={handleAddProtocol} class="space-y-3.5 text-sm">
				<div>
					<label for="p-title" class="block font-bold text-gray-200 mb-1.5 text-sm">כותרת הפרוטוקול *</label>
					<input
						id="p-title"
						type="text"
						bind:value={newTitle}
						required
						placeholder="למשל: ישיבת הנהלה מס׳ 15 — ..."
						class="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm sm:text-base text-white placeholder-gray-500 focus:border-amber-400/60 focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-2.5">
					<div>
						<label for="p-cat" class="block font-bold text-gray-200 mb-1.5 text-sm">קטגוריה</label>
						<select
							id="p-cat"
							bind:value={newCategory}
							class="w-full rounded-lg border border-white/15 bg-[#141c2f] px-3.5 py-2 text-sm sm:text-base text-white focus:border-amber-400/60 focus:outline-none"
						>
							<option value="הנהלה">הנהלה</option>
							<option value="תקציב">תקציב</option>
							<option value="פיתוח">פיתוח</option>
							<option value="קהילה">קהילה</option>
						</select>
					</div>

					<div>
						<label for="p-date" class="block font-bold text-gray-200 mb-1.5 text-sm">תאריך</label>
						<input
							id="p-date"
							type="date"
							bind:value={newDate}
							class="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm sm:text-base text-white focus:border-amber-400/60 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="p-participants" class="block font-bold text-gray-200 mb-1.5 text-sm">משתתפים (מופרדים בפסיקים)</label>
					<input
						id="p-participants"
						type="text"
						bind:value={newParticipants}
						placeholder="הנהלת הרשת, רכזי שטח, יוסי, דנה..."
						class="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm sm:text-base text-white placeholder-gray-500 focus:border-amber-400/60 focus:outline-none"
					/>
				</div>

				<div>
					<label for="p-summary" class="block font-bold text-gray-200 mb-1.5 text-sm">תקציר הישיבה</label>
					<textarea
						id="p-summary"
						rows="2"
						bind:value={newSummary}
						placeholder="תקציר תמציתי של הנושאים שעלו..."
						class="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm sm:text-base text-white placeholder-gray-500 focus:border-amber-400/60 focus:outline-none"
					></textarea>
				</div>

				<div>
					<label for="p-video" class="block font-bold text-gray-200 mb-1.5 text-sm">קישור לוידאו / הקלטת ישיבה (YouTube / שידור - אופציונלי)</label>
					<input
						id="p-video"
						type="url"
						bind:value={newVideoUrl}
						placeholder="למשל: https://www.youtube.com/watch?v=... או https://youtu.be/..."
						class="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm sm:text-base text-white placeholder-gray-500 focus:border-amber-400/60 focus:outline-none"
					/>
				</div>

				<div>
					<label for="p-decisions" class="block font-bold text-gray-200 mb-1.5 text-sm">החלטות שהתקבלו (שורה לכל החלטה) *</label>
					<textarea
						id="p-decisions"
						rows="3"
						bind:value={newDecisions}
						required
						placeholder="החלטה 1&#10;החלטה 2..."
						class="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm sm:text-base text-white placeholder-gray-500 focus:border-amber-400/60 focus:outline-none"
					></textarea>
				</div>

				<div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
					<button
						type="button"
						onclick={() => (showNewModal = false)}
						class="rounded-xl border border-white/15 px-3.5 py-2 text-sm font-bold text-gray-300 hover:bg-white/5 cursor-pointer"
					>
						ביטול
					</button>
					<button
						type="submit"
						class="rounded-xl border border-amber-400/40 bg-amber-500/25 px-4 py-2 text-sm font-bold text-amber-200 transition hover:bg-amber-500/35 cursor-pointer shadow-sm"
					>
						שמירת פרוטוקול
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
