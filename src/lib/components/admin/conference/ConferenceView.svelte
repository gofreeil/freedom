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
	}

	interface Participant {
		id: string;
		name: string;
		role: string;
		avatar: string;
		isHost?: boolean;
		isSpeaking?: boolean;
		isMuted?: boolean;
		isVideoOff?: boolean;
		bgGradient: string;
	}

	const ROOM_STORAGE_KEY = 'freedom_conference_room_url';
	const UPCOMING_STORAGE_KEY = 'freedom_upcoming_conference';
	const PAST_STORAGE_KEY = 'freedom_past_conferences';

	const DEFAULT_ROOM_URL = 'https://meet.jit.si/freedom-il-council';

	let roomUrl = $state(DEFAULT_ROOM_URL);
	let isEditingRoom = $state(false);
	let tempRoomUrl = $state(DEFAULT_ROOM_URL);

	// מצבי שליטה במוקאפ הוידאו (כמו זום)
	let myMicOn = $state(true);
	let myCamOn = $state(true);
	let isScreenSharing = $state(false);
	let viewMode = $state<'grid' | 'speaker'>('grid');
	let isFullscreen = $state(false);
	let videoContainerEl = $state<HTMLDivElement | null>(null);

	const PARTICIPANTS: Participant[] = [
		{
			id: 'p1',
			name: user?.name || 'יהב אנטר',
			role: 'מארח הוועידה',
			avatar: '👑',
			isHost: true,
			isSpeaking: true,
			isMuted: false,
			bgGradient: 'from-blue-900/60 to-purple-950/80'
		},
		{
			id: 'p2',
			name: 'רכז מחוז ירושלים',
			role: 'רכז שטח',
			avatar: '🦁',
			isMuted: true,
			bgGradient: 'from-amber-950/60 to-slate-900/90'
		},
		{
			id: 'p3',
			name: 'חירות TV — חדר שידור',
			role: 'מדיה והפקה',
			avatar: '📺',
			isSpeaking: false,
			isMuted: false,
			bgGradient: 'from-red-950/60 to-zinc-900/90'
		},
		{
			id: 'p4',
			name: 'רכזת תל אביב והמרכז',
			role: 'רכזת קהילות',
			avatar: '🏙️',
			isMuted: true,
			bgGradient: 'from-emerald-950/60 to-teal-950/90'
		},
		{
			id: 'p5',
			name: 'רכז מחוז צפון',
			role: 'רכז שטח',
			avatar: '🌲',
			isMuted: true,
			bgGradient: 'from-cyan-950/60 to-sky-950/90'
		},
		{
			id: 'p6',
			name: 'צוות טכנולוגיה ורשת',
			role: 'פיתוח ומערכות',
			avatar: '💻',
			isMuted: true,
			isVideoOff: true,
			bgGradient: 'from-indigo-950/60 to-blue-950/90'
		}
	];

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

	function toggleFullscreen() {
		if (!videoContainerEl) return;
		if (!document.fullscreenElement) {
			videoContainerEl.requestFullscreen().catch(() => {});
			isFullscreen = true;
		} else {
			document.exitFullscreen().catch(() => {});
			isFullscreen = false;
		}
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
			<a
				href={roomUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-black text-white shadow-md transition hover:bg-teal-500 cursor-pointer"
			>
				<span>🚀 כניסה לחדר החיצוני</span>
			</a>
		</div>
	</div>

	<!-- ============================================================ -->
	<!-- מוקאפ ועידת וידאו די גדול (כמו זום)                           -->
	<!-- ============================================================ -->
	<div
		bind:this={videoContainerEl}
		class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-teal-500/30 bg-[#070b14] shadow-2xl transition-all"
		style="min-height: 440px;"
	>
		<!-- סרגל עליון של שיחת הוידאו (כמו זום / Meet) -->
		<div class="z-20 flex items-center justify-between border-b border-white/10 bg-[#0a0f1d]/90 px-3 sm:px-4 py-2 backdrop-blur-md">
			<div class="flex items-center gap-2 sm:gap-3 text-xs">
				<span class="inline-flex items-center gap-1.5 rounded-md bg-red-500/20 px-2 py-0.5 font-bold text-red-300 ring-1 ring-red-500/30">
					<span class="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
					REC
				</span>
				<span class="hidden sm:inline-flex items-center gap-1 text-gray-300 font-semibold">
					🔒 <span class="text-[11px] text-gray-400">מוצפן מקצה לקצה</span>
				</span>
				<span class="text-[11px] text-gray-400 tabular-nums">00:32:14</span>
			</div>

			<div class="flex items-center gap-1.5">
				<span class="text-xs sm:text-sm font-black text-white truncate max-w-[180px] sm:max-w-none">
					{upcoming.title}
				</span>
			</div>

			<div class="flex items-center gap-1 sm:gap-2">
				<button
					type="button"
					onclick={() => (viewMode = viewMode === 'grid' ? 'speaker' : 'grid')}
					class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
					title="החלפת פריסת תצוגה"
				>
					{viewMode === 'grid' ? '🔲 תצוגת דובר' : '▦ תצוגת רשת'}
				</button>
				<button
					type="button"
					onclick={toggleFullscreen}
					class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
					title="מסך מלא"
				>
					{isFullscreen ? '⛶ צא' : '⛶ מלא'}
				</button>
			</div>
		</div>

		<!-- אזור המשתתפים בוידאו (רשת משבצות וידאו) -->
		<div class="relative z-10 flex-1 p-2 sm:p-3">
			{#if viewMode === 'grid'}
				<div class="grid h-full w-full grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
					{#each PARTICIPANTS as p, idx}
						<div
							class="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br {p.bgGradient} p-3 shadow-md transition-all {p.isSpeaking
								? 'border-emerald-400/80 ring-2 ring-emerald-400/30'
								: 'border-white/10 hover:border-white/20'}"
							style="min-height: 155px;"
						>
							<!-- אינדיקטור דובר פעיל -->
							{#if p.isSpeaking}
								<div class="absolute top-2 start-2 flex items-center gap-1 rounded-md bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/40">
									<span class="inline-flex gap-0.5 items-end h-2.5">
										<span class="w-0.5 bg-emerald-400 h-2 animate-pulse"></span>
										<span class="w-0.5 bg-emerald-400 h-3 animate-pulse"></span>
										<span class="w-0.5 bg-emerald-400 h-1.5 animate-pulse"></span>
									</span>
									<span>מדבר/ת</span>
								</div>
							{/if}

							<!-- סימון מארח -->
							{#if p.isHost}
								<div class="absolute top-2 end-2 rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-200 border border-purple-400/30">
									מארח
								</div>
							{/if}

							<!-- אוואטר מרכזי -->
							<div class="relative mb-2 flex items-center justify-center">
								<div class="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/10 text-2xl sm:text-3xl shadow-inner border border-white/20">
									{p.avatar}
								</div>
								{#if p.isSpeaking}
									<span class="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping" style="animation-duration: 2s;"></span>
								{/if}
							</div>

							<!-- שם ופרטי משתתף תחתונים -->
							<div class="absolute bottom-2 inset-x-2 flex items-center justify-between rounded-lg bg-black/60 px-2 py-1 text-[11px] backdrop-blur-sm">
								<div class="flex items-center gap-1.5 truncate">
									<span class="font-bold text-white truncate">{p.name}</span>
									<span class="text-[10px] text-gray-400 hidden sm:inline">({p.role})</span>
								</div>

								<div class="flex items-center gap-1 shrink-0">
									{#if p.isMuted}
										<span class="text-red-400" title="מושתק">🔇</span>
									{:else}
										<span class="text-emerald-400" title="מיקרופון פעיל">🎙️</span>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- תצוגת דובר מרכזי (Speaker View) -->
				<div class="flex h-full flex-col gap-2">
					<!-- חלון הדובר המרכזי -->
					<div class="relative flex-1 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-emerald-400/80 ring-2 ring-emerald-400/30 bg-gradient-to-br from-blue-950/80 via-[#0d1424] to-purple-950/80 p-6 shadow-xl" style="min-height: 250px;">
						<div class="absolute top-3 start-3 flex items-center gap-1.5 rounded-md bg-emerald-950/80 px-2 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40">
							<span class="inline-flex gap-0.5 items-end h-3">
								<span class="w-0.5 bg-emerald-400 h-2.5 animate-pulse"></span>
								<span class="w-0.5 bg-emerald-400 h-4 animate-pulse"></span>
								<span class="w-0.5 bg-emerald-400 h-2 animate-pulse"></span>
							</span>
							<span>דובר פעיל: {PARTICIPANTS[0].name}</span>
						</div>

						<div class="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-5xl shadow-2xl border-2 border-emerald-400/50">
							{PARTICIPANTS[0].avatar}
							<span class="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping" style="animation-duration: 2.5s;"></span>
						</div>
						<p class="mt-3 text-base font-black text-white">{PARTICIPANTS[0].name}</p>
						<p class="text-xs text-gray-300">{PARTICIPANTS[0].role}</p>

						<div class="absolute bottom-3 end-3 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-emerald-400 font-bold">
							🎙️ פעיל
						</div>
					</div>

					<!-- פס משתתפים קטן למטה -->
					<div class="flex items-center gap-2 overflow-x-auto pb-1">
						{#each PARTICIPANTS.slice(1) as p}
							<div class="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 shrink-0 text-xs">
								<span>{p.avatar}</span>
								<span class="font-bold text-gray-200">{p.name}</span>
								<span>{p.isMuted ? '🔇' : '🎙️'}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- באנר מוקאפ שקוף ועדין -->
			<div class="pointer-events-none absolute bottom-4 start-1/2 -translate-x-1/2 z-20">
				<span class="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-[#0f1626]/90 px-3 py-1 text-[11px] font-bold text-teal-200 shadow-xl backdrop-blur-md">
					<span>🎭</span>
					<span>מוקאפ ועידת וידאו (הדמיית זום) — חדר הוועידה החי יוטמע כאן</span>
				</span>
			</div>
		</div>

		<!-- ============================================================ -->
		<!-- סרגל כלים תחתון (בדיוק כמו בזום / Google Meet)                -->
		<!-- ============================================================ -->
		<div class="z-20 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0a0f1d]/95 px-3 sm:px-6 py-2.5 backdrop-blur-md">
			<!-- כפתורי שמע ומצלמה אישיים -->
			<div class="flex items-center gap-1.5 sm:gap-2">
				<button
					type="button"
					onclick={() => (myMicOn = !myMicOn)}
					class="flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-xs transition cursor-pointer {myMicOn
						? 'text-gray-200 hover:bg-white/10'
						: 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'}"
					title={myMicOn ? 'השתקת מיקרופון' : 'הפעלת מיקרופון'}
				>
					<span class="text-base">{myMicOn ? '🎙️' : '🔇'}</span>
					<span class="text-[10px] font-bold">{myMicOn ? 'השתק' : 'מושתק'}</span>
				</button>

				<button
					type="button"
					onclick={() => (myCamOn = !myCamOn)}
					class="flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-xs transition cursor-pointer {myCamOn
						? 'text-gray-200 hover:bg-white/10'
						: 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'}"
					title={myCamOn ? 'כיבוי מצלמה' : 'הפעלת מצלמה'}
				>
					<span class="text-base">{myCamOn ? '📹' : '🚫'}</span>
					<span class="text-[10px] font-bold">{myCamOn ? 'מצלמה' : 'ללא וידאו'}</span>
				</button>
			</div>

			<!-- כפתורי ניהול שיחה מרכזיים (כמו זום) -->
			<div class="flex items-center gap-1 sm:gap-2">
				<button
					type="button"
					class="flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-xs text-gray-300 hover:bg-white/10 transition cursor-pointer"
					title="אבטחת חדר"
				>
					<span class="text-base">🛡️</span>
					<span class="text-[10px] font-semibold">אבטחה</span>
				</button>

				<button
					type="button"
					class="flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-xs text-gray-300 hover:bg-white/10 transition cursor-pointer"
					title="רשימת משתתפים"
				>
					<span class="relative text-base">
						👥
						<span class="absolute -top-1 -end-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-white">6</span>
					</span>
					<span class="text-[10px] font-semibold">משתתפים</span>
				</button>

				<button
					type="button"
					class="flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-xs text-gray-300 hover:bg-white/10 transition cursor-pointer"
					title="צ'אט הוועידה"
				>
					<span class="text-base">💬</span>
					<span class="text-[10px] font-semibold">צ'אט</span>
				</button>

				<!-- שיתוף מסך ירוק בולט כמו בזום -->
				<button
					type="button"
					onclick={() => (isScreenSharing = !isScreenSharing)}
					class="flex flex-col items-center justify-center rounded-xl px-3 py-1 text-xs transition cursor-pointer {isScreenSharing
						? 'bg-emerald-500 text-white shadow-md'
						: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 ring-1 ring-emerald-500/40'}"
					title="שיתוף מסך"
				>
					<span class="text-base">↗️</span>
					<span class="text-[10px] font-bold">{isScreenSharing ? 'משתף מסך' : 'שתף מסך'}</span>
				</button>

				<button
					type="button"
					class="hidden sm:flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-xs text-gray-300 hover:bg-white/10 transition cursor-pointer"
					title="הקלטת הוועידה"
				>
					<span class="text-base">🔴</span>
					<span class="text-[10px] font-semibold">הקלטה</span>
				</button>

				<button
					type="button"
					class="hidden sm:flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-xs text-gray-300 hover:bg-white/10 transition cursor-pointer"
					title="תגובות / הרמת יד"
				>
					<span class="text-base">✋</span>
					<span class="text-[10px] font-semibold">הרמת יד</span>
				</button>
			</div>

			<!-- כפתור סיום שיחה אדום -->
			<div class="flex items-center gap-1.5">
				<a
					href={roomUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-xl bg-red-600 px-3 sm:px-4 py-1.5 text-xs font-black text-white shadow transition hover:bg-red-500 cursor-pointer"
					title="פתיחת הוועידה בקישור החי"
				>
					פתח חדר חי ↗
				</a>
			</div>
		</div>
	</div>

	<!-- שורת הגדרות וקישור חדר ועידה -->
	<div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0f1626]/70 px-4 py-2.5 text-xs">
		<div class="flex items-center gap-2 text-gray-300">
			<span class="font-bold text-teal-300">קישור החדר המוגדר:</span>
			<code class="rounded bg-black/40 px-2 py-0.5 text-gray-200 dir-ltr text-[11px] truncate max-w-[260px] sm:max-w-md">
				{roomUrl}
			</code>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => (isEditingRoom = !isEditingRoom)}
				class="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 font-bold text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
			>
				⚙️ {isEditingRoom ? 'סגור עריכה' : 'החלפת קישור החדר'}
			</button>
		</div>
	</div>

	<!-- עורך קישור חדר ועידה -->
	{#if isEditingRoom}
		<div class="rounded-xl border border-teal-500/30 bg-[#0f1626] p-3 text-xs shadow-md">
			<div class="flex flex-wrap items-center gap-2">
				<label for="conf-room-input" class="font-bold text-gray-200">הזינו קישור לחדר הוועידה (Google Meet / Jitsi / Zoom):</label>
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
		</div>
	{/if}

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
