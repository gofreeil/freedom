<script lang="ts">
	// /club/charter — אמנת חברי מועדון יוצאים לחירות. טיוטא בלבד, פתוחה לכל גולש.
	const PRINCIPLES = [
		{
			icon: '🕊️',
			title: 'חירות',
			text: 'אנו מאמינים שכל אדם זכאי לחיות בחופשיות, לקבל החלטות על חייו ועל רכושו, ולא להיות תלוי בגורם אחד.'
		},
		{
			icon: '🤝',
			title: 'ערבות הדדית',
			text: 'חברי המועדון תומכים זה בזה: קונים אחד מהשני, ממליצים, משתפים ידע ומסייעים בשעת הצורך.'
		},
		{
			icon: '🔍',
			title: 'שקיפות',
			text: 'החלטות כספיות וארגוניות של הקהילה מתקבלות בגלוי, והחברים רשאים לראות ולהשפיע — כולל הצבעה על חלוקת התקציב.'
		},
		{
			icon: '⚖️',
			title: 'הגינות ויושר',
			text: 'בעסקאות, בהמלצות ובשיח — אומרים אמת, עומדים בהבטחות ולא מנצלים את אמון הקהילה.'
		},
		{
			icon: '🗣️',
			title: 'שיח מכבד',
			text: 'מותר לחלוק, אסור להשפיל. אין הסתה, איומים או הטרדה, בין חברים ובין החברים לצוות.'
		},
		{
			icon: '🔒',
			title: 'פרטיות',
			text: 'מידע אישי של חברים לא נמסר ולא נמכר לגורם חיצוני, ולא משתמשים בו מעבר למה שנועד לו.'
		}
	];

	const MEMBER_COMMITS = [
		'לפעול בהגינות ובכבוד כלפי כל חבר וחברה במועדון.',
		'לא לעשות שימוש לרעה בהטבות המועדון, ולא להעבירן לאדם שאינו חבר.',
		'לדווח לצוות על תקלה, ניצול או התנהגות לא ראויה שנתקלתי בהן.',
		'לשמור על סודיות המידע שנחשף לי בקבוצות סגורות של הקהילה.',
		'להשתתף, ככל יכולתי, בהצבעות ובהחלטות של הקהילה.'
	];

	const CLUB_COMMITS = [
		'להעמיד לרשות החברים את הטבות המועדון כפי שפורסמו, ולעדכן על כל שינוי מראש.',
		'לנהל את כספי המועדון בשקיפות ולפרסם לחברים את חלוקת התקציב ותוצאות ההצבעות.',
		'להגן על פרטיות החברים ועל המידע שמסרו.',
		'לטפל בפניות ובתלונות בהגינות ובזמן סביר.',
		'לאפשר לכל חבר לפרוש בכל עת, ללא קנס וללא הצדקה.'
	];
</script>

<svelte:head>
	<title>אמנת המועדון | יוצאים לחירות</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-4" dir="rtl">
	<div class="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
		<h1 class="flex items-center gap-2.5 text-2xl font-black text-white sm:text-3xl">
			<span aria-hidden="true">📜</span> אמנת חברי מועדון יוצאים לחירות
		</h1>
		<span class="rounded-full border border-white/15 px-2.5 py-0.5 text-xs font-bold text-gray-300">
			🚧 טיוטא בלבד — טרם אושרה
		</span>
		<a href="/club" class="text-base font-bold text-amber-200 hover:underline">← למועדון</a>
		<p class="basis-full text-base sm:text-lg leading-snug text-gray-200">
			אמנה זו מגדירה את הערכים, ההתחייבויות ההדדיות והכללים של קהילת המועדון. הצטרפות למועדון היא הסכמה לה.
		</p>
	</div>

	<div class="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#141c2f]/90">
		<section>
			<h2 class="border-b border-white/10 bg-white/5 px-4 py-1 text-base sm:text-lg font-black text-amber-200">1. העקרונות שלנו</h2>
			<ul class="divide-y divide-white/5">
				{#each PRINCIPLES as p}
					<li class="grid grid-cols-1 gap-x-3 px-4 py-1 md:grid-cols-[13rem_1fr]">
						<h3 class="text-lg font-bold text-white"><span aria-hidden="true">{p.icon}</span> {p.title}</h3>
						<p class="text-base leading-snug text-gray-200">{p.text}</p>
					</li>
				{/each}
			</ul>
		</section>

		<div class="grid divide-y divide-white/10 md:grid-cols-2 md:divide-x md:divide-y-0 md:divide-x-reverse">
			<section>
				<h2 class="border-b border-white/10 bg-white/5 px-4 py-1 text-base sm:text-lg font-black text-amber-200">2. אני, כחבר/ה, מתחייב/ת</h2>
				<ul class="list-disc space-y-0.5 px-7 py-1.5 text-base leading-snug text-gray-200">
					{#each MEMBER_COMMITS as c}<li>{c}</li>{/each}
				</ul>
			</section>
			<section>
				<h2 class="border-b border-white/10 bg-white/5 px-4 py-1 text-base sm:text-lg font-black text-amber-200">3. המועדון מתחייב</h2>
				<ul class="list-disc space-y-0.5 px-7 py-1.5 text-base leading-snug text-gray-200">
					{#each CLUB_COMMITS as c}<li>{c}</li>{/each}
				</ul>
			</section>
		</div>

		<section>
			<h2 class="border-b border-white/10 bg-white/5 px-4 py-1 text-base sm:text-lg font-black text-amber-200">4. הפרת האמנה ופרישה</h2>
			<p class="px-4 py-1.5 text-base leading-snug text-gray-200">
				הפרה של האמנה תטופל בהתראה, ובמקרים חמורים או חוזרים — בהשעיה או בהפסקת החברות, לאחר שניתנה לחבר הזדמנות להשמיע את
				דבריו. כל חבר רשאי לפרוש בכל עת. שינוי באמנה ייעשה בפרסום מראש ובהצבעת החברים.
			</p>
		</section>
	</div>

	<p class="mt-2 text-center text-sm text-gray-400">
		נוסח זה הוא טיוטא לדיון ואינו מהווה הסכם מחייב עד לאישורו הסופי.
	</p>
</div>
