<script lang="ts">
	import { onMount } from 'svelte';

	interface Site {
		title: string;
		description: string;
		href?: string;
		image?: string;
		comingSoon?: boolean;
		mobileHide?: boolean;
	}

	const columns: { heading: string; sites: Site[] }[] = [
		{
			heading: 'קהילה',
			sites: [
				{
					title: 'קהילה בשכונה',
					description: 'הקהילה החברתית של יוצאים לחירות בשכונה שלך.',
					href: 'https://community-blush.vercel.app/',
					image: '/images/community-neighborhood.png'
				},
				{
					title: 'בתי דין ופיוס',
					description: 'מתנדבים לתת לך עזרה מלאה בדין / פיוס בכל סיכסוך.',
					href: 'https://chachmei-haeda.vercel.app/',
					image: '/images/bati-hapius.png'
				},
				{
					title: 'הגמ"ח הארצי',
					description: 'כל הגמחים תחת קורת גג אחת.',
					href: 'https://national-gemach.vercel.app/',
					image: '/images/gemach-harzi.png'
				}
			]
		},
		{
			heading: 'משילות',
			sites: [
				{
					title: 'ועדי שכונות',
					description: 'מהפכת משילות העם על המוסדות — הכר והשתתף.',
					href: 'https://www.melecshop.com/page/peace-on-earth_VRHH',
					image: '/images/news/vaadei-shchunot.png'
				},
				{
					title: 'מבקר רשויות המדינה',
					description: 'מבקרים את הרשויות, ממצים את זכות התושב.',
					href: 'https://right-to-live.vercel.app/',
					image: '/images/mevaker-rashuyot.png'
				},
				{
					title: 'דירוג ציבורי',
					description: 'העם מדרג את הרשויות ועובדי הציבור.',
					href: 'https://public-rating-il.vercel.app/',
					image: '/images/public-rating.jpeg'
				},
				{
					title: 'המומחים',
					description: 'פועלים יחד לפתרון בעיות ארציות.',
					href: 'https://the-experts-rouge.vercel.app/',
					image: '/images/the-experts.png'
				},
				{
					title: 'משאלי העם',
					description: 'הבע דעתך על הסוגיות האקטואליות.',
					href: 'https://referendum-azure.vercel.app/',
					image: '/images/referendum.png'
				}
			]
		},
		{
			heading: 'כלכלה',
			sites: [
				{
					title: 'קבוצת רכישה',
					description: 'הצטרף לקבוצת הרכישה שלנו והוזל מיד את ההוצאות!',
					href: 'https://purchasing-groups.vercel.app/',
					image: '/images/whatsapp_cta.png'
				},
				{
					title: 'השקעות קבוצתיות',
					description: 'התחבר עם קבוצת המשקיעים החברתית שלנו.',
					href: 'https://www.melecshop.com/page/free',
					image: '/images/partners/investments.png'
				},
				{
					title: 'בעלי המקצוע שלנו',
					description: 'בעלי מקצוע כשירים שחתמו על תנאי הקהילה ונותנים הטבות.',
					href: 'https://index-chi-sage.vercel.app/',
					image: '/images/professionals.png'
				},
				{
					title: 'חנות החירות',
					description: 'בקרוב.',
					image: '/images/freedom-store.png',
					comingSoon: true
				}
			]
		}
	];

	// רשתות חברתיות — קישורים זמניים (mockup)
	const socials: { name: string; href: string; path: string }[] = [
		{
			name: 'Facebook',
			href: '#',
			path: '<path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07Z"/>'
		},
		{
			name: 'Instagram',
			href: '#',
			path: '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-10.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z"/>'
		},
		{
			name: 'YouTube',
			href: '#',
			path: '<path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z"/>'
		},
		{
			name: 'TikTok',
			href: '#',
			path: '<path d="M19.32 5.56a5.32 5.32 0 0 1-3.27-1.1 5.32 5.32 0 0 1-2.05-3.32V0h-3.6v14.65a3.22 3.22 0 0 1-5.79 1.94 3.22 3.22 0 0 1 4.27-4.62v-3.66a6.83 6.83 0 0 0-5.78 11.62A6.83 6.83 0 0 0 14.0 14.7V7.5a8.9 8.9 0 0 0 5.32 1.74v-3.6Z"/>'
		},
		{
			name: 'X',
			href: '#',
			path: '<path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93Zm-1.29 19.5h2.04L6.48 3.24H4.3L17.61 20.65Z"/>'
		},
		{
			name: 'Telegram',
			href: '#',
			path: '<path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.57 8.16-1.86 8.79c-.14.62-.51.77-1.03.48l-2.85-2.1-1.37 1.32c-.15.15-.28.28-.57.28l.2-2.9 5.28-4.77c.23-.2-.05-.32-.36-.12l-6.52 4.1-2.81-.88c-.61-.19-.62-.61.13-.9l10.98-4.23c.51-.19.96.12.79.95Z"/>'
		},
		{
			name: 'WhatsApp',
			href: '#',
			path: '<path d="M.06 24l1.68-6.16a11.87 11.87 0 0 1-1.6-5.96C.15 5.32 5.5 0 12.06 0a11.82 11.82 0 0 1 8.42 3.5 11.74 11.74 0 0 1 3.49 8.38c0 6.56-5.35 11.9-11.92 11.9a11.94 11.94 0 0 1-5.7-1.45L.06 24ZM6.6 20.13c1.68.99 3.28 1.59 5.45 1.59 5.45 0 9.9-4.43 9.9-9.88a9.85 9.85 0 0 0-9.88-9.9C6.6 1.94 2.16 6.37 2.16 11.82c0 2.28.67 3.99 1.79 5.78l-.99 3.63 3.64-.95.01-.15Zm10.93-5.45c-.07-.12-.27-.2-.56-.34-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42Z"/>'
		}
	];

	// אבקת קסם — חלקיקים דטרמיניסטיים (כדי למנוע אי-התאמת hydration)
	const seeded = (n: number) => {
		const x = Math.sin(n) * 10000;
		return x - Math.floor(x);
	};
	const dustStarts = [35, 50, 65]; // שלוש נקודות מוצא מתחת לכותרת
	const dustStreams = [17, 50, 83]; // מרכזי שלושת העמודים (% רוחב)
	const magicDust = Array.from({ length: 36 }, (_, i) => {
		const stream = i % 3;
		const r1 = seeded(i + 1);
		const r3 = seeded(i + 13.7);
		const r4 = seeded(i + 21.1);
		return {
			startLeft: dustStarts[stream] + (r1 * 6 - 3),
			endLeft: dustStreams[stream] + (r1 * 18 - 9),
			delay: (r3 * 1).toFixed(2),
			duration: (1.4 + r4 * 0.9).toFixed(2),
			size: (2.5 + r1 * 3.8).toFixed(1)
		};
	});

	// אבקת קסם קטנה על שלשלת הכותרות (glow-bar) — ה-delay יחסי ל---reveal-delay של העמודה,
	// כלומר הניצנוץ מתחיל רק כשפירורי הקסם נוגעים בכותרת הקטנה
	const barSparks = Array.from({ length: 7 }, (_, i) => {
		const r1 = seeded(i + 31.3);
		const r2 = seeded(i + 41.9);
		const r3 = seeded(i + 53.1);
		return {
			left: (8 + r1 * 84).toFixed(1),
			delay: (r2 * 0.6).toFixed(2),
			duration: (0.45 + r3 * 0.3).toFixed(2),
			size: (2 + r1 * 2.4).toFixed(1)
		};
	});

	// האנימציות מתחילות רק כשהמשתמש גולל וחושף את הסקציה
	let revealed = $state(false);
	let dustActive = $state(false);
	let revealEl: HTMLElement;
	onMount(() => {
		let timer: ReturnType<typeof setTimeout>;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					revealed = true;
					dustActive = true;
					timer = setTimeout(() => (dustActive = false), 4500);
					observer.disconnect();
				}
			},
			{ threshold: 0.4 }
		);
		observer.observe(revealEl);
		return () => {
			observer.disconnect();
			clearTimeout(timer);
		};
	});

	// הסרטון נטען רק בלחיצה — מאיץ משמעותית את טעינת הדף
	let videoPlaying = $state(false);

	// מונה חברים — ספירה מהירה מ-1,000 עד 10,000
	const memberFrom = 1000;
	const memberTo = 10000;
	let memberCount = $state(memberFrom);
	let memberDisplay = $derived(memberCount.toLocaleString('en-US'));
	onMount(() => {
		const duration = 1800;
		const start = performance.now();
		let raf: number;
		const tick = (now: number) => {
			const t = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - t, 3);
			memberCount = Math.round(memberFrom + eased * (memberTo - memberFrom));
			if (t < 1) raf = requestAnimationFrame(tick);
			else memberCount = memberTo;
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	// ===== חבילת עמודות (deck) — תצוגת נייד בלבד =====
	// שלושת העמודים נערמים זה מאחורי זה באותו מקום; הפעיל לפנים,
	// האחרים מוקטנים, חשוכים ושקופים, וכותרותיהם מציצות מעליו.
	// החלקה אופקית או הקשה על כותרת אחורית מגלגלות את העמוד הנבחר קדימה.
	let track: HTMLElement;
	let activeCol = $state(1);

	// היסט עמודה ביחס לפעיל (-2..+2 בעבור 3 עמודות): קובע מאיזה צד הקלף יושב
	const offsetFor = (i: number) => i - activeCol;

	function onSlideClick(e: MouseEvent, i: number) {
		if (window.innerWidth >= 768) return;
		if (activeCol !== i) {
			e.preventDefault();
			e.stopPropagation();
			activeCol = i;
		}
	}

	let dragStartX = 0;
	let dragStartY = 0;
	let dragging = false;
	const SWIPE_THRESHOLD = 45;

	function onPointerDown(e: PointerEvent) {
		if (window.innerWidth >= 768) return;
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		dragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
	}

	function onPointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		const dx = e.clientX - dragStartX;
		const dy = e.clientY - dragStartY;
		// מתעלמים מתנועה שאינה אופקית מובהקת (כדי לא להפריע לגלילה אנכית)
		if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
		// התוכן זז עם האצבע: גרירה שמאלה -> הקלף הימני (offset שלילי) מגיע למרכז,
		// כלומר activeCol יורד; גרירה ימינה -> activeCol עולה.
		if (dx < 0) activeCol = Math.max(0, activeCol - 1);
		else activeCol = Math.min(columns.length - 1, activeCol + 1);
	}

	// אנימציה חד-פעמית של "אצבע מנגבת את המסך" שמדגימה למשתמש
	// שאפשר לדפדף בין הקלפים. רצה רק כשהקרוסלה נכנסת לתצוגה בנייד,
	// פעם אחת בלבד לכל טעינת דף.
	let demoFingerActive = $state(false);
	let demoPlayed = false;

	function runSwipeDemo() {
		demoFingerActive = true;
		setTimeout(() => (activeCol = 0), 280);
		setTimeout(() => (activeCol = 1), 720);
		setTimeout(() => (demoFingerActive = false), 1050);
	}

	onMount(() => {
		if (typeof window === 'undefined') return;
		if (!window.matchMedia('(max-width: 767px)').matches) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !demoPlayed) {
					demoPlayed = true;
					setTimeout(runSwipeDemo, 200);
					io.disconnect();
				}
			},
			{ threshold: 0.4 }
		);
		io.observe(track);
		return () => io.disconnect();
	});
</script>

<section class="flex items-center justify-center pt-0 pb-4 md:pb-6">
	<h1
		class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent
		       text-5xl md:text-7xl lg:text-8xl font-black text-center leading-tight px-4"
	>
		יוצאים לחירות
	</h1>
</section>

<section class="max-w-5xl mx-auto px-6 pb-6 text-center" dir="rtl">
	<p class="intro-p text-base md:text-xl text-gray-300 leading-snug">
		<span
			class="font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400
			       bg-clip-text text-transparent"
		>
			יוצאים לחירות —
		</span>
		הינה תנועה חברתית, העוסקת לקדם ולשפר את החברה בישראל לחברה יותר
		אחראית, סולידרית וחופשיה. התנועה עוסקת לשחרר את התושבים מריכוזי הכח הנמצאים היום
		אצל קומץ השולטים בבנקים, בתקשורת, בכלכלה, בפוליטיקה וברשויות המדינה.
	</p>
	<p class="intro-p text-base md:text-xl text-gray-300 leading-snug mt-3">
		<span class="font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">החזון —</span>
		התאחדות התושבים, ביזור הכח הריכוזי שבמוסדות המדינה, פיקוח, ביקורת, ומעורבות של העם
		בקבלת ההחלטות.
	</p>
	<p class="intro-p text-base md:text-xl text-gray-300 leading-snug mt-3">
		<span class="font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">הפעילות —</span>
		יוצאים לחירות פיתחה אפליקציות המקדמות את המשילות, הקימה רכזים חברתיים בשכונות ברחבי
		הארץ, וקהילה גדולה המקדמת את ערכי החופש, האחווה, והמשילות של העם על מוסדותיו!
	</p>
</section>

<section class="max-w-2xl mx-auto px-6 pb-0">
	<div
		class="relative w-full overflow-hidden rounded-2xl shadow-2xl"
		style="padding-top:{videoPlaying ? '56.25%' : '46.875%'}"
	>
		{#if videoPlaying}
			<iframe
				class="absolute inset-0 h-full w-full"
				src="https://www.youtube-nocookie.com/embed/CjBbU2ZOsa8?start=2&autoplay=1"
				title="יוצאים לחירות"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerpolicy="strict-origin-when-cross-origin"
				allowfullscreen
			></iframe>
		{:else}
			<button
				type="button"
				class="group absolute inset-0 h-full w-full cursor-pointer border-0 p-0"
				onclick={() => (videoPlaying = true)}
				aria-label="נגן את הסרטון יוצאים לחירות"
			>
				<img
					src="https://i.ytimg.com/vi/CjBbU2ZOsa8/sddefault.jpg"
					alt="יוצאים לחירות"
					class="h-full w-full object-cover"
					style="object-position:50% 33%"
					loading="lazy"
				/>
				<span
					class="absolute inset-0 flex items-center justify-center bg-black/25
					       transition-colors group-hover:bg-black/10"
				>
					<svg
						class="h-14 w-20 drop-shadow-lg transition-transform group-hover:scale-110 md:h-16 md:w-24"
						viewBox="0 0 68 48"
						aria-hidden="true"
					>
						<path
							d="M66.5 7.5c-.8-3-3-5.2-6-6C55 0 34 0 34 0S13 0 7.5 1.5c-3 .8-5.2 3-6 6C0 13 0 24 0 24s0 11 1.5 16.5c.8 3 3 5.2 6 6C13 48 34 48 34 48s21 0 26.5-1.5c3-.8 5.2-3 6-6C68 35 68 24 68 24s0-11-1.5-16.5z"
							fill="#f00"
						/>
						<path d="M27 34l18-10-18-10z" fill="#fff" />
					</svg>
				</span>
			</button>
		{/if}
	</div>
</section>

<section class="max-w-4xl mx-auto px-6 pb-14 text-center" dir="rtl">
	<p class="text-xl md:text-2xl font-black text-gray-200">
		יוצאים לחירות מונה
		<span
			class="mx-1 inline-block tabular-nums text-2xl md:text-3xl
			       bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent"
		>{memberDisplay}</span>
		חברים וממשיכים לעלות!
	</p>
</section>

<section class="max-w-6xl mx-auto px-6 pb-2 md:pb-20" dir="rtl" class:revealed>
	<h2
		class="mx-auto mb-3 max-w-6xl text-center text-2xl md:text-4xl font-black leading-snug
		       bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
	>
		מודל המשילות של העם, מתפקד ומתקדם על ידי רשת של כלים&nbsp;ופלטפורמות חדשניות:
	</h2>

	<div class="magic-dust" aria-hidden="true" bind:this={revealEl}>
		{#if dustActive}
			{#each magicDust as p, i (i)}
				<span
					class="dust-particle"
					style="left:{p.startLeft}%; width:{p.size}px; height:{p.size}px;
					       --start-left:{p.startLeft}%; --end-left:{p.endLeft}%;
					       animation-delay:{p.delay}s; animation-duration:{p.duration}s;"
				></span>
			{/each}
		{/if}
	</div>
	<div
		class="cols-container md:items-stretch md:gap-12"
		bind:this={track}
		onpointerdown={onPointerDown}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
	>
		{#if demoFingerActive}
			<div class="finger-demo" aria-hidden="true">
				<img src="/images/finger.png" alt="" />
			</div>
		{/if}
		{#each columns as column, i (column.heading)}
			{#if i > 0}
				<div
					class="hidden md:block w-px self-stretch
					       bg-gradient-to-b from-transparent via-slate-400/40 to-transparent"
				></div>
			{/if}
			<div
				class="col-slide {i === 1 ? 'md:-mt-12' : ''}"
				class:is-active={activeCol === i}
				data-offset={offsetFor(i)}
				onclickcapture={(e) => onSlideClick(e, i)}
				style="--reveal-delay:{i === 1 ? '1.7s' : '2.3s'}"
			>
				<div class="col-slide-inner flex flex-1 flex-col">
				<div class="mb-12 flex flex-col items-center">
					<h3
						class="col-heading bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent
						       text-4xl md:text-6xl font-black text-center"
					>
						{column.heading}
					</h3>
					<span class="glow-bar">
						<span class="glow-bar-line glow-bar-line-start"></span>
						<span class="glow-bar-gem"></span>
						<span class="glow-bar-line glow-bar-line-end"></span>
						{#each barSparks as sp, si (si)}
							<span
								class="bar-spark"
								style="left:{sp.left}%; width:{sp.size}px; height:{sp.size}px;
								       animation-delay:calc(var(--reveal-delay) + {sp.delay}s);
								       animation-duration:{sp.duration}s;"
							></span>
						{/each}
					</span>
				</div>
				<div class="flex flex-col {i === 0 ? 'gap-10' : 'gap-4'}">
					{#each column.sites as site, si (site.title)}
						<div class="relative {site.mobileHide ? 'hidden md:block' : 'block'}">
						{#if si > 0}
							<div class="rope-connector {i === 0 ? 'rope-connector-wide' : ''}" aria-hidden="true">
								<span class="rope-unit">
									<span class="rope-hole rope-hole-top"></span>
									<span class="rope-hole rope-hole-bot"></span>
									<img class="rope-img" src="/images/rope.png" alt="" />
								</span>
								<span class="rope-unit rope-unit-flip">
									<span class="rope-hole rope-hole-top"></span>
									<span class="rope-hole rope-hole-bot"></span>
									<img class="rope-img" src="/images/rope.png" alt="" />
								</span>
							</div>
						{/if}
						<svelte:element
							this={site.href ? 'a' : 'div'}
							href={site.href}
							target={site.href ? '_blank' : undefined}
							rel={site.href ? 'noopener noreferrer' : undefined}
							class="fx-banner fx-lift group relative block overflow-hidden rounded-2xl border border-purple-500/20 bg-white/5
							       transition-colors hover:border-purple-500/50 hover:bg-white/10
							       {site.comingSoon && !site.image ? 'opacity-60' : ''}"
						>
							<div class="relative {i === 0 ? 'h-auto' : i === 1 ? (si === 2 ? 'h-44' : si === 3 ? 'h-[137px]' : si === 4 ? 'h-[138px]' : 'h-28') : i === 2 ? (si === 0 ? 'h-36' : si === 1 ? 'h-44' : si === 3 ? 'h-52' : 'h-40') : 'h-28'} w-full overflow-hidden bg-slate-800">
								{#if site.image}
									<img
										src={site.image}
										alt={site.title}
										class="{i === 0 ? 'h-auto' : 'h-full'} w-full object-cover transition-transform group-hover:scale-105"
										decoding="async"
										loading="lazy"
									/>
								{:else}
									<div
										class="flex h-full w-full items-center justify-center
										       bg-gradient-to-br from-blue-500/20 to-purple-500/20"
									>
										<span class="text-2xl font-black text-purple-300/70">{site.title}</span>
									</div>
								{/if}
								<div
									class="absolute inset-0 flex items-center justify-center px-4
									       bg-slate-950/85 opacity-0 transition-opacity duration-300
									       group-hover:opacity-100"
								>
									<p class="text-center text-sm font-semibold leading-snug text-gray-100">
										{site.description}
									</p>
								</div>
							</div>
							<div class="px-10 py-3 bg-black">
								<p class="text-center text-base font-black leading-tight text-white">{site.title}</p>
							</div>
						</svelte:element>
						</div>
					{/each}
				</div>
				</div>
			</div>
		{/each}
	</div>

	<div
		class="mx-auto mt-20 h-px max-w-3xl
		       bg-gradient-to-r from-transparent via-slate-400/40 to-transparent"
	></div>

	<p
		class="mx-auto mt-12 max-w-3xl text-center text-lg md:text-2xl font-black
		       bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400
		       bg-clip-text text-transparent"
	>
		התקשורת שלנו עצמאית - מסקרים את אירועי המדינה מזווית זכות התושב!
	</p>

	<a
		href="https://chat.whatsapp.com/Bek6Bh0fJMJ63ozhIjlgCz"
		target="_blank"
		rel="noopener noreferrer"
		class="mx-auto mt-6 block w-full max-w-3xl transition-transform hover:scale-[1.02]"
	>
		<img
			src="/images/news.png"
			alt="חדשות"
			class="w-full rounded-2xl"
			loading="lazy"
			decoding="async"
		/>
	</a>

	<h2
		class="mt-12 text-center text-2xl md:text-4xl font-black leading-snug
		       bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
	>
		עקבו אחרינו ברשתות החברתיות
	</h2>

	<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
		{#each socials as s (s.name)}
			<a
				href={s.href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={s.name}
				class="social-icon flex h-12 w-12 items-center justify-center rounded-full
				       border border-purple-500/20 bg-white/5 text-gray-300
				       transition-all hover:scale-110 hover:border-purple-500/50 hover:bg-white/10 hover:text-white"
			>
				<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					{@html s.path}
				</svg>
			</a>
		{/each}
	</div>
</section>

<style>
	/* ---- אינטראקציות ריחוף לבאנרים (שלט עץ תלוי על חבלים) ---- */
	.fx-banner {
		transition:
			transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1),
			border-color 0.25s ease,
			background-color 0.25s ease;
		transform-origin: top center;
	}

	/* הרמה קלה כלפי מעלה בריחוף */
	.fx-lift:hover {
		transform: translateY(-6px) rotate(-0.6deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.fx-banner:hover {
			animation: none !important;
			transform: none !important;
		}
	}

	/* ---- חבלי חיבור בין הבאנרים (שרשרת תלויה) ---- */
	.rope-connector {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 100%;
		height: 64px;
		margin-bottom: -24px;
		display: flex;
		justify-content: space-between;
		padding: 0 4%;
		pointer-events: none;
		z-index: 10;
	}
	.rope-connector-wide {
		height: 88px;
	}
	.rope-unit {
		position: relative;
		width: 15px;
		height: 100%;
	}
	.rope-unit-flip {
		transform: scaleX(-1);
	}
	.rope-img {
		position: relative;
		z-index: 2;
		width: 100%;
		height: 100%;
		display: block;
		filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55));
	}
	.rope-hole {
		position: absolute;
		left: 50%;
		width: 26px;
		height: 12px;
		transform: translateX(-50%);
		border-radius: 50%;
		background: radial-gradient(
			ellipse at center,
			#000 35%,
			#05060a 68%,
			rgba(5, 6, 10, 0) 100%
		);
		box-shadow:
			inset 0 2px 3px rgba(0, 0, 0, 0.95),
			0 1px 1px rgba(255, 255, 255, 0.06);
		z-index: 1;
	}
	.rope-hole-top {
		top: -3px;
	}
	.rope-hole-bot {
		bottom: -3px;
	}

	.intro-p {
		text-align: justify;
		text-align-last: center;
	}

	.magic-dust {
		position: relative;
		width: 100%;
		height: 4rem;
		margin-bottom: 0.5rem;
		pointer-events: none;
		overflow: visible;
		animation: dust-fade 3.6s linear forwards;
		animation-play-state: paused;
	}

	.revealed .magic-dust,
	.revealed .glow-bar,
	.revealed .glow-bar-line,
	.revealed .glow-bar-gem,
	.revealed .col-heading,
	.revealed .bar-spark {
		animation-play-state: running;
	}

	/* הכותרות הקטנות מתחילות להאיר רק כשפירורי הקסם נוגעים בהן —
	   ה-delay נקבע פר-עמודה דרך --reveal-delay (העמודה האמצעית מורמת ולכן מוקדמת יותר) */
	.col-heading {
		animation: heading-illuminate 1.7s ease-out var(--reveal-delay, 2.3s) both;
		animation-play-state: paused;
	}

	@keyframes heading-illuminate {
		0% {
			filter: brightness(1);
		}
		18% {
			filter: brightness(1.7) drop-shadow(0 0 14px rgba(186, 230, 253, 0.85));
		}
		36% {
			filter: brightness(1.18) drop-shadow(0 0 6px rgba(186, 230, 253, 0.4));
		}
		58% {
			filter: brightness(1.7) drop-shadow(0 0 16px rgba(216, 180, 254, 0.8));
		}
		78% {
			filter: brightness(1.22) drop-shadow(0 0 7px rgba(186, 230, 253, 0.45));
		}
		100% {
			filter: brightness(1.12) drop-shadow(0 0 8px rgba(186, 230, 253, 0.45));
		}
	}

	@keyframes dust-fade {
		0%,
		72% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@media (min-width: 768px) {
		.magic-dust {
			height: 6rem;
		}
	}

	.dust-particle {
		position: absolute;
		top: 0;
		border-radius: 50%;
		background: radial-gradient(circle, #ffffff 0%, #7dd3fc 55%, rgba(125, 211, 252, 0) 100%);
		box-shadow:
			0 0 6px rgba(186, 230, 253, 0.9),
			0 0 14px rgba(56, 189, 248, 0.6);
		opacity: 0;
		animation-name: dust-flow;
		animation-timing-function: ease-in;
		animation-iteration-count: infinite;
		will-change: transform, top, left, opacity;
	}

	@keyframes dust-flow {
		0% {
			top: 0%;
			left: var(--start-left, 50%);
			transform: translate(-50%, -50%) scale(0);
			opacity: 0;
		}
		14% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
		78% {
			opacity: 0.85;
		}
		100% {
			top: 130%;
			left: var(--end-left, 50%);
			transform: translate(-50%, -50%) scale(0.35);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.magic-dust {
			display: none;
		}
	}

	.glow-bar {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 150px;
		margin-top: 0.55rem;
		animation: bar-charge 0.7s ease-out calc(var(--reveal-delay, 2.3s) + 0.6s) both;
		animation-play-state: paused;
	}

	.bar-spark {
		position: absolute;
		top: 50%;
		border-radius: 50%;
		pointer-events: none;
		background: radial-gradient(circle, #ffffff 0%, #bae6fd 55%, rgba(125, 211, 252, 0) 100%);
		box-shadow:
			0 0 5px rgba(241, 245, 249, 0.95),
			0 0 11px rgba(125, 211, 252, 0.7);
		opacity: 0;
		animation-name: bar-sparkle;
		animation-timing-function: ease-in-out;
		animation-iteration-count: 2;
		animation-fill-mode: both;
		will-change: transform, opacity;
	}

	@keyframes bar-sparkle {
		0% {
			transform: translate(-50%, -50%) scale(0);
			opacity: 0;
		}
		35% {
			transform: translate(-50%, -180%) scale(1);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -340%) scale(0);
			opacity: 0;
		}
	}

	@keyframes bar-charge {
		0%,
		100% {
			filter: brightness(1);
			transform: scale(1);
		}
		45% {
			filter: brightness(2.3) drop-shadow(0 0 10px rgba(186, 230, 253, 0.9));
			transform: scale(1.14);
		}
	}

	.glow-bar-line {
		flex: 1;
		height: 2px;
		box-shadow:
			0 0 8px rgba(241, 245, 249, 0.85),
			0 0 18px rgba(203, 213, 225, 0.5);
		animation: line-reveal 0.5s cubic-bezier(0.22, 1, 0.36, 1)
			calc(var(--reveal-delay, 2.3s) + 0.2s) both;
		animation-play-state: paused;
	}

	.glow-bar-line-start {
		background: linear-gradient(
			90deg,
			#ffffff 0%,
			rgba(203, 213, 225, 0.6) 55%,
			rgba(241, 245, 249, 0.98) 93%,
			rgba(241, 245, 249, 0.98) 97%,
			transparent 100%
		);
		transform-origin: left;
		clip-path: polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%);
	}

	.glow-bar-line-end {
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(241, 245, 249, 0.98) 3%,
			rgba(241, 245, 249, 0.98) 7%,
			rgba(203, 213, 225, 0.6) 45%,
			#ffffff 100%
		);
		transform-origin: right;
		clip-path: polygon(12% 0, 100% 0, 100% 100%, 12% 100%, 0 50%);
	}

	.glow-bar-gem {
		width: 9px;
		height: 9px;
		flex-shrink: 0;
		background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%);
		box-shadow:
			0 0 8px rgba(241, 245, 249, 0.95),
			0 0 18px rgba(203, 213, 225, 0.6);
		animation: gem-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)
			calc(var(--reveal-delay, 2.3s) + 0.08s) both;
		animation-play-state: paused;
	}

	@keyframes line-reveal {
		0% {
			transform: scaleX(0);
			opacity: 0;
			filter: brightness(3);
		}
		60% {
			opacity: 1;
		}
		100% {
			transform: scaleX(1);
			opacity: 1;
			filter: brightness(1);
		}
	}

	@keyframes gem-pop {
		0% {
			transform: rotate(45deg) scale(0);
			opacity: 0;
			filter: brightness(3);
		}
		60% {
			opacity: 1;
		}
		100% {
			transform: rotate(45deg) scale(1);
			opacity: 1;
			filter: brightness(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.glow-bar,
		.glow-bar-line,
		.glow-bar-gem,
		.col-heading {
			animation: none;
		}

		.bar-spark {
			display: none;
		}
	}

	/* ===== חבילת עמודות (deck) — תצוגת נייד בלבד ===== */
	/* שלושת העמודים נערמים באותו תא רשת. הפעיל בקדמה, האחרים מאחוריו
	   מוקטנים, חשוכים ושקופים יותר, ומורמים כלפי מעלה כדי שכותרותיהם
	   תציצנה מעל הפעיל ותרמוזנה למשתמש שאפשר לדפדף אליהם. */
	.cols-container {
		display: grid;
		grid-template-columns: 1fr;
		align-items: start;
		justify-items: stretch;
		position: relative;
		perspective: 1400px;
		overflow: visible;
		touch-action: pan-y;
		-webkit-user-select: none;
		user-select: none;
	}

	.col-slide {
		grid-column: 1;
		grid-row: 1;
		display: flex;
		transform-origin: top center;
		transform-style: preserve-3d;
		/* מעבר חלק ועקבי — קל בכניסה, רגוע ביציאה — שמאפשר למשתמש
		   לעקוב אחר תנועת הקלף בצורה ברורה ולא קופצנית */
		transition:
			transform 0.9s cubic-bezier(0.35, 0.05, 0.2, 1),
			opacity 0.75s cubic-bezier(0.35, 0.05, 0.2, 1),
			filter 0.75s cubic-bezier(0.35, 0.05, 0.2, 1);
		will-change: transform, opacity, filter;
	}

	/* ההיסט נמדד ביחס לפעיל. בעיתוי RTL: עמודות שבהמשך ה-DOM (offset>0)
	   יושבות מצד שמאל פיזית, ועמודות שלפניו (offset<0) מצד ימין —
	   המעבר נראה ככיוון ה"ניגוב" של המשתמש. */
	.col-slide[data-offset='0'] {
		transform: translateX(0) scale(1) rotateY(0);
		opacity: 1;
		filter: none;
		z-index: 30;
	}
	.col-slide[data-offset='1'] {
		transform: translateX(-34%) scale(0.62) rotateY(22deg);
		opacity: 0.8;
		filter: none;
		z-index: 20;
	}
	.col-slide[data-offset='-1'] {
		transform: translateX(34%) scale(0.62) rotateY(-22deg);
		opacity: 0.8;
		filter: none;
		z-index: 20;
	}
	.col-slide[data-offset='2'] {
		transform: translateX(-56%) scale(0.48) rotateY(32deg);
		opacity: 0.5;
		filter: none;
		z-index: 10;
	}
	.col-slide[data-offset='-2'] {
		transform: translateX(56%) scale(0.48) rotateY(-32deg);
		opacity: 0.5;
		filter: none;
		z-index: 10;
	}

	/* הכללים שמסתירים תוכן ומבטלים אינטראקציה בקלפים האחוריים שייכים
	   אך ורק לקרוסלה בנייד — בדסקטופ שלוש העמודות מוצגות במלואן זו לצד זו
	   ולכן אין לגעת בהן. */
	@media (max-width: 767px) {
		.col-slide:not([data-offset='0']) .glow-bar,
		.col-slide:not([data-offset='0']) .col-slide-inner > div:last-child {
			display: none;
		}
		.col-slide:not([data-offset='0']) .col-slide-inner > div:first-child {
			margin-bottom: 0;
		}
		.col-slide:not([data-offset='0']) {
			pointer-events: none;
		}
		.col-slide:not([data-offset='0']) > .col-slide-inner > div:first-child {
			pointer-events: auto;
			cursor: pointer;
		}
	}

	/* מדסקטופ ומעלה — חוזרים לפריסת שלוש עמודות רגילה זו לצד זו */
	@media (min-width: 768px) {
		.cols-container {
			display: flex;
			flex-direction: row;
			align-items: stretch;
			perspective: none;
			touch-action: auto;
			user-select: auto;
			-webkit-user-select: auto;
		}
		.col-slide,
		.col-slide[data-offset='0'],
		.col-slide[data-offset='1'],
		.col-slide[data-offset='-1'],
		.col-slide[data-offset='2'],
		.col-slide[data-offset='-2'] {
			grid-column: auto;
			grid-row: auto;
			flex: 1 1 0%;
			transform: none;
			opacity: 1;
			filter: none;
			z-index: auto;
			pointer-events: auto;
			transform-style: flat;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.col-slide {
			transition: none;
		}
	}

	/* ===== אנימציית "אצבע מנגבת" — נייד בלבד, פעם אחת ===== */
	.finger-demo {
		position: absolute;
		top: 5rem; /* מתחת לכותרות הקטנות של העמודות */
		right: 6%;
		width: 9rem; /* יד פורטרט גבוהה — רוחב מתון, גובה מתאים */
		height: auto;
		pointer-events: none;
		z-index: 50;
		filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.7));
		animation: finger-swipe 1.05s cubic-bezier(0.32, 0.4, 0.36, 1) forwards;
	}
	.finger-demo img {
		width: 100%;
		height: auto;
		display: block;
		/* סיבוב קל פנימה לכיוון הניגוב — לא מתערב באנימציה של .finger-demo */
		transform: rotate(-18deg);
		transform-origin: 60% 30%;
	}
	@keyframes finger-swipe {
		0% {
			transform: translateX(0) scale(0.9);
			opacity: 0;
		}
		18% {
			transform: translateX(-1vw) scale(1);
			opacity: 1;
		}
		82% {
			transform: translateX(-17vw) scale(1);
			opacity: 1;
		}
		100% {
			transform: translateX(-20vw) scale(0.9);
			opacity: 0;
		}
	}
	@media (min-width: 768px) {
		.finger-demo {
			display: none !important;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.finger-demo {
			display: none !important;
		}
	}
</style>
