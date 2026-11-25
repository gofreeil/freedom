<script lang="ts">
	// /admin/tv/facebook — מדריך חיבור דף פייסבוק לשידור חי משותף של חירות TV
	let { data } = $props();
	let copiedPerms = $state(false);

	const PERMISSIONS =
		'pages_show_list, business_management, pages_read_engagement, pages_manage_posts, pages_manage_metadata';

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

<div class="mx-auto max-w-5xl px-3 sm:px-4 py-3 sm:py-4" dir="rtl">
	<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
		<h1 class="flex items-center gap-2 text-lg sm:text-2xl font-black text-white">
			<span aria-hidden="true">📘</span> מדריך: לתת לחירותTV לשדר בדף הפייסבוק שלך (פיילוט)
		</h1>
		<a
			href="/admin/tv"
			class="ms-auto rounded-lg border border-white/15 px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-200 hover:bg-white/5"
		>
			← חזרה לחירות TV
		</a>
		<p class="basis-full text-xs sm:text-sm text-gray-200 leading-snug">
			<strong class="text-white">מה מקבלים:</strong> בכל שידור שלנו, הוא עולה גם בדף שלך כשידור חי, לבד. בלי לחיצה בכל שידור.
			<span class="mx-1 text-white/30">|</span>
			<strong class="text-white">מה עושים:</strong> חיבור חד-פעמי, כ-10 דקות. אנחנו לא מקבלים סיסמה, והטוקן שלך נמחק מיד אחרי החיבור.
		</p>
	</div>

	<!-- תנאים (חובה) -->
	<section class="mb-3 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2">
		<h2 class="mb-1 text-sm font-black text-amber-200">תנאים (חובה)</h2>
		<ul class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-100 list-disc list-inside">
			<li>דף פייסבוק (לא פרופיל אישי) שאתה אדמין בו.</li>
			<li>100 עוקבים לפחות בדף. פייסבוק לא מאפשר לייב משותף לדף קטן יותר (נבדק).</li>
			<li>חשבון פייסבוק בן 60 יום לפחות.</li>
		</ul>
	</section>

	<!-- מה אתה עושה (4 משימות) -->
	<section class="mb-3">
		<h2 class="mb-2 text-sm sm:text-base font-black text-white">מה אתה עושה (4 משימות)</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-start">
			<div class="space-y-2.5">
				<div class="rounded-xl border border-white/10 bg-[#141c2f]/90 p-3">
					<h3 class="mb-1.5 text-sm font-bold text-amber-200">משימה 1: שלח לנו שני פרטים</h3>
					<ul class="space-y-1 text-xs sm:text-sm text-gray-200 list-disc list-inside">
						<li>את שם הדף שלך.</li>
						<li>את שם החשבון האישי שלך בפייסבוק (או הקישור לפרופיל), כדי שנוסיף אותך לאפליקציה שלנו.</li>
					</ul>
				</div>

				<div class="rounded-xl border border-white/10 bg-[#141c2f]/90 p-3">
					<h3 class="mb-1.5 text-sm font-bold text-amber-200">משימה 2: אשר הצטרפות לאפליקציה</h3>
					<ul class="space-y-1 text-xs sm:text-sm text-gray-200 list-disc list-inside">
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
				</div>
			</div>

			<div class="space-y-2.5">
				<div class="rounded-xl border border-white/10 bg-[#141c2f]/90 p-3">
					<h3 class="mb-1.5 text-sm font-bold text-amber-200">משימה 3: הפק קוד חד-פעמי לדף</h3>
					<ol class="space-y-1 text-xs sm:text-sm text-gray-200 list-decimal list-inside">
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
								<code class="rounded bg-black/40 px-1.5 py-0.5 text-[11px] text-emerald-200" dir="ltr">{PERMISSIONS}</code>
								<button
									type="button"
									onclick={copyPermissions}
									class="rounded border border-white/15 px-2 py-0.5 text-[11px] font-bold text-gray-200 hover:bg-white/10 cursor-pointer"
								>
									{copiedPerms ? '✓ הועתק' : 'העתק'}
								</button>
							</div>
						</li>
						<li>לחץ <strong class="text-white">Generate Access Token</strong>. בחלון של פייסבוק בחר "Edit settings", בחר את הדף שלך, ואשר את כל ההרשאות.</li>
						<li>בשדה "User or Page" בחר את הדף שלך (לא "User Token").</li>
						<li>סמן את כל הטקסט בשדה "Access Token" והעתק (<span dir="ltr">Ctrl+A, Ctrl+C</span>).</li>
					</ol>
				</div>

				<div class="rounded-xl border border-white/10 bg-[#141c2f]/90 p-3">
					<h3 class="mb-1.5 text-sm font-bold text-amber-200">משימה 4: שלח לנו את הקוד, באופן פרטי</h3>
					<ul class="space-y-1 text-xs sm:text-sm text-gray-200 list-disc list-inside">
						<li>הדבק את הקוד בהודעה פרטית אל מנהל הפרויקט (לא בקבוצה ולא בפוסט).</li>
						<li>הקוד תקף כשעתיים בלבד, ואנחנו משתמשים בו פעם אחת לחיבור הדף ואז מוחקים אותו.</li>
						<li>תגיד לנו כשנשלח, ונאשר לך כשהחיבור נקלט.</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- מה לא צריך + לבטל בכל רגע -->
	<div class="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
		<section class="rounded-xl border border-white/10 bg-[#141c2f]/90 p-3">
			<h2 class="mb-1 text-sm font-bold text-white">מה לא צריך</h2>
			<ul class="space-y-0.5 text-xs sm:text-sm text-gray-200 list-disc list-inside">
				<li>לא להשאיר שום דבר פתוח, ולא ללחוץ "Go live" בשום שידור.</li>
				<li>לא לשלוח סיסמה.</li>
			</ul>
		</section>

		<section class="rounded-xl border border-white/10 bg-[#141c2f]/90 p-3">
			<h2 class="mb-1 text-sm font-bold text-white">לבטל בכל רגע</h2>
			<p class="text-xs sm:text-sm text-gray-200 leading-snug">
				בפייסבוק, בדף שלך: הגדרות ← "אפליקציות ואתרים" (Business Integrations) ← הסר את "GoFreeIL TV". השידורים בדף יפסיקו.
			</p>
		</section>
	</div>

	<!-- הוראות לצוות בלבד -->
	{#if !data.guest}
		<details class="rounded-xl border border-purple-400/25 bg-purple-950/20 px-3 py-2">
			<summary class="cursor-pointer text-sm font-black text-purple-200 select-none">
				רשימת משימות לצוות שלנו (לא למתנדב) ומגבלות פיילוט
			</summary>
			<div class="mt-2 space-y-2.5 text-xs sm:text-sm text-gray-200">
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
						<code class="rounded bg-black/40 px-1.5 py-0.5 text-[11px] text-emerald-200" dir="ltr">python3 ~/fbcast/fbcast.py connect FILE "שם הדף"</code>
						(הקוד נמחק מיד). פקודה זו שולחת הזמנה מהדף שלנו, מאשרת בשם הדף של המתנדב ורושמת אותו.
					</li>
					<li>
						לוודא:
						<code class="rounded bg-black/40 px-1.5 py-0.5 text-[11px] text-emerald-200" dir="ltr">python3 ~/fbcast/fbcast.py partners</code>.
						הדף אמור להופיע כ-OK. אם כתוב <code class="rounded bg-black/40 px-1 py-0.5 text-[11px]" dir="ltr">NO ... allow_live=false</code>, בדוק שיש לדף 100 עוקבים.
					</li>
					<li>לאשר למתנדב שהחיבור נקלט, ולהבהיר שהשידור הבא יעלה בדף לבד.</li>
				</ol>

				<div class="border-t border-white/10 pt-2">
					<h3 class="mb-1 text-xs sm:text-sm font-bold text-purple-200">מגבלות פיילוט (ידועות)</h3>
					<ul class="space-y-1 list-disc list-inside text-gray-300">
						<li>שליחה פרטית של קוד היא פתרון זמני ל-3 עד 5 מתנדבים. לקנה מידה של מאות צריך עמוד חיבור בדומיין שלנו עם כפתור "התחבר עם פייסבוק", שיעשה את משימות 3 ו-4 בלחיצה אחת. זה דורש אישור של Meta (App Review) ועדיין לא בוצע.</li>
						<li>לא נבדק עדיין שלייב משותף מופיע בפועל בדף של מתנדב: דף הבדיקה שלנו היה קטן מ-100 עוקבים. המדריך הזה הוא גם הבדיקה הראשונה.</li>
					</ul>
				</div>
			</div>
		</details>
	{/if}
</div>
