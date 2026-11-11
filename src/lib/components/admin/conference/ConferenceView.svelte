<script lang="ts">
	// ConferenceView.svelte — רכיב ועידת הנהלה ורכזים באזור האישי של אדמינים
	import { onMount } from 'svelte';

	interface Props {
		user?: {
			name?: string;
			email?: string;
			canManage?: boolean;
		};
	}

	let { user }: Props = $props();

	interface UpcomingConference {
		title: string;
		date: string;
		time: string;
		agenda: string[];
		host: string;
	}

	interface PastConference {
		id: string;
		title: string;
		date: string;
		summary: string;
		protocolId?: string;
		recordingUrl?: string;
	}

	const ROOM_STORAGE_KEY = 'freedom_conference_room_url';
	const UPCOMING_STORAGE_KEY = 'freedom_upcoming_conference';
	const PAST_STORAGE_KEY = 'freedom_past_conferences';

	const DEFAULT_ROOM_URL = 'https://meet.jit.si/freedom-il-council';

	let roomUrl = $state(DEFAULT_ROOM_URL);
	let isEditingRoom = $state(false);
	let tempRoomUrl = $state(DEFAULT_ROOM_URL);

	let upcoming = $state<UpcomingConference>({
		title: 'ועידת הנהלה ורכזי רשת — סנכרון חודשי',
		date: '2026-11-18',
		time: '20:30',
		agenda: [
			'סטטוס גיוס מתנדבים לחירות TV',
			'חלוקת תקציב רבעונית והצבעות חברים',
			'הרחבת פריסת רכזי שכונות ואישור פרוטוקולים'
		],
		host: 'הנהלת הרשת'
	});

	let isEditingUpcoming = $state(false);
	let editTitle = $state('');
	let editDate = $state('');
	let editTime = $state('');
	let editAgenda = $state('');
	let editHost = $state('');

	let pastConferences = $state<PastConference[]>([
		{
			id: 'conf-1',
			title: 'ועידת פיתוח ואזור אישי',
			date: '2026-11-10',
			summary: 'הטמעת לשוניות חדשות, טבלת משימות מותאמת והעלאת גרסה לשרת.',
			protocolId: 'p-12'
		},
		{
			id: 'conf-2',
			title: 'ועידת כספים ותקציב קהילתי',
			date: '2026-11-03',
			summary: 'סקירת תזרים דמי חבר במועדון, הצגת תרשים זרימת הכספים.',
			protocolId: 'p-13'
		}
	]);

	let copied = $state(false);

	onMount(() => {
		try {
			const savedRoom = localStorage.getItem(ROOM_STORAGE_KEY);
			if (savedRoom) {
				roomUrl = savedRoom;
				tempRoomUrl = savedRoom;
			}
			const savedUpcoming = localStorage.getItem(UPCOMING_STORAGE_KEY);
			if (savedUpcoming) {
				upcoming = JSON.parse(savedUpcoming);
			}
			const savedPast = localStorage.getItem(PAST_STORAGE_KEY);
			if (savedPast) {
				pastConferences = JSON.parse(savedPast);
			}
		} catch {}
	});

	function saveRoomUrl() {
		const clean = tempRoomUrl.trim() || DEFAULT_ROOM_URL;
		roomUrl = clean;
		tempRoomUrl = clean;
		isEditingRoom = false;
		try {
			localStorage.setItem(ROOM_STORAGE_KEY, clean);
		} catch {}
	}

	function openEditUpcoming() {
		editTitle = upcoming.title;
		editDate = upcoming.date;
		editTime = upcoming.time;
		editAgenda = upcoming.agenda.join('\n');
		editHost = upcoming.host;
		isEditingUpcoming = true;
	}

	function saveUpcoming() {
		upcoming = {
			title: editTitle.trim() || 'ועידת הנהלה ורכזים',
			date: editDate || new Date().toISOString().slice(0, 10),
			time: editTime || '20:00',
			agenda: editAgenda.split('\n').map((s) => s.trim()).filter(Boolean),
			host: editHost.trim() || 'הנהלת הרשת'
		};
		isEditingUpcoming = false;
		try {
			localStorage.setItem(UPCOMING_STORAGE_KEY, JSON.stringify(upcoming));
		} catch {}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(roomUrl);
			copied = true;
			setTimeout(() => (copied = false), 2200);
		} catch {
			prompt('העתיקו את קישור הוועידה:', roomUrl);
		}
	}

	function shareWhatsapp() {
		const text = `שלום לכולם, מוזמנים לוועידת הרשת: ${upcoming.title}\nמועד: ${upcoming.date} בשעה ${upcoming.time}\nקישור כניסה:\n${roomUrl}`;
		const href = `https://wa.me/?text=${encodeURIComponent(text)}`;
		window.open(href, '_blank', 'noopener,noreferrer');
	}
</script>

<div class="space-y-4" dir="rtl">
	<!-- Hero קומפקטי -->
	<div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
		<div class="flex items-center gap-2.5">
			<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-lg text-teal-300 ring-1 ring-teal-500/30" aria-hidden="true">
				🎙️
			</span>
			<div>
				<h2 class="text-base sm:text-lg font-black text-white leading-tight">ועידת הנהלה ורכזים</h2>
				<p class="text-xs text-gray-400">חדר מפגש וירטואלי, תיאום ישיבות וסדר יום לאדמינים</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={copyLink}
				class="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-gray-200 transition hover:bg-white/10 hover:text-white cursor-pointer"
				title="העתקת קישור לחדר הוועידה"
			>
				<span>{copied ? '✓ הועתק' : '🔗 העתקת קישור'}</span>
			</button>
			<button
				type="button"
				onclick={shareWhatsapp}
				class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-900/40 cursor-pointer"
				title="שיתוף הזמנה לוועידה בוואטסאפ"
			>
				<span>💬 שיתוף בוואטסאפ</span>
			</button>
		</div>
	</div>

	<!-- כרטיס חדר הוועידה הפעיל (בולט וקומפקטי) -->
	<div class="overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-950/40 via-[#0f1626] to-indigo-950/40 p-4 shadow-lg">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div class="space-y-1">
				<div class="flex items-center gap-2">
					<span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-500/30">
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
						חדר מוכן לפעולה
					</span>
					<span class="text-xs text-gray-400">פגישות וידאו ואודיו מאובטחות</span>
				</div>
				<h3 class="text-base sm:text-lg font-black text-white">{upcoming.title}</h3>
				<p class="text-xs text-gray-300">
					מועד מתוכנן: <span class="font-bold text-teal-300">{upcoming.date}</span> בשעה <span class="font-bold text-teal-300">{upcoming.time}</span> | מארח: {upcoming.host}
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<a
					href={roomUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:from-teal-400 hover:to-emerald-500 hover:shadow-teal-500/20 cursor-pointer"
				>
					<span>🚀</span>
					<span>כניסה לחדר הוועידה</span>
				</a>

				<button
					type="button"
					onclick={() => (isEditingRoom = !isEditingRoom)}
					class="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-gray-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
					title="החלפת כתובת חדר הוועידה (Meet / Zoom / Jitsi)"
				>
					⚙️ עריכת קישור
				</button>
			</div>
		</div>

		<!-- עורך קישור חדר ועידה -->
		{#if isEditingRoom}
			<div class="mt-3.5 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
				<label for="conf-room-input" class="font-bold text-gray-300">כתובת חדר הוועידה (Google Meet / Jitsi / Zoom):</label>
				<input
					id="conf-room-input"
					type="url"
					dir="ltr"
					bind:value={tempRoomUrl}
					placeholder="https://meet.jit.si/... או https://meet.google.com/..."
					class="flex-1 min-w-[220px] rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-teal-400 focus:outline-none"
				/>
				<button
					type="button"
					onclick={saveRoomUrl}
					class="rounded-lg bg-teal-500/30 border border-teal-400/40 px-3 py-1.5 font-bold text-teal-200 hover:bg-teal-500/40 cursor-pointer"
				>
					שמור קישור
				</button>
				<button
					type="button"
					onclick={() => (isEditingRoom = false)}
					class="rounded-lg border border-white/15 px-2.5 py-1.5 font-bold text-gray-400 hover:text-gray-200 cursor-pointer"
				>
					ביטול
				</button>
			</div>
		{/if}
	</div>

	<!-- חלוקה ל-2 עמודות קומפקטיות: סדר יום + היסטוריה -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
		<!-- סדר יום לוועידה הקרובה -->
		<div class="rounded-xl border border-white/10 bg-[#0f1626]/80 p-3.5 flex flex-col justify-between">
			<div>
				<div class="mb-2.5 flex items-center justify-between">
					<h4 class="text-sm font-black text-amber-200 flex items-center gap-1.5">
						<span>📋</span> סדר יום ונושאים לדיון
					</h4>
					<button
						type="button"
						onclick={openEditUpcoming}
						class="rounded-lg border border-white/10 px-2 py-0.5 text-[11px] font-bold text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
					>
						✏️ עריכה
					</button>
				</div>

				<ul class="space-y-1.5 text-xs text-gray-200">
					{#each upcoming.agenda as item, i}
						<li class="flex items-start gap-2 bg-white/[0.02] rounded-lg p-1.5 border border-white/5">
							<span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-300">
								{i + 1}
							</span>
							<span class="leading-snug">{item}</span>
						</li>
					{/each}
				</ul>
			</div>

			<div class="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
				<span>תיאום: {upcoming.host}</span>
				<a href="/protocols" class="text-amber-300 hover:underline">מעבר לפרוטוקולים 📜</a>
			</div>
		</div>

		<!-- ועידות קודמות וסיכומים -->
		<div class="rounded-xl border border-white/10 bg-[#0f1626]/80 p-3.5 flex flex-col justify-between">
			<div>
				<div class="mb-2.5 flex items-center justify-between">
					<h4 class="text-sm font-black text-purple-200 flex items-center gap-1.5">
						<span>🏛️</span> ועידות קודמות
					</h4>
					<span class="text-[11px] text-gray-400">{pastConferences.length} מפגשים מתועדים</span>
				</div>

				<div class="space-y-2">
					{#each pastConferences as past}
						<div class="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-xs">
							<div class="flex items-center justify-between gap-1 mb-1">
								<span class="font-bold text-white truncate">{past.title}</span>
								<span class="text-[10px] text-gray-400 tabular-nums shrink-0">{past.date}</span>
							</div>
							<p class="text-[11px] text-gray-300 leading-snug line-clamp-2">{past.summary}</p>
						</div>
					{/each}
				</div>
			</div>

			<div class="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
				<span class="text-gray-400">מתועד בארכיון</span>
				<a href="/admin/tv" class="text-purple-300 hover:underline">חירות TV 📺</a>
			</div>
		</div>
	</div>

	<!-- מודל עריכת ועידה קרובה -->
	{#if isEditingUpcoming}
		<div class="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-3" role="dialog" aria-modal="true">
			<div class="w-full max-w-md rounded-2xl border border-teal-500/30 bg-[#0f1626] p-4 sm:p-5 shadow-2xl text-right">
				<h3 class="text-base font-black text-white mb-3">עריכת פרטי הוועידה הקרובה</h3>

				<div class="space-y-2.5 text-xs">
					<div>
						<label for="conf-title" class="block font-bold text-gray-300 mb-1">נושא הוועידה</label>
						<input
							id="conf-title"
							type="text"
							bind:value={editTitle}
							class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
						/>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div>
							<label for="conf-date" class="block font-bold text-gray-300 mb-1">תאריך</label>
							<input
								id="conf-date"
								type="date"
								bind:value={editDate}
								class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
							/>
						</div>
						<div>
							<label for="conf-time" class="block font-bold text-gray-300 mb-1">שעה</label>
							<input
								id="conf-time"
								type="time"
								bind:value={editTime}
								class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
							/>
						</div>
					</div>

					<div>
						<label for="conf-agenda" class="block font-bold text-gray-300 mb-1">סדר יום (שורה לכל נושא)</label>
						<textarea
							id="conf-agenda"
							rows="3"
							bind:value={editAgenda}
							class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
						></textarea>
					</div>

					<div>
						<label for="conf-host" class="block font-bold text-gray-300 mb-1">מארח / גורם מתאם</label>
						<input
							id="conf-host"
							type="text"
							bind:value={editHost}
							class="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
						/>
					</div>
				</div>

				<div class="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
					<button
						type="button"
						onclick={() => (isEditingUpcoming = false)}
						class="rounded-lg border border-white/15 px-3 py-1 text-xs font-bold text-gray-300 hover:bg-white/5 cursor-pointer"
					>
						ביטול
					</button>
					<button
						type="button"
						onclick={saveUpcoming}
						class="rounded-lg bg-teal-500/30 border border-teal-400/40 px-3.5 py-1 text-xs font-bold text-teal-200 hover:bg-teal-500/40 cursor-pointer"
					>
						שמור שינויים
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
