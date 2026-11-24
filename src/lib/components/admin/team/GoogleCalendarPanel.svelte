<script lang="ts">
	// ============================================================
	// GoogleCalendarPanel — ניהול תזכורות ואירועים ביומן גוגל ישירות מתוך הפאנל.
	// כולל הטמעת יומן Google Calendar, יצירת תזכורות מהירה וסנכרון משימות עם יעד.
	// ============================================================
	import { onMount } from 'svelte';
	import type { TeamStore } from './teamStore.svelte';
	import { isOverdue, todayStr, type BoardTask } from '$lib/teamBoard';
	import { getSite } from '$lib/sitesData';

	let {
		store,
		onopentask
	}: {
		store: TeamStore;
		onopentask: (id: string) => void;
	} = $props();

	const today = todayStr();

	// כתובת יומן גוגל להטמעה (ברירת מחדל: המייל של המשתמש המחובר)
	let calendarEmail = $state('');
	let isEditingEmail = $state(false);
	let tempEmail = $state('');

	onMount(() => {
		try {
			const saved = localStorage.getItem('teamboard:calendar_email');
			if (saved) {
				calendarEmail = saved;
			} else if (store.me?.id && store.me.id.includes('@')) {
				calendarEmail = store.me.id;
			}
		} catch {}
	});

	$effect(() => {
		if (!calendarEmail && store.me?.id && store.me.id.includes('@')) {
			calendarEmail = store.me.id;
		}
	});

	function saveEmail() {
		calendarEmail = tempEmail.trim() || store.me?.id || '';
		isEditingEmail = false;
		try {
			localStorage.setItem('teamboard:calendar_email', calendarEmail);
		} catch {}
	}

	// ── טופס תזכורת מהירה ──
	let remTitle = $state('');
	let remDate = $state(today);
	let remTime = $state('10:00');
	let remDetails = $state('');

	function openCustomReminder(e: SubmitEvent) {
		e.preventDefault();
		const t = remTitle.trim();
		if (!t) return;
		const cleanDate = (remDate || today).replace(/-/g, '');
		const cleanTime = (remTime || '10:00').replace(':', '') + '00';
		const start = `${cleanDate}T${cleanTime}`;
		// ברירת מחדל: חצי שעה
		const endHour = String(Number(remTime.split(':')[0]) + 1).padStart(2, '0');
		const end = `${cleanDate}T${endHour}${remTime.split(':')[1] || '00'}00`;

		const text = encodeURIComponent(t);
		const details = encodeURIComponent(remDetails.trim());
		const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${start}/${end}`;
		window.open(url, '_blank', 'noopener,noreferrer');
		remTitle = '';
		remDetails = '';
	}

	function makeTaskCalUrl(task: BoardTask): string {
		const text = encodeURIComponent(`משימה: ${task.title}`);
		const site = task.siteId ? getSite(task.siteId)?.name : '';
		const origin = typeof location !== 'undefined' ? location.origin : '';
		const details = encodeURIComponent(
			[
				site ? `אתר: ${site}` : '',
				task.description ? `תיאור: ${task.description}` : '',
				`קישור למשימה:\n${origin}/admin?task=${task.id}`
			]
				.filter(Boolean)
				.join('\n\n')
		);
		let dates = '';
		if (task.due) {
			const d = task.due.replace(/-/g, '');
			dates = `&dates=${d}/${d}`;
		}
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}${dates}`;
	}

	// משימות של המשתמש שיש להן תאריך יעד וטרם הושלמו
	const myTasksWithDue = $derived(
		store.board.tasks.filter((t) => {
			if (t.status === 'done') return false;
			const isMine = t.assignees.includes(store.me?.id ?? '') || t.createdBy === store.me?.id;
			return isMine && !!t.due;
		})
	);

	const embedUrl = $derived(
		calendarEmail
			? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarEmail)}&ctz=Asia%2FJerusalem&hl=iw`
			: 'https://calendar.google.com/calendar/embed?ctz=Asia%2FJerusalem&hl=iw'
	);
</script>

<div class="space-y-6">
	<!-- ── שורת כותרת ופעולות ── -->
	<div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#141c2f] p-4">
		<div>
			<h2 class="flex items-center gap-2 text-lg font-black text-white">
				<span aria-hidden="true">📅</span> יומן גוגל ותזכורות
			</h2>
			<p class="mt-0.5 text-xs text-gray-400">
				סנכרון משימות, תזכורות ופגישות ישירות מול חשבון ה-Google Calendar שלך
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<!-- הגדרת חשבון יומן -->
			{#if isEditingEmail}
				<div class="flex items-center gap-1">
					<input
						type="email"
						bind:value={tempEmail}
						placeholder="כתובת Gmail / יומן"
						class="rounded-xl border border-white/20 bg-[#0b1220] px-2.5 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
					/>
					<button
						type="button"
						onclick={saveEmail}
						class="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 cursor-pointer"
					>
						שמור
					</button>
					<button
						type="button"
						onclick={() => (isEditingEmail = false)}
						class="rounded-xl border border-white/10 px-2 py-1.5 text-xs text-gray-400 hover:bg-white/5 cursor-pointer"
					>
						ביטול
					</button>
				</div>
			{:else}
				<button
					type="button"
					onclick={() => {
						tempEmail = calendarEmail;
						isEditingEmail = true;
					}}
					class="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#1b2335] px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-[#252f44] cursor-pointer"
					title="החלפת חשבון יומן Google"
				>
					<span>👤 יומן: <strong class="text-white">{calendarEmail || 'ברירת מחדל בדפדפן'}</strong></span>
					<span class="text-gray-400">✎</span>
				</button>
			{/if}

			<!-- פתיחה חיצונית -->
			<a
				href="https://calendar.google.com/"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-black text-white transition hover:opacity-95 shadow-sm"
			>
				<span>Google Calendar המלא</span>
				<span aria-hidden="true">↗</span>
			</a>
		</div>
	</div>

	<!-- ── שתי עמודות: הוספת תזכורת + משימות מסונכרנות ── -->
	<div class="grid gap-4 lg:grid-cols-2">
		<!-- כרטיס יצירת תזכורת מהירה ליומן -->
		<form
			onsubmit={openCustomReminder}
			class="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#161e30] p-4 shadow-sm"
		>
			<div>
				<h3 class="flex items-center gap-1.5 text-sm font-bold text-white">
					<span>➕</span> הוספת תזכורת חדשה ליומן גוגל
				</h3>
				<p class="mt-0.5 text-xs text-gray-400">
					יוצר אירוע / תזכורת חדשה ביומן גוגל בלחיצה אחת
				</p>

				<div class="mt-3 space-y-2.5">
					<div>
						<label for="cal-title" class="sr-only">כותרת התזכורת</label>
						<input
							id="cal-title"
							bind:value={remTitle}
							required
							placeholder="מה התזכורת? (לדוגמה: לבדוק הצעת מחיר / שיחה עם רכז)"
							class="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
						/>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div>
							<label for="cal-date" class="block text-[11px] font-semibold text-gray-400 mb-0.5">תאריך</label>
							<input
								id="cal-date"
								type="date"
								bind:value={remDate}
								class="w-full rounded-xl border border-white/10 bg-[#0b1220] px-2.5 py-1.5 text-xs text-white [color-scheme:dark] focus:border-purple-500 focus:outline-none"
							/>
						</div>
						<div>
							<label for="cal-time" class="block text-[11px] font-semibold text-gray-400 mb-0.5">שעה</label>
							<input
								id="cal-time"
								type="time"
								bind:value={remTime}
								class="w-full rounded-xl border border-white/10 bg-[#0b1220] px-2.5 py-1.5 text-xs text-white [color-scheme:dark] focus:border-purple-500 focus:outline-none"
							/>
						</div>
					</div>

					<div>
						<label for="cal-details" class="sr-only">פרטים נוספים</label>
						<input
							id="cal-details"
							bind:value={remDetails}
							placeholder="פרטים נוספים / הערה (אופציונלי)"
							class="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
						/>
					</div>
				</div>
			</div>

			<button
				type="submit"
				disabled={!remTitle.trim()}
				class="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-purple-500 disabled:opacity-40 cursor-pointer"
			>
				<span>📅</span>
				<span>שמור תזכורת ביומן גוגל</span>
			</button>
		</form>

		<!-- כרטיס סנכרון משימות מהלוח ליומן -->
		<div class="flex flex-col rounded-2xl border border-white/10 bg-[#161e30] p-4 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="flex items-center gap-1.5 text-sm font-bold text-white">
						<span>📋</span> משימות שלך עם תאריך יעד
					</h3>
					<p class="mt-0.5 text-xs text-gray-400">
						העברת משימות פתוחות מהלוח ישירות ליומן גוגל
					</p>
				</div>
				<span class="rounded-full bg-sky-500/20 px-2 py-0.5 text-[11px] font-bold text-sky-300">
					{myTasksWithDue.length} משימות
				</span>
			</div>

			<div class="mt-3 flex-1 space-y-2 overflow-y-auto max-h-[190px]">
				{#if myTasksWithDue.length === 0}
					<div class="flex h-full min-h-[120px] flex-col items-center justify-center text-center text-xs text-gray-500">
						<span class="text-2xl mb-1">🎉</span>
						<p>אין כרגע משימות פתוחות שלך עם תאריך יעד</p>
						<p class="text-[11px] text-gray-600">כשתוסיף תאריך יעד למשימה, היא תופיע כאן לסנכרון מהיר</p>
					</div>
				{:else}
					{#each myTasksWithDue as t (t.id)}
						{@const overdue = isOverdue(t, today)}
						<div class="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#0f172a] p-2 hover:border-white/15 transition">
							<button
								type="button"
								onclick={() => onopentask(t.id)}
								class="min-w-0 flex-1 text-start cursor-pointer group"
							>
								<p class="truncate text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
									{t.title}
								</p>
								<p class="text-[11px] {overdue ? 'text-red-300 font-semibold' : 'text-gray-400'}">
									יעד: {t.due} {overdue ? '(באיחור!)' : ''}
								</p>
							</button>

							<a
								href={makeTaskCalUrl(t)}
								target="_blank"
								rel="noopener noreferrer"
								class="flex-shrink-0 flex items-center gap-1 rounded-lg border border-purple-500/35 bg-purple-500/15 px-2.5 py-1 text-[11px] font-bold text-purple-200 hover:bg-purple-500/25 transition cursor-pointer"
								title="הוספת משימה זו ליומן גוגל"
							>
								<span>📅 ליומן</span>
							</a>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- ── היומן המוטמע (Embedded Google Calendar) ── -->
	<div class="overflow-hidden rounded-2xl border border-white/10 bg-[#161e30] shadow-xl">
		<div class="flex items-center justify-between border-b border-white/10 bg-[#141c2f] px-4 py-2.5">
			<span class="flex items-center gap-2 text-xs font-bold text-gray-200">
				<span>🗓️</span> תצוגת יומן גוגל אינטראקטיבית
			</span>
			<span class="text-[11px] text-gray-400">
				מציג את חשבון Google המחובר בדפדפן שלך
			</span>
		</div>

		<div class="relative w-full overflow-hidden bg-slate-900" style="min-height: 650px;">
			<iframe
				src={embedUrl}
				title="Google Calendar"
				class="h-[650px] w-full border-0"
				style="color-scheme: light;"
				loading="lazy"
			></iframe>
		</div>
	</div>
</div>
