<script lang="ts">
	// /admin/tv/youtube — מדריך חיבור ערוץ יוטיוב לשידור חי משותף של חירות TV
	import { onMount } from 'svelte';
	import { DEFAULT_COLUMNS, LIMITS, newId, type SheetColumn } from '$lib/teamBoard';

	let { data } = $props();

	let copiedKeyName = $state(false);
	let copiedTitle = $state(false);

	// שדות הדבקה למשתמש — נשתלים אוטומטית בטבלת חירות TV (ללא מפתח השידור הסודי)
	let channelLink = $state('');
	let channelName = $state('');

	let columns = $state<SheetColumn[]>(DEFAULT_COLUMNS);
	let savedRowId = $state('');
	let saving = $state(false);
	let saveMsg = $state('');
	let saveError = $state('');

	const STORAGE_KEY = 'tv_yt_guide_v1';
	const STREAM_KEY_NAME = 'חירותTV';
	const STREAM_TITLE = 'חירותTV - שידור חי';

	onMount(async () => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as Record<string, unknown>;
				if (typeof parsed.channelLink === 'string') channelLink = parsed.channelLink;
				if (typeof parsed.channelName === 'string') channelName = parsed.channelName;
				if (typeof parsed.savedRowId === 'string') savedRowId = parsed.savedRowId;
			}
		} catch {
			// ignore storage error
		}

		try {
			const res = await fetch('/api/tv-guest', { cache: 'no-store' });
			if (res.ok) {
				const json = (await res.json()) as { columns?: SheetColumn[] };
				if (Array.isArray(json.columns) && json.columns.length) {
					columns = json.columns;
				}
			}
		} catch {
			// fallback to DEFAULT_COLUMNS
		}
	});

	function persistLocal() {
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ channelLink, channelName, savedRowId })
			);
		} catch {
			// ignore
		}
	}

	function buildCells(): Record<string, string> {
		const nameCol = columns.find((c) => c.id === 'col-name' || c.label.includes('שם')) ?? columns[0];
		const ytCol = columns.find((c) => c.id === 'col-youtube' || c.label.includes('יוטיוב'));
		const notesCol = columns.find((c) => c.id === 'col-notes' || c.label.includes('הערות'));

		const cells: Record<string, string> = {};
		const nameVal = (data.userName || '').trim();
		if (nameCol && nameVal) cells[nameCol.id] = nameVal.slice(0, LIMITS.cell);

		const ytVal = (channelLink.trim() || channelName.trim()).slice(0, LIMITS.cell);
		if (ytCol && ytVal) cells[ytCol.id] = ytVal;

		const parts: string[] = [];
		if (channelName.trim()) parts.push(`ערוץ יוטיוב: ${channelName.trim()}`);
		if (channelLink.trim()) parts.push(`קישור: ${channelLink.trim()}`);
		if (notesCol && parts.length) cells[notesCol.id] = parts.join(' | ').slice(0, LIMITS.cell);

		return cells;
	}

	async function syncToSheet(manual = false) {
		persistLocal();
		const cells = buildCells();
		const hasInput = channelLink.trim() || channelName.trim();
		if (!hasInput) {
			if (manual) saveError = 'יש למלא לפחות קישור לערוץ או שם ערוץ לפני השמירה';
			return;
		}
		if (saving) return;

		saving = true;
		saveError = '';
		saveMsg = '';

		try {
			if (!data.guest) {
				// צוות הרשת: יוצר שורה בפעם הראשונה, ומעדכן תאים בעריכות הבאות
				if (!savedRowId) {
					const id = newId();
					const res = await fetch('/api/team-board', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ op: { type: 'sheet.row.add', id, cells } })
					});
					const json = await res.json().catch(() => ({}));
					if (!res.ok) throw new Error(json.error || 'השמירה נכשלה');
					savedRowId = id;
				} else {
					for (const [colId, value] of Object.entries(cells)) {
						const res = await fetch('/api/team-board', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								op: { type: 'sheet.cell.set', rowId: savedRowId, colId, value }
							})
						});
						const json = await res.json().catch(() => ({}));
						if (!res.ok) throw new Error(json.error || 'העדכון נכשל');
					}
				}
			} else {
				// מתנדב רגיל: /api/tv-guest שומר שורה חדשה (מוגן מפני כפילות אוטומטית)
				if (savedRowId && !manual) {
					saving = false;
					return;
				}
				const id = newId();
				const res = await fetch('/api/tv-guest', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id, cells })
				});
				const json = await res.json().catch(() => ({}));
				if (!res.ok) throw new Error(json.error || 'השמירה נכשלה');
				savedRowId = id;
			}
			persistLocal();
			saveMsg = 'נשתל בהצלחה בטבלת חירות TV ✓';
		} catch (e) {
			saveError = e instanceof Error ? e.message : 'שגיאה בשמירה לטבלה';
		} finally {
			saving = false;
		}
	}

	function onFieldBlur() {
		persistLocal();
		if (channelLink.trim() || channelName.trim()) void syncToSheet(false);
	}

	async function copyText(text: string, which: 'key' | 'title') {
		try {
			await navigator.clipboard.writeText(text);
			if (which === 'key') {
				copiedKeyName = true;
				setTimeout(() => (copiedKeyName = false), 2000);
			} else {
				copiedTitle = true;
				setTimeout(() => (copiedTitle = false), 2000);
			}
		} catch {
			// ignore clipboard error
		}
	}
</script>

<svelte:head>
	<title>חיבור ערוץ יוטיוב | חירות TV</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-4xl px-3 sm:px-4 py-3 sm:py-4" dir="rtl">
	<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
		<h1 class="flex items-center gap-2 text-xl sm:text-3xl font-black text-white">
			<span aria-hidden="true">▶️</span> יוטיוב: לתת לחירותTV לשדר בערוץ שלך
		</h1>
		<a
			href="/admin/tv"
			class="ms-auto rounded-lg border border-white/15 px-3 py-1 text-sm sm:text-base font-bold text-amber-200 hover:bg-white/5"
		>
			← חזרה לחירות TV
		</a>
		<p class="basis-full text-sm sm:text-base text-gray-200 leading-snug">
			<strong class="text-white">מה מקבלים:</strong> השידורים שלנו עולים בערוץ שלך כשידור חי.
			<span class="mx-1 text-white/30">|</span>
			<strong class="text-white">מה עושים:</strong> הגדרה חד-פעמית, כ-10 דקות (ועוד המתנה של עד 24 שעות בפעם הראשונה). לא צריך לתת סיסמה.
		</p>
	</div>

	<div class="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#141c2f]/90">
		<!-- תנאים -->
		<section class="px-4 py-3">
			<h2 class="mb-1 text-base sm:text-lg font-black text-amber-200">תנאים</h2>
			<ul class="space-y-0.5 text-sm sm:text-base text-gray-100 list-disc list-inside">
				<li>ערוץ יוטיוב שלך, בגיל 16 ומעלה.</li>
				<li>הערוץ מאומת בטלפון.</li>
				<li>בלי הגבלה על שידורים חיים ב-90 הימים האחרונים.</li>
			</ul>
		</section>

		<!-- מה אתה עושה (4 משימות) -->
		<section class="px-4 py-3 space-y-4">
			<h2 class="text-base sm:text-lg font-black text-amber-200">מה אתה עושה (4 משימות)</h2>

			<!-- משימה 1 -->
			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 1: הפעל שידורים חיים</h3>
				<ol class="space-y-0.5 text-sm sm:text-base text-gray-200 list-decimal list-inside">
					<li>
						פתח
						<a
							href="https://studio.youtube.com"
							target="_blank"
							rel="noopener noreferrer"
							class="text-red-300 underline hover:text-red-200"
							dir="ltr"
						>studio.youtube.com</a>
					</li>
					<li>למעלה לחץ <strong class="text-white">CREATE (יצירה)</strong> ← <strong class="text-white">Go live (שידור חי)</strong>.</li>
					<li>אם מבקשים אימות, אמת את הערוץ בטלפון. בפעם הראשונה ההפעלה יכולה לקחת עד 24 שעות.</li>
				</ol>

				<!-- מוקאפ YouTube Studio: Create -> Go live -->
				<div class="mt-2.5 max-w-md overflow-hidden rounded-xl border border-slate-300 bg-[#f9f9f9] text-slate-900 shadow" dir="ltr">
					<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
						<div class="flex items-center gap-1.5">
							<span class="inline-flex h-4 w-5 items-center justify-center rounded bg-[#ff0000] text-[9px] font-black text-white">▶</span>
							<span class="font-bold text-slate-800">YouTube Studio</span>
						</div>
						<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — פתיחת שידור חי</span>
					</div>
					<div class="p-2.5">
						<div class="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
							<div class="text-[11px] text-slate-500" dir="rtl">
								בסרגל העליון של Studio לחץ על כפתור היצירה:
							</div>
							<div class="relative shrink-0">
								<div class="flex items-center gap-1 rounded border-2 border-red-400 bg-red-50 px-2.5 py-1 font-semibold text-slate-800">
									<span class="text-[#ff0000]">📹</span>
									<span>CREATE</span>
									<span class="rounded bg-red-100 px-1 text-[10px] font-bold text-red-700" dir="rtl">①</span>
								</div>
								<div class="mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-md text-[11px]">
									<div class="px-2.5 py-1 text-slate-500">Upload videos</div>
									<div class="flex items-center justify-between border-y border-amber-300 bg-amber-50 px-2.5 py-1 font-bold text-slate-900">
										<span>📡 Go live</span>
										<span class="rounded bg-amber-200 px-1 text-[10px] text-amber-900" dir="rtl">② לחץ</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- משימה 2 -->
			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 2: צור מפתח שידור קבוע</h3>
				<ol class="space-y-1 text-sm sm:text-base text-gray-200 list-decimal list-inside">
					<li>בחלון השידור החי לחץ על הלשונית <strong class="text-white">Stream</strong> (ובפעם הראשונה <strong class="text-white">Create stream</strong>).</li>
					<li>
						תחת <strong class="text-white">Select stream key</strong> בחר <strong class="text-white">Create new stream key</strong>, תן לו שם:
						<span class="inline-flex flex-wrap items-center gap-1.5 align-middle">
							<code class="rounded bg-black/40 px-2 py-0.5 text-xs sm:text-sm text-emerald-200">{STREAM_KEY_NAME}</code>
							<button
								type="button"
								onclick={() => copyText(STREAM_KEY_NAME, 'key')}
								class="rounded border border-white/15 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-gray-200 hover:bg-white/10 cursor-pointer"
							>
								{copiedKeyName ? '✓ הועתק' : 'העתק'}
							</button>
						</span>
						ולחץ <strong class="text-white">Create</strong>.
					</li>
					<li>בחר את המפתח החדש.</li>
				</ol>

				<!-- מוקאפ YouTube Live Control Room: יצירת מפתח שידור -->
				<div class="mt-2.5 max-w-lg overflow-hidden rounded-xl border border-slate-300 bg-[#f9f9f9] text-slate-900 shadow" dir="ltr">
					<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
						<div class="flex items-center gap-2">
							<span class="inline-flex h-4 w-5 items-center justify-center rounded bg-[#ff0000] text-[9px] font-black text-white">▶</span>
							<span class="font-bold text-slate-800">Live Control Room</span>
							<span class="rounded border border-blue-400 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">① Stream</span>
						</div>
						<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — יצירת מפתח קבוע</span>
					</div>
					<div class="space-y-2 p-2.5 text-xs">
						<div class="rounded-lg border border-slate-200 bg-white p-2.5">
							<div class="mb-1 flex items-center justify-between">
								<span class="font-semibold text-slate-600">Select stream key</span>
								<span class="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800" dir="rtl">② בחר מהרשימה</span>
							</div>
							<div class="flex items-center justify-between rounded border-2 border-blue-400 bg-blue-50/40 px-2.5 py-1.5 text-slate-800">
								<span class="font-semibold">Create new stream key</span>
								<span class="text-slate-400">▾</span>
							</div>
							<div class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
								<div class="mb-1 text-[11px] font-semibold text-slate-700">Name</div>
								<div class="flex items-center gap-2">
									<div class="flex-1 rounded border-2 border-amber-400 bg-white px-2 py-1 font-bold text-slate-900" dir="rtl">
										חירותTV
									</div>
									<span class="rounded bg-[#065fd4] px-3 py-1 font-semibold text-white">Create</span>
									<span class="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800" dir="rtl">③ צור ובחר</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- משימה 3 -->
			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 3: הגדר שהשידור יתחיל ויסתיים לבד</h3>
				<ol class="space-y-1 text-sm sm:text-base text-gray-200 list-decimal list-inside">
					<li>באותו מסך, בהגדרות השידור, הדלק <strong class="text-white">Enable Auto-start</strong> וגם <strong class="text-white">Enable Auto-stop</strong>.</li>
					<li>קבע את הפרטיות ל-<strong class="text-white">Public (ציבורי)</strong>.</li>
					<li>
						כותרת:
						<span class="inline-flex flex-wrap items-center gap-1.5 align-middle">
							<code class="rounded bg-black/40 px-2 py-0.5 text-xs sm:text-sm text-emerald-200">{STREAM_TITLE}</code>
							<button
								type="button"
								onclick={() => copyText(STREAM_TITLE, 'title')}
								class="rounded border border-white/15 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-gray-200 hover:bg-white/10 cursor-pointer"
							>
								{copiedTitle ? '✓ הועתק' : 'העתק'}
							</button>
						</span>
						(או כל כותרת שתרצה).
					</li>
				</ol>

				<!-- מוקאפ הגדרות השידור והפרטיות -->
				<div class="mt-2.5 max-w-lg overflow-hidden rounded-xl border border-slate-300 bg-[#f9f9f9] text-slate-900 shadow" dir="ltr">
					<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
						<span class="font-bold text-slate-800">Stream settings &amp; Details</span>
						<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — הפעלה אוטומטית ופרטיות</span>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 text-xs">
						<div class="space-y-2 rounded-lg border border-slate-200 bg-white p-2.5">
							<div class="flex items-center justify-between">
								<span class="font-semibold text-slate-700">Enable Auto-start</span>
								<span class="inline-flex h-4 w-7 items-center justify-end rounded-full bg-[#065fd4] p-0.5">
									<span class="h-3 w-3 rounded-full bg-white"></span>
								</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="font-semibold text-slate-700">Enable Auto-stop</span>
								<span class="inline-flex h-4 w-7 items-center justify-end rounded-full bg-[#065fd4] p-0.5">
									<span class="h-3 w-3 rounded-full bg-white"></span>
								</span>
							</div>
							<div class="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-800" dir="rtl">① שניהם דלוקים (כחול)</div>
						</div>
						<div class="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2.5">
							<div class="flex items-center justify-between text-[11px]">
								<span class="font-semibold text-slate-600">Visibility</span>
								<span class="rounded border border-emerald-400 bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-800">② Public</span>
							</div>
							<div class="text-[11px] font-semibold text-slate-600">Title</div>
							<div class="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800" dir="rtl">
								③ חירותTV - שידור חי
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- משימה 4 -->
			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 4: שלח לנו את הפרטים</h3>
				<ul class="space-y-1 text-sm sm:text-base text-gray-200 list-disc list-inside">
					<li><strong class="text-white">בטופס באתר (כאן למטה):</strong> קישור לערוץ שלך (למשל <code class="rounded bg-black/40 px-1.5 py-0.5 text-xs text-blue-200" dir="ltr">https://youtube.com/@שם</code>) ושם הערוץ.</li>
					<li><strong class="text-white">בהודעה פרטית בלבד למנהל הפרויקט:</strong> ה-<code class="rounded bg-black/40 px-1.5 py-0.5 text-xs text-amber-200" dir="ltr">Stream URL</code> וה-<code class="rounded bg-black/40 px-1.5 py-0.5 text-xs text-amber-200" dir="ltr">Stream key</code>.</li>
				</ul>

				<div class="mt-2 rounded-xl border border-amber-400/40 bg-amber-950/30 px-3 py-2 text-xs sm:text-sm font-bold text-amber-200">
					⚠️ המפתח הוא כמו סיסמה. מי שמחזיק בו יכול לשדר בערוץ שלך. לא בתגובה, לא בקבוצה ולא בטופס שאחרים רואים.
				</div>

				<!-- מוקאפ מאיפה מעתיקים Stream URL ו-Stream key -->
				<div class="mt-2.5 max-w-lg overflow-hidden rounded-xl border border-slate-300 bg-[#f9f9f9] text-slate-900 shadow" dir="ltr">
					<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
						<span class="font-bold text-slate-800">Stream key &amp; Stream URL</span>
						<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — להעתקה להודעה פרטית בלבד</span>
					</div>
					<div class="space-y-2 p-2.5 text-xs">
						<div class="rounded-lg border-2 border-amber-400 bg-amber-50/50 p-2">
							<div class="mb-0.5 flex items-center justify-between">
								<span class="font-semibold text-slate-700">Stream key (paste in encoder)</span>
								<span class="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-900" dir="rtl">העתק לפרטי</span>
							</div>
							<div class="flex items-center justify-between gap-2 font-mono text-[11px] text-slate-700">
								<span>••••-••••-••••-••••</span>
								<span class="rounded border border-slate-300 bg-white px-2 py-0.5 font-sans font-semibold text-slate-700">COPY</span>
							</div>
						</div>
						<div class="rounded-lg border-2 border-amber-400 bg-amber-50/50 p-2">
							<div class="mb-0.5 flex items-center justify-between">
								<span class="font-semibold text-slate-700">Stream URL</span>
								<span class="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-900" dir="rtl">העתק לפרטי</span>
							</div>
							<div class="flex items-center justify-between gap-2 font-mono text-[11px] text-slate-700">
								<span class="truncate">rtmp://a.rtmp.youtube.com/live2</span>
								<span class="rounded border border-slate-300 bg-white px-2 py-0.5 font-sans font-semibold text-slate-700">COPY</span>
							</div>
						</div>
					</div>
				</div>

				<!-- שדות הזנה לשתילה בטבלת חירות TV (קישור ושם ערוץ בלבד, ללא מפתח) -->
				<div class="mt-2.5 space-y-2 rounded-xl border border-emerald-400/25 bg-emerald-950/20 p-3">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						<label class="block">
							<span class="mb-1 block text-xs sm:text-sm font-bold text-emerald-200">
								קישור לערוץ היוטיוב שלך
							</span>
							<input
								type="text"
								dir="ltr"
								bind:value={channelLink}
								oninput={persistLocal}
								onblur={onFieldBlur}
								placeholder="https://youtube.com/@..."
								class="w-full rounded-lg border border-white/15 bg-[#0f1626] px-2.5 py-1.5 font-mono text-xs sm:text-sm text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-none"
							/>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs sm:text-sm font-bold text-emerald-200">
								שם הערוץ שלך
							</span>
							<input
								type="text"
								bind:value={channelName}
								oninput={persistLocal}
								onblur={onFieldBlur}
								placeholder="למשל: ערוץ חירות"
								class="w-full rounded-lg border border-white/15 bg-[#0f1626] px-2.5 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-none"
							/>
						</label>
					</div>

					<div class="flex flex-wrap items-center gap-2.5">
						<button
							type="button"
							onclick={() => syncToSheet(true)}
							disabled={saving}
							class="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
						>
							{saving ? 'שומר בטבלה…' : savedRowId ? 'עדכן / שלח שוב לטבלת חירות TV' : 'שתול עכשיו בטבלת חירות TV'}
						</button>

						{#if saveMsg}
							<span class="text-xs sm:text-sm font-bold text-emerald-300">{saveMsg}</span>
							<a href="/admin/tv" class="text-xs sm:text-sm font-bold text-amber-200 underline hover:text-amber-100">
								צפה בטבלה ←
							</a>
						{:else if saveError}
							<span class="text-xs sm:text-sm font-bold text-red-300">{saveError}</span>
						{:else}
							<span class="text-xs text-gray-300">
								הנתונים נשמרים כטיוטה מקומית ונשתלים אוטומטית בטבלה בדף <a href="/admin/tv" class="text-amber-200 underline">חירות TV</a> (ללא מפתח השידור).
							</span>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<!-- טוב לדעת -->
		<section class="px-4 py-3">
			<h2 class="mb-1 text-base sm:text-lg font-black text-amber-200">טוב לדעת</h2>
			<ul class="space-y-0.5 text-sm sm:text-base text-gray-200 list-disc list-inside">
				<li>אל תשתמש במפתח הזה לשידורים שלך, ואל תלחץ <strong class="text-white">Reset (איפוס)</strong>, כי החיבור יתנתק.</li>
				<li>אחרי שידור ניסיון הראשון נעדכן אותך אם הכול עלה. אם נבקש, תבדוק בחשבון שלך שההגדרות עדיין דלוקות.</li>
			</ul>
		</section>

		<!-- להפסיק בכל רגע -->
		<section class="px-4 py-3">
			<h2 class="mb-1 text-base sm:text-lg font-black text-amber-200">להפסיק בכל רגע</h2>
			<p class="text-sm sm:text-base text-gray-200 leading-snug">
				ב-<strong class="text-white">Stream</strong> לחץ <strong class="text-white">Reset</strong> ליד המפתח, או כתוב לנו ונסיר אותך.
			</p>
			<div class="mt-2.5 max-w-md overflow-hidden rounded-xl border border-slate-300 bg-[#f9f9f9] text-slate-900 shadow" dir="ltr">
				<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
					<span class="font-bold text-slate-800">Stream › Stream key</span>
					<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — ניתוק מיידי</span>
				</div>
				<div class="p-2.5">
					<div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
						<div>
							<div class="font-bold text-slate-900" dir="rtl">חירותTV</div>
							<div class="font-mono text-[11px] text-slate-500">••••-••••-••••-••••</div>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1 font-semibold text-slate-800">RESET</span>
							<span class="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700">COPY</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- הוראות לצוות בלבד -->
		{#if !data.guest}
			<details class="px-4 py-3">
				<summary class="cursor-pointer text-base font-black text-purple-200 select-none">
					רשימת משימות לצוות שלנו (לא למתנדב) ומגבלות פיילוט
				</summary>
				<div class="mt-2 space-y-2.5 text-sm sm:text-base text-gray-200">
					<ol class="space-y-1.5 list-decimal list-inside">
						<li>לוודא שהמתנדב שתל את שם הערוץ והקישור בטבלת חירות TV ושערוצו מאומת לשידור חי (ללא המתנת 24 שעות פעילה).</li>
						<li>לקבל מהמתנדב בהודעה פרטית בלבד את ה-<code class="rounded bg-black/40 px-1.5 py-0.5 text-xs text-emerald-200" dir="ltr">Stream URL</code> ואת ה-<code class="rounded bg-black/40 px-1.5 py-0.5 text-xs text-emerald-200" dir="ltr">Stream key</code> ולהגדיר אותם בשרת השידור (אסור לשמור את המפתח בטבלת חירות TV).</li>
						<li>להריץ שידור ניסיון קצר ולוודא שהשידור עולה אוטומטית בערוץ (Auto-start / Auto-stop פעילים ופרטיות Public).</li>
						<li>לאשר למתנדב שהחיבור נקלט ושההגדרות נשמרות.</li>
					</ol>

					<div class="border-t border-white/10 pt-2">
						<h3 class="mb-1 text-sm sm:text-base font-bold text-purple-200">מגבלות פיילוט (ידועות)</h3>
						<ul class="space-y-1 list-disc list-inside text-gray-300">
							<li>שליחת Stream key בפרטי היא פתרון זמני לקבוצת פיילוט. אם המשתמש לוחץ Reset או משדר עם אותו מפתח ידנית, החיבור נשבר עד לעדכון מחדש.</li>
							<li>ערוצים חדשים נדרשים לאימות טלפון והמתנה של עד 24 שעות מרגע הבקשה הראשונה לשידור חי ביוטיוב.</li>
						</ul>
					</div>
				</div>
			</details>
		{/if}
	</div>
</div>
