<script lang="ts">
	// /admin/tv/facebook — מדריך חיבור דף פייסבוק לשידור חי משותף של חירות TV
	import { onMount } from 'svelte';
	import { DEFAULT_COLUMNS, LIMITS, newId, type SheetColumn } from '$lib/teamBoard';

	let { data } = $props();
	let copiedPerms = $state(false);

	// שדות הדבקה למשתמש ליד השלבים — נשתלים אוטומטית בטבלת חירות TV
	let pageName = $state('');
	let profileLink = $state('');
	let approvedTester = $state(false);
	let accessToken = $state('');

	let columns = $state<SheetColumn[]>(DEFAULT_COLUMNS);
	let savedRowId = $state('');
	let saving = $state(false);
	let saveMsg = $state('');
	let saveError = $state('');

	const STORAGE_KEY = 'tv_fb_guide_v1';

	const PERMISSIONS =
		'pages_show_list, business_management, pages_read_engagement, pages_manage_posts, pages_manage_metadata';

	onMount(async () => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as Record<string, unknown>;
				if (typeof parsed.pageName === 'string') pageName = parsed.pageName;
				if (typeof parsed.profileLink === 'string') profileLink = parsed.profileLink;
				if (typeof parsed.approvedTester === 'boolean') approvedTester = parsed.approvedTester;
				if (typeof parsed.accessToken === 'string') accessToken = parsed.accessToken;
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
				JSON.stringify({ pageName, profileLink, approvedTester, accessToken, savedRowId })
			);
		} catch {
			// ignore
		}
	}

	function buildCells(): Record<string, string> {
		const nameCol = columns.find((c) => c.id === 'col-name' || c.label.includes('שם')) ?? columns[0];
		const fbCol = columns.find((c) => c.id === 'col-facebook' || c.label.includes('פייסבוק'));
		const notesCol = columns.find((c) => c.id === 'col-notes' || c.label.includes('הערות'));

		const cells: Record<string, string> = {};
		const nameVal = (data.userName || '').trim();
		if (nameCol && nameVal) cells[nameCol.id] = nameVal.slice(0, LIMITS.cell);

		const fbVal = (profileLink.trim() || pageName.trim()).slice(0, LIMITS.cell);
		if (fbCol && fbVal) cells[fbCol.id] = fbVal;

		const parts: string[] = [];
		if (pageName.trim()) parts.push(`דף: ${pageName.trim()}`);
		if (profileLink.trim()) parts.push(`פרופיל: ${profileLink.trim()}`);
		if (approvedTester) parts.push('Tester: אושר ✓');
		if (accessToken.trim()) parts.push(`טוקן: ${accessToken.trim()}`);
		if (notesCol && parts.length) cells[notesCol.id] = parts.join(' | ').slice(0, LIMITS.cell);

		return cells;
	}

	async function syncToSheet(manual = false) {
		persistLocal();
		const cells = buildCells();
		const hasInput =
			pageName.trim() || profileLink.trim() || approvedTester || accessToken.trim();
		if (!hasInput) {
			if (manual) saveError = 'יש למלא לפחות פרט אחד לפני השמירה';
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

	function onStepBlur() {
		persistLocal();
		if (!data.guest) void syncToSheet(false);
	}

	function onTokenBlurOrPaste() {
		persistLocal();
		if (accessToken.trim()) void syncToSheet(false);
	}

	async function copyPermissions() {
		try {
			await navigator.clipboard.writeText(PERMISSIONS);
			copiedPerms = true;
			setTimeout(() => (copiedPerms = false), 2000);
		} catch {
			// ignore clipboard error
		}
	}
</script>

<svelte:head>
	<title>חיבור דף פייסבוק | חירות TV</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-4xl px-3 sm:px-4 py-3 sm:py-4" dir="rtl">
	<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
		<h1 class="flex items-center gap-2 text-xl sm:text-3xl font-black text-white">
			<span aria-hidden="true">📘</span> מדריך: לתת לחירותTV לשדר בדף הפייסבוק שלך (פיילוט)
		</h1>
		<a
			href="/admin/tv"
			class="ms-auto rounded-lg border border-white/15 px-3 py-1 text-sm sm:text-base font-bold text-amber-200 hover:bg-white/5"
		>
			← חזרה לחירות TV
		</a>
		<p class="basis-full text-sm sm:text-base text-gray-200 leading-snug">
			<strong class="text-white">מה מקבלים:</strong> בכל שידור שלנו, הוא עולה גם בדף שלך כשידור חי, לבד. בלי לחיצה בכל שידור.
			<span class="mx-1 text-white/30">|</span>
			<strong class="text-white">מה עושים:</strong> חיבור חד-פעמי, כ-10 דקות. אנחנו לא מקבלים סיסמה, והטוקן שלך נמחק מיד אחרי החיבור.
		</p>
	</div>

	<div class="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#141c2f]/90">
		<!-- תנאים (חובה) -->
		<section class="px-4 py-3">
			<h2 class="mb-1 text-base sm:text-lg font-black text-amber-200">תנאים (חובה)</h2>
			<ul class="space-y-0.5 text-sm sm:text-base text-gray-100 list-disc list-inside">
				<li>דף פייסבוק (לא פרופיל אישי) שאתה אדמין בו.</li>
				<li>100 עוקבים לפחות בדף. פייסבוק לא מאפשר לייב משותף לדף קטן יותר (נבדק).</li>
				<li>חשבון פייסבוק בן 60 יום לפחות.</li>
			</ul>
		</section>

		<!-- מה אתה עושה (4 משימות) -->
		<section class="px-4 py-3 space-y-3">
			<h2 class="text-base sm:text-lg font-black text-amber-200">מה אתה עושה (4 משימות)</h2>

			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 1: שלח לנו שני פרטים</h3>
				<ul class="space-y-0.5 text-sm sm:text-base text-gray-200 list-disc list-inside">
					<li>את שם הדף שלך.</li>
					<li>את שם החשבון האישי שלך בפייסבוק (או הקישור לפרופיל), כדי שנוסיף אותך לאפליקציה שלנו.</li>
				</ul>
				<div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/25 p-2.5">
					<label class="block">
						<span class="mb-1 block text-xs font-bold text-amber-200">הדבק כאן: שם הדף שלך בפייסבוק</span>
						<input
							type="text"
							bind:value={pageName}
							oninput={persistLocal}
							onblur={onStepBlur}
							placeholder="למשל: חירות ישראל"
							class="w-full rounded-lg border border-white/15 bg-[#0f1626] px-2.5 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-400 focus:outline-none"
						/>
					</label>
					<label class="block">
						<span class="mb-1 block text-xs font-bold text-amber-200">הדבק כאן: שם החשבון האישי / קישור לפרופיל</span>
						<input
							type="text"
							bind:value={profileLink}
							oninput={persistLocal}
							onblur={onStepBlur}
							placeholder="שם מלא או https://facebook.com/..."
							class="w-full rounded-lg border border-white/15 bg-[#0f1626] px-2.5 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-400 focus:outline-none"
						/>
					</label>
				</div>
			</div>

			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 2: אשר הצטרפות לאפליקציה</h3>
				<ul class="space-y-0.5 text-sm sm:text-base text-gray-200 list-disc list-inside">
					<li>נוסיף אותך כ"בודק" (Tester) באפליקציה "GoFreeIL TV".</li>
					<li>
						פתח
						<a
							href="https://developers.facebook.com/requests"
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-300 underline hover:text-blue-200"
							dir="ltr"
						>developers.facebook.com/requests</a>
						ואשר את הבקשה.
					</li>
					<li>תגיד לנו "אישרתי".</li>
				</ul>

				<label class="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm font-bold text-emerald-200">
					<input
						type="checkbox"
						bind:checked={approvedTester}
						onchange={onStepBlur}
						class="h-4 w-4 accent-emerald-500"
					/>
					<span>אישרתי את בקשת ההצטרפות ל-GoFreeIL TV</span>
				</label>

				<!-- מוקאפ מסך בקשת Tester של Meta -->
				<div class="mt-2.5 max-w-md overflow-hidden rounded-xl border border-slate-300 bg-[#f0f2f5] text-slate-900 shadow" dir="ltr">
					<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
						<div class="flex items-center gap-1.5">
							<span class="font-bold text-[#0866ff]">Meta</span>
							<span class="text-slate-500">for Developers</span>
							<span class="text-slate-300">|</span>
							<span class="font-semibold text-slate-700">Requests</span>
						</div>
						<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — אישור בקשה</span>
					</div>
					<div class="p-2.5">
						<div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
							<div class="flex items-center gap-2">
								<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0866ff] font-black text-white text-xs">TV</div>
								<div>
									<div class="font-bold text-slate-900">GoFreeIL TV</div>
									<div class="text-[11px] text-slate-500">Invited you to be a <strong class="text-slate-700">Tester</strong></div>
								</div>
							</div>
							<span class="rounded-md bg-[#0866ff] px-3 py-1.5 font-semibold text-white">Confirm</span>
						</div>
					</div>
				</div>
			</div>

			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 3: הפק קוד חד-פעמי לדף</h3>
				<ol class="space-y-1 text-sm sm:text-base text-gray-200 list-decimal list-inside">
					<li>
						פתח
						<a
							href="https://developers.facebook.com/tools/explorer/"
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-300 underline hover:text-blue-200"
							dir="ltr"
						>developers.facebook.com/tools/explorer/</a>
					</li>
					<li>למעלה ב-"Meta App" בחר <strong class="text-white">GoFreeIL TV</strong>.</li>
					<li>
						תחת "Permissions" הוסף:
						<div class="mt-1 flex flex-wrap items-center gap-1.5">
							<code class="rounded bg-black/40 px-2 py-0.5 text-xs sm:text-sm text-emerald-200" dir="ltr">{PERMISSIONS}</code>
							<button
								type="button"
								onclick={copyPermissions}
								class="rounded border border-white/15 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-gray-200 hover:bg-white/10 cursor-pointer"
							>
								{copiedPerms ? '✓ הועתק' : 'העתק'}
							</button>
						</div>
					</li>
					<li>לחץ <strong class="text-white">Generate Access Token</strong>. בחלון של פייסבוק בחר "Edit settings", בחר את הדף שלך, ואשר את כל ההרשאות.</li>
					<li>בשדה "User or Page" בחר את הדף שלך (לא "User Token").</li>
					<li>סמן את כל הטקסט בשדה "Access Token" והעתק (<span dir="ltr">Ctrl+A, Ctrl+C</span>).</li>
				</ol>

				<!-- מוקאפ הממחיש את מסך Graph API Explorer של Meta -->
				<div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-[#f0f2f5] text-slate-900 shadow-lg" dir="ltr">
					<!-- סרגל עליון של Meta for Developers -->
					<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
						<div class="flex items-center gap-2">
							<span class="font-bold text-[#0866ff]">Meta</span>
							<span class="text-slate-500">for Developers</span>
							<span class="text-slate-300">|</span>
							<span class="font-semibold text-slate-700">Graph API Explorer</span>
						</div>
						<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — מסך פייסבוק</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-2.5 p-2.5">
						<!-- אזור השאילתה משמאל -->
						<div class="space-y-2">
							<div class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-1.5 text-xs">
								<span class="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">GET</span>
								<span class="rounded bg-slate-100 px-2 py-1 text-slate-600">v21.0</span>
								<span class="flex-1 truncate px-1 font-mono text-slate-700">me?fields=id,name</span>
								<span class="rounded bg-[#0866ff] px-2.5 py-1 font-semibold text-white">Submit</span>
							</div>
							<div class="rounded-lg border border-slate-300 bg-white p-2.5 text-xs shadow-sm">
								<div class="mb-2 flex items-center justify-between border-b border-slate-200 pb-1.5">
									<div class="flex items-center gap-1.5">
										<span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#0866ff] text-[10px] font-black text-white">f</span>
										<span class="font-bold text-slate-800">GoFreeIL TV</span>
									</div>
									<span class="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800" dir="rtl">חלון קופץ אחרי לחיצה על ④</span>
								</div>
								<p class="mb-1.5 text-[11px] text-slate-600" dir="rtl">
									החלון מבקש הרשאות לדפים שלך:
								</p>
								<div class="mb-2 rounded border border-blue-300 bg-blue-50/40 p-2 text-[11px]">
									<div class="mb-1 flex items-center justify-between">
										<span class="font-semibold text-[#0866ff] underline">Edit settings</span>
										<span class="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-bold text-blue-800" dir="rtl">לחץ כאן</span>
									</div>
									<label class="flex items-center gap-1.5 text-slate-800" dir="rtl">
										<input type="checkbox" checked disabled class="accent-[#0866ff]" />
										<span class="font-semibold">הדף שלך (בחר את הדף)</span>
									</label>
								</div>
								<div class="flex justify-end">
									<span class="rounded bg-[#0866ff] px-3 py-1 text-[11px] font-semibold text-white">Continue</span>
								</div>
							</div>
						</div>

						<!-- סרגל הטוקן מימין (כמו ב-Graph API Explorer) -->
						<div class="space-y-2 rounded-lg border border-slate-300 bg-white p-2.5 text-xs">
							<!-- Access Token (שלב 6) -->
							<div>
								<div class="mb-0.5 flex items-center justify-between">
									<span class="font-semibold text-slate-700">Access Token</span>
									<span class="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800" dir="rtl">⑥ העתק מכאן</span>
								</div>
								<div class="rounded border-2 border-amber-400 bg-amber-50/50 px-2 py-1 font-mono text-[11px] text-slate-700 truncate">
									EAAGm0PX4ZCpsBA... (Ctrl+A, Ctrl+C)
								</div>
							</div>

							<!-- Meta App (שלב 2) -->
							<div>
								<div class="mb-0.5 flex items-center justify-between">
									<span class="font-semibold text-slate-700">Meta App</span>
									<span class="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800" dir="rtl">② בחר אפליקציה</span>
								</div>
								<div class="flex items-center justify-between rounded border-2 border-blue-400 bg-blue-50/40 px-2 py-1 text-slate-800">
									<span class="font-semibold">GoFreeIL TV</span>
									<span class="text-slate-400">▾</span>
								</div>
							</div>

							<!-- User or Page (שלב 5) -->
							<div>
								<div class="mb-0.5 flex items-center justify-between">
									<span class="font-semibold text-slate-700">User or Page</span>
									<span class="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800" dir="rtl">⑤ בחר הדף שלך</span>
								</div>
								<div class="flex items-center justify-between rounded border-2 border-emerald-500 bg-emerald-50/40 px-2 py-1 text-slate-800">
									<span class="font-semibold" dir="rtl">הדף שלך (Page)</span>
									<span class="text-slate-400">▾</span>
								</div>
							</div>

							<!-- Permissions (שלב 3) -->
							<div>
								<div class="mb-0.5 flex items-center justify-between">
									<span class="font-semibold text-slate-700">Permissions</span>
									<span class="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800" dir="rtl">③ הוסף 5 הרשאות</span>
								</div>
								<div class="flex flex-wrap gap-1 rounded border border-purple-300 bg-purple-50/30 p-1.5 text-[10px]">
									<span class="rounded bg-slate-200 px-1.5 py-0.5 text-slate-800">pages_show_list ×</span>
									<span class="rounded bg-slate-200 px-1.5 py-0.5 text-slate-800">business_management ×</span>
									<span class="rounded bg-slate-200 px-1.5 py-0.5 text-slate-800">pages_read_engagement ×</span>
									<span class="rounded bg-slate-200 px-1.5 py-0.5 text-slate-800">pages_manage_posts ×</span>
									<span class="rounded bg-slate-200 px-1.5 py-0.5 text-slate-800">pages_manage_metadata ×</span>
								</div>
							</div>

							<!-- Generate Access Token (שלב 4) -->
							<div class="pt-0.5">
								<div class="flex items-center justify-between gap-2">
									<span class="flex-1 rounded bg-[#0866ff] px-2.5 py-1.5 text-center font-semibold text-white">
										Generate Access Token
									</span>
									<span class="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800" dir="rtl">④ לחץ</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div>
				<h3 class="mb-1 text-base font-bold text-white">משימה 4: שלח לנו את הקוד, באופן פרטי</h3>
				<ul class="space-y-0.5 text-sm sm:text-base text-gray-200 list-disc list-inside">
					<li>הדבק את הקוד בהודעה פרטית אל מנהל הפרויקט (לא בקבוצה ולא בפוסט).</li>
					<li>הקוד תקף כשעתיים בלבד, ואנחנו משתמשים בו פעם אחת לחיבור הדף ואז מוחקים אותו.</li>
					<li>תגיד לנו כשנשלח, ונאשר לך כשהחיבור נקלט.</li>
				</ul>

				<div class="mt-2.5 space-y-2 rounded-xl border border-emerald-400/25 bg-emerald-950/20 p-3">
					<label class="block">
						<span class="mb-1 block text-xs sm:text-sm font-bold text-emerald-200">
							הדבק כאן את ה-Access Token שהעתקת (יישתל אוטומטית בטבלת חירות TV)
						</span>
						<input
							type="text"
							dir="ltr"
							bind:value={accessToken}
							oninput={persistLocal}
							onblur={onTokenBlurOrPaste}
							placeholder="EAAGm0PX4ZCpsBA..."
							class="w-full rounded-lg border border-white/15 bg-[#0f1626] px-2.5 py-1.5 font-mono text-xs sm:text-sm text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-none"
						/>
					</label>

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
		</section>

		<!-- מה לא צריך -->
		<section class="px-4 py-3">
			<h2 class="mb-1 text-base sm:text-lg font-black text-amber-200">מה לא צריך</h2>
			<ul class="space-y-0.5 text-sm sm:text-base text-gray-200 list-disc list-inside">
				<li>לא להשאיר שום דבר פתוח, ולא ללחוץ "Go live" בשום שידור.</li>
				<li>לא לשלוח סיסמה.</li>
			</ul>
		</section>

		<!-- לבטל בכל רגע -->
		<section class="px-4 py-3">
			<h2 class="mb-1 text-base sm:text-lg font-black text-amber-200">לבטל בכל רגע</h2>
			<p class="text-sm sm:text-base text-gray-200 leading-snug">
				בפייסבוק, בדף שלך: הגדרות ← "אפליקציות ואתרים" (Business Integrations) ← הסר את "GoFreeIL TV". השידורים בדף יפסיקו.
			</p>
			<div class="mt-2.5 max-w-md overflow-hidden rounded-xl border border-slate-300 bg-[#f0f2f5] text-slate-900 shadow" dir="ltr">
				<div class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
					<span class="font-bold text-slate-800">Settings › Business Integrations</span>
					<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="rtl">המחשה — ביטול חיבור</span>
				</div>
				<div class="p-2.5">
					<div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
						<div class="flex items-center gap-2">
							<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0866ff] font-black text-white text-[11px]">TV</div>
							<div>
								<div class="font-bold text-slate-900">GoFreeIL TV</div>
								<div class="text-[11px] text-emerald-700">Active</div>
							</div>
						</div>
						<span class="rounded-md bg-slate-200 px-2.5 py-1 font-semibold text-slate-800">Remove</span>
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
						<li>
							להוסיף את המתנדב כ-Tester:
							<a
								href="https://developers.facebook.com/apps/1485416470413957/roles/roles/"
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-300 underline hover:text-blue-200"
								dir="ltr"
							>developers.facebook.com/apps/1485416470413957/roles/roles/</a>
							← "Add People" ← Testers ← שם החשבון האישי שלו.
							<span class="text-gray-300">(באפליקציה במצב פיתוח רק בעלי תפקיד יכולים לתת הרשאות. ייתכן שצריך לבדוק את זה מחדש מול Meta אם יחליטו להרחיב.)</span>
						</li>
						<li>
							לקבל את הקוד בפרטי, להעתיק ללוח ולהריץ בשרת:
							<code class="rounded bg-black/40 px-2 py-0.5 text-xs sm:text-sm text-emerald-200" dir="ltr">python3 ~/fbcast/fbcast.py connect FILE "שם הדף"</code>
							(הקוד נמחק מיד). פקודה זו שולחת הזמנה מהדף שלנו, מאשרת בשם הדף של המתנדב ורושמת אותו.
						</li>
						<li>
							לוודא:
							<code class="rounded bg-black/40 px-2 py-0.5 text-xs sm:text-sm text-emerald-200" dir="ltr">python3 ~/fbcast/fbcast.py partners</code>.
							הדף אמור להופיע כ-OK. אם כתוב <code class="rounded bg-black/40 px-2 py-0.5 text-xs sm:text-sm" dir="ltr">NO ... allow_live=false</code>, בדוק שיש לדף 100 עוקבים.
						</li>
						<li>לאשר למתנדב שהחיבור נקלט, ולהבהיר שהשידור הבא יעלה בדף לבד.</li>
					</ol>

					<div class="border-t border-white/10 pt-2">
						<h3 class="mb-1 text-sm sm:text-base font-bold text-purple-200">מגבלות פיילוט (ידועות)</h3>
						<ul class="space-y-1 list-disc list-inside text-gray-300">
							<li>שליחה פרטית של קוד היא פתרון זמני ל-3 עד 5 מתנדבים. לקנה מידה של מאות צריך עמוד חיבור בדומיין שלנו עם כפתור "התחבר עם פייסבוק", שיעשה את משימות 3 ו-4 בלחיצה אחת. זה דורש אישור של Meta (App Review) ועדיין לא בוצע.</li>
							<li>לא נבדק עדיין שלייב משותף מופיע בפועל בדף של מתנדב: דף הבדיקה שלנו היה קטן מ-100 עוקבים. המדריך הזה הוא גם הבדיקה הראשונה.</li>
						</ul>
					</div>
				</div>
			</details>
		{/if}
	</div>
</div>
