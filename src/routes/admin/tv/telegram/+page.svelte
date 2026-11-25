<script lang="ts">
	// /admin/tv/telegram — מדריך חיבור ערוץ או קבוצת טלגרם לשידור חי משותף של חירות TV
	import { onMount } from 'svelte';
	import { DEFAULT_COLUMNS, LIMITS, newId, type SheetColumn } from '$lib/teamBoard';

	let { data } = $props();

	let copiedHandle = $state(false);

	// שדות הדבקה למשתמש — נשתלים אוטומטית בטבלת חירות TV
	let channelLink = $state('');
	let channelName = $state('');

	let columns = $state<SheetColumn[]>(DEFAULT_COLUMNS);
	let savedRowId = $state('');
	let saving = $state(false);
	let saveMsg = $state('');
	let saveError = $state('');

	const STORAGE_KEY = 'tv_tg_guide_v1';
	const ADMIN_HANDLE = '@Yahav_anter';

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
		const tgCol = columns.find((c) => c.id === 'col-telegram' || c.label.includes('טלגרם'));
		const notesCol = columns.find((c) => c.id === 'col-notes' || c.label.includes('הערות'));

		const cells: Record<string, string> = {};
		const nameVal = (data.userName || '').trim();
		if (nameCol && nameVal) cells[nameCol.id] = nameVal.slice(0, LIMITS.cell);

		const tgVal = (channelLink.trim() || channelName.trim()).slice(0, LIMITS.cell);
		if (tgCol && tgVal) cells[tgCol.id] = tgVal;

		const parts: string[] = [];
		if (channelName.trim()) parts.push(`טלגרם: ${channelName.trim()}`);
		if (channelLink.trim()) parts.push(`קישור: ${channelLink.trim()}`);
		if (notesCol && parts.length) cells[notesCol.id] = parts.join(' | ').slice(0, LIMITS.cell);

		return cells;
	}

	async function syncToSheet(manual = false) {
		persistLocal();
		const cells = buildCells();
		const hasInput = channelLink.trim() || channelName.trim();
		if (!hasInput) {
			if (manual) saveError = 'יש למלא לפחות קישור או שם ערוץ/קבוצה לפני השמירה';
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

	async function copyHandle() {
		try {
			await navigator.clipboard.writeText(ADMIN_HANDLE);
			copiedHandle = true;
			setTimeout(() => (copiedHandle = false), 2000);
		} catch {
			// ignore clipboard error
		}
	}
</script>

<svelte:head>
	<title>חיבור טלגרם | חירות TV</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-4xl px-3 sm:px-4 py-3 sm:py-4" dir="rtl">
	<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
		<h1 class="flex items-center gap-2 text-xl sm:text-3xl font-black text-white">
			<span aria-hidden="true">✈️</span> טלגרם: לתת לחירותTV לשדר בערוץ או בקבוצה שלך
		</h1>
		<a
			href="/admin/tv"
			class="ms-auto rounded-lg border border-white/15 px-3 py-1 text-sm sm:text-base font-bold text-amber-200 hover:bg-white/5"
		>
			← חזרה לחירות TV
		</a>
		<p class="basis-full text-sm sm:text-base text-gray-200 leading-snug">
			<strong class="text-white">מה מקבלים:</strong> בכל שידור שלנו נפתח שידור חי בערוץ או בקבוצה שלך לבד, ונסגר לבד בסוף.
			<span class="mx-1 text-white/30">|</span>
			<strong class="text-white">מה עושים:</strong> פעם אחת, כ-2 דקות. אין צורך בסיסמה, בטוקן או בלחיצה בכל שידור.
		</p>
	</div>

	<div class="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#141c2f]/90">
		<!-- תנאים -->
		<section class="px-4 py-3">
			<h2 class="mb-1 text-base sm:text-lg font-black text-amber-200">תנאים</h2>
			<ul class="space-y-0.5 text-sm sm:text-base text-gray-100 list-disc list-inside">
				<li>ערוץ או קבוצה בטלגרם שאתה בעלים שלהם, או מנהל שיכול להוסיף מנהלים.</li>
			</ul>
		</section>

		<!-- מה אתה עושה (3 משימות) -->
		<section class="px-4 py-3 space-y-4">
			<h2 class="text-base sm:text-lg font-black text-amber-200">מה אתה עושה (3 משימות)</h2>

			<!-- משימה 1 -->
			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 1: הוסף אותנו כמנהל</h3>
				<ol class="space-y-1 text-sm sm:text-base text-gray-200 list-decimal list-inside">
					<li>פתח את הערוץ או הקבוצה ← לחץ על השם למעלה ← <strong class="text-white">Administrators (מנהלים)</strong> ← <strong class="text-white">Add Admin (הוספת מנהל)</strong>.</li>
					<li>
						חפש את
						<span class="inline-flex flex-wrap items-center gap-1.5 align-middle">
							<code class="rounded bg-black/40 px-2 py-0.5 text-xs sm:text-sm text-sky-200" dir="ltr">{ADMIN_HANDLE}</code>
							<button
								type="button"
								onclick={copyHandle}
								class="rounded border border-white/15 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-gray-200 hover:bg-white/10 cursor-pointer"
							>
								{copiedHandle ? '✓ הועתק' : 'העתק'}
							</button>
						</span>
						ובחר.
					</li>
					<li>השאר דלוקה את ההרשאה <strong class="text-white">Manage Live Streams</strong> (בקבוצה: <strong class="text-white">Manage Video Chats</strong>). את שאר ההרשאות אפשר לכבות.</li>
					<li>שמור.</li>
				</ol>

				<!-- מוקאפ Telegram: הוספת מנהל והרשאות שידור חי -->
				<div class="mt-2.5 max-w-lg overflow-hidden rounded-xl border border-slate-300 bg-[#f1f5f9] text-slate-900 shadow" dir="ltr">
					<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
						<div class="flex items-center gap-1.5">
							<span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#2AABEE] text-[9px] font-black text-white">✈</span>
							<span class="font-bold text-slate-800">Telegram · Administrators</span>
						</div>
						<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — הרשאת שידור חי</span>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 text-xs">
						<!-- חיפוש והוספת מנהל -->
						<div class="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2.5">
							<div class="flex items-center justify-between">
								<span class="font-semibold text-slate-700">Add Admin</span>
								<span class="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800" dir="rtl">① חפש ובחר</span>
							</div>
							<div class="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-800">
								@Yahav_anter
							</div>
							<div class="flex items-center gap-2 rounded-lg border-2 border-sky-400 bg-sky-50/50 p-1.5">
								<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2AABEE] font-bold text-white text-[11px]">Y</div>
								<div class="min-w-0">
									<div class="font-bold text-slate-900 truncate">Yahav</div>
									<div class="text-[10px] text-sky-700 font-mono">@Yahav_anter</div>
								</div>
							</div>
						</div>

						<!-- הרשאות מנהל -->
						<div class="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2.5">
							<div class="flex items-center justify-between">
								<span class="font-semibold text-slate-700">Permissions</span>
								<span class="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800" dir="rtl">② השאר דלוק</span>
							</div>
							<div class="flex items-center justify-between text-[11px] text-slate-400">
								<span>Post Messages</span>
								<span class="inline-flex h-3.5 w-6 items-center justify-start rounded-full bg-slate-300 p-0.5">
									<span class="h-2.5 w-2.5 rounded-full bg-white"></span>
								</span>
							</div>
							<div class="flex items-center justify-between rounded border border-sky-300 bg-sky-50 px-1.5 py-1 text-[11px]">
								<span class="font-bold text-slate-900">Manage Live Streams</span>
								<span class="inline-flex h-4 w-7 items-center justify-end rounded-full bg-[#2AABEE] p-0.5">
									<span class="h-3 w-3 rounded-full bg-white"></span>
								</span>
							</div>
							<div class="flex justify-end pt-0.5">
								<span class="rounded bg-[#2AABEE] px-2.5 py-0.5 text-[11px] font-semibold text-white">Save ③</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- משימה 2 -->
			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 2: שלח לנו את הקישור</h3>
				<p class="text-sm sm:text-base text-gray-200 mb-1">בטופס באתר כתוב:</p>
				<ul class="space-y-0.5 text-sm sm:text-base text-gray-200 list-disc list-inside">
					<li>קישור לערוץ או לקבוצה (למשל <code class="rounded bg-black/40 px-1.5 py-0.5 text-xs text-sky-200" dir="ltr">https://t.me/שם</code>). בערוץ פרטי: קישור הזמנה.</li>
					<li>שם הערוץ או הקבוצה.</li>
				</ul>

				<!-- מוקאפ מאיפה לוקחים קישור בטלגרם -->
				<div class="mt-2.5 max-w-md overflow-hidden rounded-xl border border-slate-300 bg-[#f1f5f9] text-slate-900 shadow" dir="ltr">
					<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
						<span class="font-bold text-slate-800">Channel / Group Info</span>
						<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — העתקת קישור</span>
					</div>
					<div class="p-2.5 text-xs">
						<div class="rounded-lg border border-slate-200 bg-white p-2.5 space-y-1.5">
							<div class="font-bold text-slate-900" dir="rtl">חירות ישראל — ערוץ רשמי</div>
							<div class="flex items-center justify-between rounded border-2 border-amber-400 bg-amber-50/50 px-2 py-1 font-mono text-[11px] text-sky-700">
								<span>https://t.me/herut_israel</span>
								<span class="rounded bg-amber-200 px-1.5 py-0.5 font-sans text-[10px] font-bold text-amber-900" dir="rtl">העתק</span>
							</div>
						</div>
					</div>
				</div>

				<!-- שדות הזנה לשתילה בטבלת חירות TV -->
				<div class="mt-2.5 space-y-2 rounded-xl border border-emerald-400/25 bg-emerald-950/20 p-3">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						<label class="block">
							<span class="mb-1 block text-xs sm:text-sm font-bold text-emerald-200">
								קישור לערוץ או לקבוצה (או קישור הזמנה)
							</span>
							<input
								type="text"
								dir="ltr"
								bind:value={channelLink}
								oninput={persistLocal}
								onblur={onFieldBlur}
								placeholder="https://t.me/..."
								class="w-full rounded-lg border border-white/15 bg-[#0f1626] px-2.5 py-1.5 font-mono text-xs sm:text-sm text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-none"
							/>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs sm:text-sm font-bold text-emerald-200">
								שם הערוץ או הקבוצה
							</span>
							<input
								type="text"
								bind:value={channelName}
								oninput={persistLocal}
								onblur={onFieldBlur}
								placeholder="למשל: חירות ישראל"
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
								הנתונים נשמרים כטיוטה מקומית ונשתלים אוטומטית בטבלה בדף <a href="/admin/tv" class="text-amber-200 underline">חירות TV</a>.
							</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- משימה 3 -->
			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 3: המתן לאישור</h3>
				<p class="text-sm sm:text-base text-gray-200 leading-snug">
					נבדוק שהחיבור נקלט ונעדכן אותך.
				</p>
			</div>
		</section>

		<!-- טוב לדעת -->
		<section class="px-4 py-3">
			<h2 class="mb-1 text-base sm:text-lg font-black text-amber-200">טוב לדעת</h2>
			<ul class="space-y-0.5 text-sm sm:text-base text-gray-200 list-disc list-inside">
				<li>אל תפתח בעצמך שידור חי בזמן השידור שלנו, כי שידור ידני תופס את המקום.</li>
				<li>אם סגרת את השידור באמצע, לא נפתח אותו שוב באותו שידור.</li>
			</ul>
		</section>

		<!-- להפסיק בכל רגע -->
		<section class="px-4 py-3">
			<h2 class="mb-1 text-base sm:text-lg font-black text-amber-200">להפסיק בכל רגע</h2>
			<p class="text-sm sm:text-base text-gray-200 leading-snug">
				הסר את <code class="rounded bg-black/40 px-1.5 py-0.5 text-xs sm:text-sm text-sky-200" dir="ltr">{ADMIN_HANDLE}</code> מרשימת המנהלים. השידורים אצלך ייפסקו.
			</p>
			<div class="mt-2.5 max-w-md overflow-hidden rounded-xl border border-slate-300 bg-[#f1f5f9] text-slate-900 shadow" dir="ltr">
				<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
					<span class="font-bold text-slate-800">Administrators</span>
					<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — הסרת מנהל</span>
				</div>
				<div class="p-2.5">
					<div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
						<div class="flex items-center gap-2">
							<div class="flex h-7 w-7 items-center justify-center rounded-full bg-[#2AABEE] font-bold text-white text-[11px]">Y</div>
							<div>
								<div class="font-bold text-slate-900">Yahav</div>
								<div class="text-[11px] font-mono text-slate-500">@Yahav_anter</div>
							</div>
						</div>
						<span class="rounded-md bg-red-50 border border-red-200 px-2.5 py-1 font-semibold text-red-700">Dismiss admin</span>
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
						<li>לוודא שהמתנדב שתל את הקישור ושם הערוץ/הקבוצה בטבלת חירות TV.</li>
						<li>להצטרף לערוץ או לקבוצה עם חשבון <code class="rounded bg-black/40 px-1.5 py-0.5 text-xs text-sky-200" dir="ltr">@Yahav_anter</code> ולוודא שהרשאת <code class="rounded bg-black/40 px-1.5 py-0.5 text-xs text-emerald-200" dir="ltr">Manage Live Streams / Manage Video Chats</code> פעילה.</li>
						<li>להגדיר את יעד השידור במערכת השידור של חירות TV ולבצע בדיקת פתיחה/סגירה קצרה.</li>
						<li>לעדכן את המתנדב שהחיבור נקלט.</li>
					</ol>

					<div class="border-t border-white/10 pt-2">
						<h3 class="mb-1 text-sm sm:text-base font-bold text-purple-200">מגבלות פיילוט (ידועות)</h3>
						<ul class="space-y-1 list-disc list-inside text-gray-300">
							<li>פתיחת שידור ידני בערוץ/בקבוצה בזמן השידור המשותף חוסמת פתיחה אוטומטית נוספת.</li>
							<li>אם מנהל מקומי סוגר את השידור באמצע, המערכת לא פותחת אותו מחדש באותו שידור.</li>
						</ul>
					</div>
				</div>
			</details>
		{/if}
	</div>
</div>
