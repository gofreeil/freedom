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
		status: 'approved' | 'in_progress';
	}

	const INITIAL_PROTOCOLS: Protocol[] = [
		{
			id: 'p-14',
			title: 'ישיבת הנהלה מס׳ 14 — אישור תקציב רבעוני והרחבת רשת הרכזים',
			category: 'הנהלה',
			date: '2026-11-10',
			participants: ['הנהלת הרשת', 'רכזי אתרים מובילים', 'יועץ משפטי'],
			summary: 'דיון בחלוקת התקציב השוטף, פתיחת סבב הצבעה דיגיטלי והרחבת מערך רכזי השכונות.',
			decisions: [
				'אישור פתיחת סבב הצבעת תקציב לכלל הרכזים והאדמינים לתקופה של 14 ימים.',
				'הקצאת רזרבה מיוחדת לשדרוג שרתי התקשורת של חירות TV לקראת אירועי סוף השנה.',
				'הסמכת צוות גיוס מתנדבים להרחבת הפעילות ב-4 מוקדים עירוניים נוספים.'
			],
			fullText:
				'נפתחה הישיבה בשעה 20:00 בהשתתפות נציגי הנהלת הרשת ורכזי האתרים. הוצגו נתוני ההכנסות ממועדון החברים ומתרומות (סך ₪100,000) וסעיפי ההוצאה המרכזיים. הוחלט פה אחד להעביר את ההחלטה על אחוזי החלוקה להצבעת הרכזים במערכת.',
			status: 'approved'
		},
		{
			id: 'p-13',
			title: 'ישיבת כספים ותקציב — עדכון מודל דמי חבר ושקיפות קהילתית',
			category: 'תקציב',
			date: '2026-11-03',
			participants: ['ועדת כספים', 'רואה חשבון', 'נציגי מועדון'],
			summary: 'בחינת מסלולי החברות במועדון, בדיקת תזרים והצגת הדמיית תרשים זרימת הכספים לחברים.',
			decisions: [
				'השקת תצוגת שקיפות מלאה (כסף נכנס, הוצאות וחלוקה) באזור האישי של החברים.',
				'שמירה על גובה דמי החבר הקיימים ללא שינוי ברבעון הקרוב.',
				'הקמת מנגנון דיווח רבעוני אוטומטי על הוצאות משפטיות ושיווק.'
			],
			fullText:
				'הוצג דוח ביצוע מול תקציב. הגירעון נשמר על 0 בזכות העלייה בהצטרפות למועדון. הודגש הצורך לחשוף לכל משתמש מחובר את מקורות המימון ואת אופן השימוש בהם.',
			status: 'approved'
		},
		{
			id: 'p-12',
			title: 'ישיבת צוות טכנולוגי — שדרוג האזור האישי, מערכת המשימות וחירות TV',
			category: 'פיתוח',
			date: '2026-10-26',
			participants: ['צוות פיתוח', 'מעצב ממשק', 'מנהל מוצר'],
			summary: 'תכנון ממשק ניהול משימות לרכזים, התאמה מקיפה למובייל וייעול מהירות הטעינה.',
			decisions: [
				'פיצול האזור האישי ללשוניות קומפקטיות: ניהול ומשימות, תקציב, TV ופרוטוקולים.',
				'הגבלת הרשאות עריכה ברשת הרכזים לפי אתר ייעודי לכל רכז.',
				'מיטוב זמני תגובה וקומפקטיות גלילה בכל מסכי הניהול.'
			],
			fullText:
				'נסקרו משימות הפיתוח הפתוחות. הוחלט לצמצם גבהים מיותרים במסכים (hero קצר וריווחים הדוקים) כדי להבטיח שהתוכן המרכזי יוצג במסך הראשון ללא גלילה.',
			status: 'in_progress'
		},
		{
			id: 'p-11',
			title: 'ישיבת קהילה ואירועים — היערכות לכנסי חורף 2026 והפצת חומרי הסברה',
			category: 'קהילה',
			date: '2026-10-15',
			participants: ['צוות אירועים', 'רכזי שטח', 'הפקת תוכן'],
			summary: 'קביעת לוח זמנים לכנסי קהילה מקומיים, הפקת חומרי דפוס וחלוקה לקבוצות רכישה.',
			decisions: [
				'קיום שני כנסים אזוריים בחודש דצמבר (צפון ומרכז).',
				'הקצאת תקציב ראשוני לפרסום ממוקד ברשתות החברתיות.',
				'אישור חבילת הטבות ייחודית לחברי מועדון באירועים הפיזיים.'
			],
			fullText:
				'הוצגו הצעות מחיר לאולמות ולציוד הגברה. הוחלט לתעדף מקומות קהילתיים מוזלים כדי לעמוד במסגרת סעיף אירועים וקהילה בתקציב.',
			status: 'approved'
		}
	];

	const STORAGE_KEY = 'freedom_protocols_data_v1';

	let protocols = $state<Protocol[]>(INITIAL_PROTOCOLS);
	let query = $state('');
	let categoryFilter = $state<string>('הכל');
	let expandedId = $state<string | null>('p-14');
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

	onMount(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0) {
					protocols = parsed;
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
			<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-xl ring-1 ring-amber-500/30 shadow-sm" aria-hidden="true">
				📜
			</span>
			<div>
				<h1 class="text-lg font-black text-white sm:text-xl flex items-center gap-2">
					פרוטוקולים והחלטות
					<span class="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">
						אדמינים
					</span>
				</h1>
				<p class="text-xs text-gray-400">תיעוד ישיבות, החלטות הנהלה ומעקב ביצוע</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => (showNewModal = true)}
				class="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-200 transition hover:bg-amber-500/30 cursor-pointer shadow-sm"
			>
				<span aria-hidden="true">➕</span>
				<span>הוספת פרוטוקול</span>
			</button>
			<button
				type="button"
				onclick={share}
				class="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-200 transition hover:bg-white/10 cursor-pointer"
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
				class="w-full rounded-lg border border-white/15 bg-white/5 py-1.5 pe-3 ps-8 text-xs text-white placeholder-gray-400 focus:border-amber-400/60 focus:bg-white/10 focus:outline-none"
			/>
			<span class="pointer-events-none absolute inset-y-0 start-2.5 flex items-center text-xs text-gray-400" aria-hidden="true">
				🔍
			</span>
		</div>

		<!-- קטגוריות -->
		<div class="flex items-center gap-1 overflow-x-auto text-xs" role="group" aria-label="סינון לפי קטגוריה">
			{#each ['הכל', 'הנהלה', 'תקציב', 'פיתוח', 'קהילה'] as cat}
				<button
					type="button"
					onclick={() => (categoryFilter = cat)}
					class="rounded-lg px-2.5 py-1 font-bold transition-colors cursor-pointer {categoryFilter === cat
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
				<p class="text-sm font-bold text-gray-300">לא נמצאו פרוטוקולים התואמים את החיפוש.</p>
				<button
					type="button"
					onclick={() => {
						query = '';
						categoryFilter = 'הכל';
					}}
					class="mt-2 text-xs font-bold text-amber-300 hover:underline cursor-pointer"
				>
					איפוס סינונים
				</button>
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
						class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-3 sm:p-4 cursor-pointer select-none"
					>
						<div class="flex items-center gap-2.5 min-w-0 flex-1">
							<span
								class="rounded-md border px-2 py-0.5 text-[11px] font-black shrink-0 {CATEGORY_STYLES[p.category] || 'border-white/20 bg-white/5 text-gray-200'}"
							>
								{p.category}
							</span>
							<h2 class="text-sm sm:text-base font-bold text-white truncate">{p.title}</h2>
						</div>

						<div class="flex items-center gap-3 shrink-0 text-xs">
							<time datetime={p.date} class="tabular-nums text-gray-400">
								{new Date(p.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' })}
							</time>
							<span
								class="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold {p.status === 'approved'
									? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
									: 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}"
							>
								{p.status === 'approved' ? '✓ מאושר' : '⏳ בביצוע'}
							</span>
							<span class="text-gray-400 transition-transform {isExpanded ? 'rotate-180' : ''}" aria-hidden="true">
								▼
							</span>
						</div>
					</div>

					<!-- תוכן מורחב -->
					{#if isExpanded}
						<div class="border-t border-white/10 bg-white/[0.02] p-3.5 sm:p-4 text-xs sm:text-sm">
							<!-- משתתפים ותקציר -->
							<div class="mb-3 flex flex-wrap items-center gap-1.5 text-gray-300">
								<span class="font-bold text-amber-200">👥 משתתפים:</span>
								{#each p.participants as person, i}
									<span class="rounded bg-white/5 px-2 py-0.5 text-[11px] text-gray-300">{person}</span>
									{#if i < p.participants.length - 1}<span class="text-gray-500">·</span>{/if}
								{/each}
							</div>

							<p class="mb-3 text-gray-200 leading-relaxed">{p.summary}</p>

							<!-- החלטות מרכזיות -->
							<div class="rounded-xl border border-white/10 bg-[#0f1626] p-3 mb-3">
								<h3 class="mb-2 font-black text-amber-200 flex items-center gap-1.5 text-xs">
									<span>⚖️</span>
									<span>החלטות עיקריות שהתקבלו:</span>
								</h3>
								<ul class="space-y-1.5 text-xs leading-snug">
									{#each p.decisions as decision}
										<li class="flex items-start gap-2 text-gray-200">
											<span class="text-emerald-400 shrink-0 font-bold" aria-hidden="true">✔</span>
											<span>{decision}</span>
										</li>
									{/each}
								</ul>
							</div>

							{#if p.fullText}
								<div class="rounded-xl border border-white/5 bg-white/[0.02] p-3 mb-3 text-xs leading-relaxed text-gray-300">
									<h4 class="mb-1 font-bold text-gray-400 text-[11px]">תמליל / רקע נוסף:</h4>
									<p>{p.fullText}</p>
								</div>
							{/if}

							<!-- פעולות -->
							<div class="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
								<button
									type="button"
									onclick={() => window.print()}
									class="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-bold text-gray-300 hover:bg-white/5 cursor-pointer"
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
									class="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-200 hover:bg-amber-400/20 cursor-pointer"
								>
									📋 העתקת סיכום
								</button>
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
		<div class="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f1626] p-4 sm:p-5 shadow-2xl text-right" dir="rtl">
			<div class="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
				<h3 id="modal-title" class="text-base font-black text-white flex items-center gap-2">
					<span>📜</span>
					<span>הוספת פרוטוקול חדש</span>
				</h3>
				<button
					type="button"
					onclick={() => (showNewModal = false)}
					class="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer"
					aria-label="סגירה"
				>
					✕
				</button>
			</div>

			<form onsubmit={handleAddProtocol} class="space-y-3 text-xs">
				<div>
					<label for="p-title" class="block font-bold text-gray-200 mb-1">כותרת הפרוטוקול *</label>
					<input
						id="p-title"
						type="text"
						bind:value={newTitle}
						required
						placeholder="למשל: ישיבת הנהלה מס׳ 15 — ..."
						class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400/60 focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="p-cat" class="block font-bold text-gray-200 mb-1">קטגוריה</label>
						<select
							id="p-cat"
							bind:value={newCategory}
							class="w-full rounded-lg border border-white/15 bg-[#141c2f] px-3 py-2 text-white focus:border-amber-400/60 focus:outline-none"
						>
							<option value="הנהלה">הנהלה</option>
							<option value="תקציב">תקציב</option>
							<option value="פיתוח">פיתוח</option>
							<option value="קהילה">קהילה</option>
						</select>
					</div>

					<div>
						<label for="p-date" class="block font-bold text-gray-200 mb-1">תאריך</label>
						<input
							id="p-date"
							type="date"
							bind:value={newDate}
							class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white focus:border-amber-400/60 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="p-participants" class="block font-bold text-gray-200 mb-1">משתתפים (מופרדים בפסיקים)</label>
					<input
						id="p-participants"
						type="text"
						bind:value={newParticipants}
						placeholder="הנהלת הרשת, רכזי שטח, יוסי, דנה..."
						class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400/60 focus:outline-none"
					/>
				</div>

				<div>
					<label for="p-summary" class="block font-bold text-gray-200 mb-1">תקציר הישיבה</label>
					<textarea
						id="p-summary"
						rows="2"
						bind:value={newSummary}
						placeholder="תקציר תמציתי של הנושאים שעלו..."
						class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400/60 focus:outline-none"
					></textarea>
				</div>

				<div>
					<label for="p-decisions" class="block font-bold text-gray-200 mb-1">החלטות שהתקבלו (שורה לכל החלטה) *</label>
					<textarea
						id="p-decisions"
						rows="3"
						bind:value={newDecisions}
						required
						placeholder="החלטה 1&#10;החלטה 2..."
						class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-amber-400/60 focus:outline-none"
					></textarea>
				</div>

				<div class="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
					<button
						type="button"
						onclick={() => (showNewModal = false)}
						class="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-bold text-gray-300 hover:bg-white/5 cursor-pointer"
					>
						ביטול
					</button>
					<button
						type="submit"
						class="rounded-xl border border-amber-400/40 bg-amber-500/25 px-4 py-1.5 text-xs font-bold text-amber-200 transition hover:bg-amber-500/35 cursor-pointer shadow-sm"
					>
						שמירת פרוטוקול
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
