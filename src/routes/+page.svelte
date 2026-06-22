<script lang="ts">
	import { onMount } from 'svelte';
	import { t, locale } from 'svelte-i18n';
	import { get } from 'svelte/store';

	let _loc = $state(get(locale));
	$effect(() => locale.subscribe((l) => (_loc = l)));
	const tFn = (k: string) => { void _loc; return get(t)(k); };

	interface Site {
		titleKey: string;
		descriptionKey: string;
		href?: string;
		image?: string;
		comingSoon?: boolean;
		mobileHide?: boolean;
	}

	const columns: { headingKey: string; sites: Site[] }[] = [
		{
			headingKey: 'page.columns.community',
			sites: [
				{
					titleKey: 'page.sites.community_neighborhood.title',
					descriptionKey: 'page.sites.community_neighborhood.description',
					href: 'https://community.gofreeil.com/',
					image: '/images/community-neighborhood.webp'
				},
				{
					titleKey: 'page.sites.courts_reconciliation.title',
					descriptionKey: 'page.sites.courts_reconciliation.description',
					href: 'https://chachmim.gofreeil.com/',
					image: '/images/bati-hapius.webp'
				},
				{
					titleKey: 'page.sites.national_gemach.title',
					descriptionKey: 'page.sites.national_gemach.description',
					href: 'https://gemach.gofreeil.com/',
					image: '/images/gemach-harzi.webp'
				}
			]
		},
		{
			headingKey: 'page.columns.governance',
			sites: [
				{
					titleKey: 'page.sites.neighborhood_committees.title',
					descriptionKey: 'page.sites.neighborhood_committees.description',
					href: 'https://neighborhoods.gofreeil.com/',
					image: '/images/news/vaadei-shchunot.webp'
				},
				{
					titleKey: 'page.sites.state_auditor.title',
					descriptionKey: 'page.sites.state_auditor.description',
					href: 'https://criticism.gofreeil.com/',
					image: '/images/mevaker-rashuyot.webp'
				},
				{
					titleKey: 'page.sites.public_rating.title',
					descriptionKey: 'page.sites.public_rating.description',
					href: 'https://rating.gofreeil.com/',
					image: '/images/public-rating.webp'
				},
				{
					titleKey: 'page.sites.experts.title',
					descriptionKey: 'page.sites.experts.description',
					href: 'https://experts.gofreeil.com/',
					image: '/images/the-experts.webp'
				},
				{
					titleKey: 'page.sites.referendum.title',
					descriptionKey: 'page.sites.referendum.description',
					href: 'https://referendum.gofreeil.com/',
					image: '/images/referendum.webp'
				}
			]
		},
		{
			headingKey: 'page.columns.economy',
			sites: [
				{
					titleKey: 'page.sites.purchasing_group.title',
					descriptionKey: 'page.sites.purchasing_group.description',
					href: 'https://groups.gofreeil.com/',
					image: '/images/whatsapp_cta.webp'
				},
				{
					titleKey: 'page.sites.professionals.title',
					descriptionKey: 'page.sites.professionals.description',
					href: 'https://index.gofreeil.com/',
					image: '/images/professionals.webp'
				},
				{
					titleKey: 'page.sites.freedom_store.title',
					descriptionKey: 'page.sites.freedom_store.description',
					href: 'https://shop.gofreeil.com/',
					image: '/images/freedom-store.webp'
				}
			]
		}
	];

	// רשתות חברתיות - קישורים זמניים (mockup)
	// אייקוני רשתות חברתיות צבעוניים - SVG מלא לכל פלטפורמה (רקע מותג + לוגו לבן)
	const socials: { name: string; href: string; svg: string }[] = [
		{
			name: 'Facebook',
			href: 'https://www.facebook.com/share/17iu4gtxZH/',
			svg: '<circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.42 21v-8.21h2.75l.41-3.2h-3.16V7.55c0-.93.26-1.55 1.59-1.55h1.7V3.13c-.29-.04-1.3-.13-2.46-.13-2.44 0-4.11 1.49-4.11 4.22v2.35H7.4v3.2h2.74V21h3.28z"/>'
		},
		{
			name: 'Instagram',
			href: '#',
			svg: '<defs><linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FED576"/><stop offset="26%" stop-color="#F47133"/><stop offset="61%" stop-color="#BC3081"/><stop offset="100%" stop-color="#4C68D7"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig-g)"/><path fill="none" stroke="#fff" stroke-width="1.7" d="M8 4.5h8a3.5 3.5 0 0 1 3.5 3.5v8a3.5 3.5 0 0 1-3.5 3.5H8A3.5 3.5 0 0 1 4.5 16V8A3.5 3.5 0 0 1 8 4.5z"/><circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="17.1" cy="6.9" r="0.95" fill="#fff"/>'
		},
		{
			name: 'YouTube',
			href: 'https://www.youtube.com/@freedomhasbegun',
			svg: '<rect x="0" y="3.7" width="24" height="16.6" rx="4.2" fill="#FF0000"/><path fill="#fff" d="M9.8 15.4V8.6L15.9 12l-6.1 3.4Z"/>'
		},
		{
			name: 'TikTok',
			href: 'https://www.tiktok.com/@yahav_anter',
			svg: '<rect width="24" height="24" rx="6" fill="#010101"/><path fill="#25F4EE" d="M18.8 5.4a5.32 5.32 0 0 1-3.27-1.1 5.32 5.32 0 0 1-2.05-3.32v-1h-3.6v14.65a3.22 3.22 0 0 1-5.79 1.94 3.22 3.22 0 0 1 4.27-4.62v-3.66a6.83 6.83 0 0 0-5.78 11.62A6.83 6.83 0 0 0 13.48 14.54V7.34a8.9 8.9 0 0 0 5.32 1.74v-3.6Z" transform="translate(-0.7 0.5)"/><path fill="#FE2C55" d="M19.32 5.56a5.32 5.32 0 0 1-3.27-1.1 5.32 5.32 0 0 1-2.05-3.32V0h-3.6v14.65a3.22 3.22 0 0 1-5.79 1.94 3.22 3.22 0 0 1 4.27-4.62v-3.66a6.83 6.83 0 0 0-5.78 11.62A6.83 6.83 0 0 0 14 14.7V7.5a8.9 8.9 0 0 0 5.32 1.74v-3.6Z" transform="translate(0.7 -0.5)"/><path fill="#fff" d="M19.32 5.56a5.32 5.32 0 0 1-3.27-1.1 5.32 5.32 0 0 1-2.05-3.32V0h-3.6v14.65a3.22 3.22 0 0 1-5.79 1.94 3.22 3.22 0 0 1 4.27-4.62v-3.66a6.83 6.83 0 0 0-5.78 11.62A6.83 6.83 0 0 0 14 14.7V7.5a8.9 8.9 0 0 0 5.32 1.74v-3.6Z"/>'
		},
		{
			name: 'X',
			href: '#',
			svg: '<rect width="24" height="24" rx="6" fill="#000"/><path fill="#fff" d="M16.99 4.25h2.39l-5.22 5.97 6.14 8.13h-4.81l-3.77-4.93-4.31 4.93H4.99l5.58-6.39L4.68 4.25h4.93l3.41 4.51 3.97-4.51zm-.84 12.86h1.32L8.66 5.6H7.24l8.91 11.51z"/>'
		},
		{
			name: 'Telegram',
			href: 'https://t.me/freedomisrael',
			svg: '<defs><linearGradient id="tg-g" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#37AEE2"/><stop offset="100%" stop-color="#1E96C8"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#tg-g)"/><path fill="#fff" d="M17.84 7.95c.18-.79-.27-1.06-.81-.85L5.92 11.29c-.79.31-.78.76-.13.97l2.86.89 6.63-4.18c.31-.21.6-.1.36.11l-5.37 4.85-.21 2.95c.31 0 .45-.14.61-.31l1.46-1.41 3.04 2.24c.56.31.96.15 1.1-.52l1.99-9.37Z"/>'
		},
		{
			name: 'WhatsApp',
			href: 'https://chat.whatsapp.com/HetwsjH7EQA33lU8GtxUZV',
			svg: '<circle cx="12" cy="12" r="12" fill="#25D366"/><path fill="#fff" d="M16.66 14.07c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.21-.59.07-.27-.14-1.14-.42-2.18-1.34-.81-.72-1.35-1.61-1.51-1.89-.16-.27-.02-.42.12-.55.13-.13.27-.34.4-.5.13-.17.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.14-.61-1.47-.83-2.02-.22-.53-.45-.46-.61-.46l-.52-.01c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.26 0 1.34.97 2.63 1.11 2.81.13.18 1.92 2.94 4.65 4.12.65.28 1.16.45 1.55.58.65.21 1.25.18 1.71.11.52-.08 1.61-.66 1.84-1.29.22-.64.22-1.18.16-1.29-.07-.11-.25-.18-.52-.31Zm-4.59 6.27a8.3 8.3 0 0 1-4.24-1.16l-.31-.18-3.16.83.84-3.08-.2-.31a8.31 8.31 0 0 1-1.27-4.41c0-4.59 3.74-8.32 8.34-8.32a8.3 8.3 0 0 1 8.32 8.34 8.32 8.32 0 0 1-8.32 8.31Zm7.08-15.39A9.84 9.84 0 0 0 12.06 2C6.58 2 2.13 6.45 2.13 11.92c0 1.75.46 3.45 1.33 4.95L2.05 22l5.26-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.48 0 9.93-4.45 9.93-9.92a9.86 9.86 0 0 0-2.92-7.02Z"/>'
		}
	];

	// אבקת קסם - חלקיקים דטרמיניסטיים (כדי למנוע אי-התאמת hydration)
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

	// אבקת קסם קטנה על שלשלת הכותרות (glow-bar) - ה-delay יחסי ל---reveal-delay של העמודה,
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
					timer = setTimeout(() => (dustActive = false), 2600);
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

	// הסרטון נטען רק בלחיצה - מאיץ משמעותית את טעינת הדף
	let videoPlaying = $state(false);

	// בנייד: לחיצה ראשונה חושפת את ה-overlay (כותרת+תיאור על התמונה, כמו hover בדסקטופ);
	// לחיצה שניה - ניווט לאתר.
	let revealedBanners: Record<string, boolean> = $state({});
	function onBannerClick(e: MouseEvent, site: Site) {
		if (!site.href) { e.preventDefault(); return; }
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			if (!revealedBanners[site.titleKey]) {
				e.preventDefault();
				revealedBanners[site.titleKey] = true;
			}
			// אם כבר נחשף - לא חוסמים, ה-anchor מנווט כרגיל ב-target=_blank
		}
	}

	// מונה חברים - ספירה מהירה מ-1,000 עד 10,000
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

	// ===== חבילת עמודות (deck) - תצוגת נייד בלבד =====
	// שלושת העמודים נערמים זה מאחורי זה באותו מקום; הפעיל לפנים,
	// האחרים מוקטנים, חשוכים ושקופים, וכותרותיהם מציצות מעליו.
	// החלקה אופקית או הקשה על כותרת אחורית מגלגלות את העמוד הנבחר קדימה.
	let track: HTMLElement;
	// מצב פתיחה בנייד: משילות במרכז (activeCol=1) - אבקת הקסם והארת הכותרת
	// רצות על העמודה האמצעית כברירת מחדל. בהמשך היד מגיעה וגוללת אל קהילה (0).
	let activeCol = $state(1);

	// בכל החלפת עמודה - מריצים מחדש את אנימציית הקו (glow-bar) של העמודה הפעילה.
	// משיגים זאת ע"י remount של אלמנט ה-glow-bar באמצעות {#key replayKey},
	// והעברת --reveal-delay=0 כדי שהאנימציה תרוץ מיד ולא תחכה לתזמון המקורי.
	let replayKey = $state(0);
	let activeColInited = false;
	let replayCounter = 0;
	$effect(() => {
		activeCol; // tracked
		if (!activeColInited) {
			activeColInited = true;
			return;
		}
		// חשוב: לא להשתמש ב-replayKey++ - זה קורא וכותב את אותו $state ויוצר לולאה.
		// במקום זה, סופרים ב-let רגיל ומשמשים את ה-state רק לכתיבה.
		replayCounter++;
		replayKey = replayCounter;
	});

	// היסט עמודה ביחס לפעיל (-2..+2 בעבור 3 עמודות): קובע מאיזה צד הקלף יושב
	const offsetFor = (i: number) => i - activeCol;

	function onSlideClick(e: MouseEvent, i: number) {
		if (window.innerWidth >= 768) return;
		// אם רגע לפני הקליק הסתיים סוויפ - לבלוע את הקליק כדי שלא ירוץ
		// במקביל לסוויפ ויגרום למעבר כפול/הפוך.
		if (didSwipe) {
			didSwipe = false;
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		if (activeCol !== i) {
			e.preventDefault();
			e.stopPropagation();
			activeCol = i;
		}
	}

	let dragStartX = 0;
	let dragStartY = 0;
	let lastX = 0;
	let lastY = 0;
	let dragging = $state(false);
	let didSwipe = false;
	let committedSwipe = false;
	// offset חי בפיקסלים - הקרוסלה זזה עם האצבע בזמן הגרירה.
	// משתמשים בדיכוי 0.55 כדי שתחושת ה"גומי" תהיה עדינה ולא מעופפת.
	let dragOffset = $state(0);
	const DRAG_DAMP = 0.55;
	const SWIPE_THRESHOLD = 20;
	const COMMIT_THRESHOLD = 7;

	function executeSwipe(dx: number, dy: number) {
		if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
		didSwipe = true;
		// התוכן זז עם האצבע: גרירה שמאלה -> הקלף הימני (offset שלילי) מגיע למרכז,
		// כלומר activeCol יורד; גרירה ימינה -> activeCol עולה.
		if (dx < 0) activeCol = Math.max(0, activeCol - 1);
		else activeCol = Math.min(columns.length - 1, activeCol + 1);
	}

	// משתמשים באירועי touch נייטיביים - הם הכי אמינים על iOS Safari,
	// בעוד pointer events לפעמים לא יורים על כל המכשירים/דפדפנים.
	function onTouchStart(e: TouchEvent) {
		if (window.innerWidth >= 768) return;
		const t = e.touches[0];
		if (!t) return;
		dragging = true;
		didSwipe = false;
		committedSwipe = false;
		dragStartX = t.clientX;
		dragStartY = t.clientY;
		lastX = t.clientX;
		lastY = t.clientY;
	}

	function onTouchMove(e: TouchEvent) {
		if (!dragging) return;
		const t = e.touches[0];
		if (!t) return;
		lastX = t.clientX;
		lastY = t.clientY;
		const dx = lastX - dragStartX;
		const dy = lastY - dragStartY;
		if (!committedSwipe) {
			if (Math.abs(dx) >= COMMIT_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
				committedSwipe = true;
			}
		}
		if (committedSwipe) {
			// בקצוות (activeCol 0 או הקיצוני) - דיכוי חזק יותר כדי לרמוז שאי-אפשר להמשיך.
			const atEdgeStart = activeCol === 0 && dx > 0;
			const atEdgeEnd = activeCol === columns.length - 1 && dx < 0;
			const damp = atEdgeStart || atEdgeEnd ? DRAG_DAMP * 0.4 : DRAG_DAMP;
			dragOffset = dx * damp;
		}
	}

	function onTouchEnd(e: TouchEvent) {
		if (!dragging) return;
		dragging = false;
		dragOffset = 0; // ה-transition של הקרוסלה דואג לחזרה חלקה
		const t = e.changedTouches[0];
		if (!t) return;
		executeSwipe(t.clientX - dragStartX, t.clientY - dragStartY);
	}

	function onTouchCancel() {
		// touchcancel נורה כשהמערכת חוטפת את המגע (למשל גלילה נייטיבית).
		// אם זיהינו כוונה אופקית לפני זה - מכבדים אותה לפי המיקום האחרון.
		if (!dragging) return;
		dragging = false;
		dragOffset = 0;
		if (committedSwipe) {
			executeSwipe(lastX - dragStartX, lastY - dragStartY);
		}
	}

	// אנימציה חד-פעמית של "אצבע מנגבת את המסך" שמדגימה למשתמש
	// שאפשר לדפדף בין הקלפים. רצה רק כשהקרוסלה נכנסת לתצוגה בנייד,
	// פעם אחת בלבד לכל טעינת דף.
	let demoFingerActive = $state(false);
	let demoReverseActive = $state(false);
	let demoThirdActive = $state(false);
	let snapNoTransition = $state(false);
	let demoPlayed = false;
	let demoStarted = false; // משמר חזק: מבטיח שהדמו ירוץ פעם אחת בלבד

	function runSwipeDemo() {
		if (demoStarted) return;
		demoStarted = true;
		// המצב הראשוני עומד על משילות (activeCol=1) - שם רצה אנימציית הכותרת.
		// היד נכנסת רק כמחצית לתוך המסך, מבצעת ניגוב קצר ויוצאת חזרה ימינה.
		demoFingerActive = true;
		// activeCol מתחלף בנקודת השיא של הניגוב (45% מ-2s = 900ms) כדי שהמעבר
		// יראה כאילו היד "דוחפת" את העמודה ולא יקדים את תנועת הניגוב.
		setTimeout(() => (activeCol = 0), 900);
		// בסיום - היד יצאה מהפריים בצד ימין והסימן (עם עיכוב 0.5s) הספיק להתעמעם.
		setTimeout(() => (demoFingerActive = false), 2500);
	}

	// אנימציה הפוכה: מתרחשת כשהמשתמש גולל מטה ואז חוזר מעלה אל הכותרת.
	// היד והניגוב רצים בהילוך אחורי (animation-direction: reverse) ו-activeCol
	// חוזר מ-0 אל 1 בתזמון תואם לנקודת השיא של הניגוב באנימציה המהופכת.
	let reverseRunning = false;
	let reverseShown = false; // הדמו ההפוך מוצג רק פעם אחת - בלי קפיצות חזרה לקהילה
	let fingerSentinel: HTMLElement;
	function runReverseSwipeDemo() {
		if (reverseRunning || reverseShown) return;
		reverseRunning = true;
		reverseShown = true;
		// מתחילים מאותו מצב סופי של הדמו הקדמי - activeCol=0
		activeCol = 0;
		demoReverseActive = true;
		// מאחרים את שינוי activeCol כך שיתרחש אחרי שהיד סיימה את הניגוב,
		// בו-זמנית עם הופעת הסימן (1500ms).
		setTimeout(() => (activeCol = 1), 1500);
		setTimeout(() => {
			demoReverseActive = false;
			reverseRunning = false;
		}, 2500);
	}

	// דמו שלישי: לאחר שהמשתמש הגיע לתחתית הדף וחזר למעלה אל הקרוסלה -
	// היד מנגבת עוד שמאלה ומציגה את העמודה השלישית (כלכלה, activeCol=2).
	let thirdRunning = false;
	let thirdShown = false; // מוצג רק פעם אחת בכל טעינת דף
	function runThirdSwipeDemo() {
		if (thirdRunning || thirdShown) return;
		thirdRunning = true;
		thirdShown = true;

		function startThirdAnimation() {
			demoThirdActive = true;
			// מאחרים את שינוי activeCol כך שיתרחש אחרי שהיד סיימה את הניגוב,
			// בו-זמנית עם הופעת הסימן (1500ms).
			setTimeout(() => (activeCol = 2), 1500);
			setTimeout(() => {
				demoThirdActive = false;
				thirdRunning = false;
			}, 2500);
		}

		// אם activeCol לא נמצא במשילות (אמצע) - נצמד אליו ללא מעבר נראה לעין,
		// כדי שהמשתמש לא יראה את העמודה זזה לפני שהיד אפילו הופיעה.
		if (activeCol !== 1) {
			// שלב 1: מפעילים את מצב חוסם-המעבר
			snapNoTransition = true;
			// שלב 2: ממתינים שה-class יחול ב-DOM, אז משנים את activeCol (קופץ מיידית)
			requestAnimationFrame(() => {
				activeCol = 1;
				// שלב 3: ממתינים שהקפיצה תוחל, אז משחררים את חוסם-המעבר ומפעילים את הדמו
				requestAnimationFrame(() => {
					snapNoTransition = false;
					startThirdAnimation();
				});
			});
		} else {
			startThirdAnimation();
		}
	}

	// טריגר לדמו ההפוך / השלישי:
	// 1) המשתמש גלל מטה עד שהאזור של היד (sentinel) יצא מהתצוגה כלפי מעלה.
	// 2) כשהוא חוזר מעלה - ברגע שה-sentinel חוזר לתצוגה (הכותרת/אזור היד נראים שוב)
	//    מפעילים מיידית ללא עיקוב. בוחרים בין דמו הפוך לדמו שלישי לפי האם הגיע לתחתית.
	// נייד בלבד.
	$effect(() => {
		if (typeof window === 'undefined') return;
		if (!window.matchMedia('(max-width: 767px)').matches) return;
		if (!fingerSentinel) return;

		let scrolledPastTop = false; // אזור היד יצא למעלה (המשתמש גלל מטה מעבר אליו)
		let prevY = window.scrollY;
		let goingUp = false;

		function onScroll() {
			const y = window.scrollY;
			goingUp = y < prevY;
			prevY = y;
		}
		window.addEventListener('scroll', onScroll, { passive: true });

		const io = new IntersectionObserver(
			(entries) => {
				const e = entries[0];
				if (!e) return;
				if (!e.isIntersecting && e.boundingClientRect.top < 0) {
					// אזור היד יצא מהתצוגה כלפי מעלה - המשתמש גלל מטה מעבר אליו
					scrolledPastTop = true;
				} else if (
					e.isIntersecting &&
					scrolledPastTop &&
					goingUp &&
					!reverseRunning &&
					!thirdRunning
				) {
					// אזור היד חזר לתצוגה והמשתמש בכיוון גלילה מעלה.
					// פעם ראשונה → דמו הפוך (קהילה→משילות).
					// פעם שניה → דמו שלישי (משילות→כלכלה) - אותו טריגר, לא צריך תחתית.
					scrolledPastTop = false;
					if (!reverseShown) {
						runReverseSwipeDemo();
					} else if (!thirdShown) {
						runThirdSwipeDemo();
					}
				}
			},
			{ threshold: 0 }
		);
		io.observe(fingerSentinel);
		return () => {
			io.disconnect();
			window.removeEventListener('scroll', onScroll);
		};
	});

	// מפעילים את הדמו ברגע שאבקת הקסם נכנסה לתצוגה (revealed=true).
	// משתמשים באותו טריגר של האבקה במקום IO נפרד שעלול לא לירות באייפון.
	$effect(() => {
		if (!revealed || demoPlayed) return;
		if (typeof window === 'undefined') return;
		if (!window.matchMedia('(max-width: 767px)').matches) return;
		demoPlayed = true;
		// משהים את ההדגמה כדי שתופיע מיד אחרי שאבקת הקסם והכותרת מואירות.
		const timer = setTimeout(runSwipeDemo, 1800);
		return () => clearTimeout(timer);
	});

	// רקע וידאו - מאט את הפלייבק לחצי כדי שהתנועה תהיה חולמנית ועדינה.
	// טוענים את הוידאו (7.7MB) רק אחרי שהדף האינטראקטיבי - poster מוצג מיד, ואז
	// requestIdleCallback (או setTimeout fallback) מוסיף את ה-<video> כשהדפדפן פנוי.
	let bgVideoEl: HTMLVideoElement | undefined = $state();
	let videoSrc = $state('');
	onMount(() => {
		const load = () => (videoSrc = '/images/bg.mp4');
		const ric = (window as any).requestIdleCallback;
		const id = ric ? ric(load, { timeout: 1500 }) : setTimeout(load, 600);
		return () => {
			const cic = (window as any).cancelIdleCallback;
			if (ric && cic) cic(id);
			else clearTimeout(id);
		};
	});
	$effect(() => {
		if (bgVideoEl) bgVideoEl.playbackRate = 0.5;
	});
</script>

<!-- רקע וידאו של נוף - נהר/הרים/שמיים, מסמל חופש. position:fixed מבטיח שהרקע נשאר קבוע גם בגלילה.
     אין overlay גלובלי - הצבעים הטבעיים של הנוף נשארים חיים. כל בלוק טקסט מקבל מסגרת כהה משלו (class="text-card").
     poster מציג מיד תמונה דקה (~286KB) - הוידאו עצמו (7.7MB) נדחה עד אחרי mount, כדי שה-LCP יהיה מהיר. -->
{#if videoSrc}
<video
	bind:this={bgVideoEl}
	class="bg-video"
	autoplay
	muted
	loop
	playsinline
	preload="metadata"
	poster="/images/bg-poster.jpg"
	aria-hidden="true"
>
	<source src={videoSrc} type="video/mp4" />
</video>
{:else}
<img class="bg-video" src="/images/bg-poster.jpg" alt="" aria-hidden="true" fetchpriority="high" />
{/if}

<section class="max-w-5xl mx-auto px-6 pt-4 pb-6 text-center">
	<div class="text-card">
		<h1
			class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent
			       text-5xl md:text-7xl lg:text-8xl font-black text-center leading-tight px-4 mb-4 md:mb-6"
		>
			{tFn("page.hero_title")}
		</h1>
		<p class="intro-p text-base md:text-xl text-gray-50 leading-snug">
			<span
				class="font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400
				       bg-clip-text text-transparent"
			>
				{tFn("page.intro.movement_label")}
			</span>
			{tFn("page.intro.movement_text")}
		</p>
		<p class="intro-p text-base md:text-xl text-gray-50 leading-snug mt-3">
			<span class="font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">{tFn("page.intro.vision_label")}</span>
			{tFn("page.intro.vision_text")}
		</p>
		<p class="intro-p text-base md:text-xl text-gray-50 leading-snug mt-3">
			<span class="font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">{tFn("page.intro.activity_label")}</span>
			{tFn("page.intro.activity_text")}
		</p>
	</div>
</section>

<!-- וידאו + מונה החברים במסגרת אחת, padding מינימלי סביב הוידאו -->
<section class="max-w-2xl mx-auto px-6 pb-14">
	<div class="text-card video-card">
		<div
			class="relative w-full overflow-hidden rounded-xl shadow-2xl"
			style="padding-top:{videoPlaying ? '56.25%' : '46.875%'}"
		>
			{#if videoPlaying}
				<iframe
					class="absolute inset-0 h-full w-full"
					src="https://www.youtube-nocookie.com/embed/CjBbU2ZOsa8?start=2&autoplay=1"
					title={tFn("page.video.title")}
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
					aria-label={tFn("page.video.play_aria")}
				>
					<img
						src="https://i.ytimg.com/vi/CjBbU2ZOsa8/sddefault.jpg"
						alt={tFn("page.video.title")}
						class="h-full w-full object-cover"
						style="object-position:50% 33%"
						loading="eager"
						fetchpriority="high"
						decoding="async"
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
		<p class="text-xl md:text-2xl font-black text-white text-center mt-3">
			{tFn("page.members.prefix")}
			<span
				class="mx-1 inline-block tabular-nums text-2xl md:text-3xl
				       bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent"
			>{memberDisplay}</span>
			{tFn("page.members.suffix")}
		</p>
	</div>
</section>

<section class="max-w-6xl mx-auto px-6 pb-2 md:pb-20" class:revealed>
	<!-- הכותרת בלבד במסגרת. הטורים עצמם בלי מסגרת - האסימטריה הטבעית של הגבהים נבלעת ברקע הוידאו. -->
	<div class="text-center mb-6">
		<div class="text-card-hero">
			<h2
				class="text-center text-2xl md:text-4xl font-black leading-snug
				       bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
			>
				{tFn("page.platforms_title")}
			</h2>
		</div>
	</div>

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
		class:center-active={activeCol === 1}
		class:side-active={activeCol !== 1}
		class:dragging
		class:snap-no-transition={snapNoTransition}
		style="--drag-offset:{dragOffset}px"
		bind:this={track}
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
		ontouchcancel={onTouchCancel}
	>
		<!-- sentinel ליד מיקום היד: משמש כטריגר להופעת היד בדיוק כשהאזור שלה נכנס לתצוגה -->
		<span
			bind:this={fingerSentinel}
			aria-hidden="true"
			class="pointer-events-none absolute"
			style="top:1.5rem; right:6%; width:1px; height:1px;"
		></span>
		{#if demoFingerActive}
			<span class="finger-smudge" aria-hidden="true"></span>
			<div class="finger-demo" aria-hidden="true">
				<img src="/images/finger.webp" alt="" />
			</div>
		{/if}
		{#if demoReverseActive}
			<span class="finger-smudge reverse" aria-hidden="true"></span>
			<div class="finger-demo reverse" aria-hidden="true">
				<img src="/images/finger.webp" alt="" />
			</div>
		{/if}
		{#if demoThirdActive}
			<span class="finger-smudge reverse" aria-hidden="true"></span>
			<div class="finger-demo reverse" aria-hidden="true">
				<img src="/images/finger.webp" alt="" />
			</div>
		{/if}
		{#each columns as column, i (column.headingKey)}
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
				style="--reveal-delay:{replayKey > 0 ? '0s' : i === 1 ? '0.9s' : '1.3s'}"
			>
				<div class="col-slide-inner flex flex-1 flex-col">
				<div class="mb-12 flex flex-col items-center">
					<h3
						class="col-heading bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent
						       text-4xl md:text-6xl font-black text-center"
						style="--char-count:{[...tFn(column.headingKey)].length}"
						dir={/^[A-Za-z]/.test(tFn(column.headingKey)) ? 'ltr' : 'rtl'}
					>
						{#each [...tFn(column.headingKey)] as ch, ci (ci)}<span
							class="col-heading-char"
							style="--ci:{ci}"
						>{ch}</span>{/each}
					</h3>
					{#key replayKey}
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
					{/key}
				</div>
				<div class="flex flex-col {i === 0 ? 'gap-10' : 'gap-4'}">
					{#each column.sites as site, si (site.titleKey)}
						<div class="relative {site.mobileHide ? 'hidden md:block' : 'block'}">
						{#if si > 0}
							<div class="rope-connector {i === 0 ? 'rope-connector-wide' : ''}" aria-hidden="true">
								<span class="rope-unit">
									<span class="rope-hole rope-hole-top"></span>
									<span class="rope-hole rope-hole-bot"></span>
									<img class="rope-img" src="/images/rope.webp" alt="" />
								</span>
								<span class="rope-unit rope-unit-flip">
									<span class="rope-hole rope-hole-top"></span>
									<span class="rope-hole rope-hole-bot"></span>
									<img class="rope-img" src="/images/rope.webp" alt="" />
								</span>
							</div>
						{/if}
						<svelte:element
							this={site.href ? 'a' : 'div'}
							href={site.href}
							target={site.href ? '_blank' : undefined}
							rel={site.href ? 'noopener noreferrer' : undefined}
							onclick={(e) => onBannerClick(e, site)}
							class="fx-banner fx-lift group relative block overflow-hidden rounded-2xl border border-purple-500/20 bg-white/5
							       transition-colors hover:border-purple-500/50 hover:bg-white/10
							       {site.comingSoon && !site.image ? 'opacity-60' : ''}"
						>
							<div class="banner-media relative {i === 0 ? 'h-auto' : i === 1 ? (si === 2 ? 'h-60 md:h-44' : si === 3 ? 'h-52 md:h-[137px]' : si === 4 ? 'h-52 md:h-[138px]' : 'h-44 md:h-28') : i === 2 ? (si === 0 ? 'h-36 md:h-48' : si === 1 ? 'h-44 md:h-56' : 'h-40 md:h-[335px]') : 'h-28'} w-full overflow-hidden bg-slate-800">
								{#if site.image}
									<img
										src={site.image}
										alt={tFn(site.titleKey)}
										class="banner-img {i === 0 ? 'h-auto' : 'h-full'} w-full object-cover transition-transform"
										decoding="async"
										loading="lazy"
									/>
								{:else}
									<div
										class="flex h-full w-full items-center justify-center
										       bg-gradient-to-br from-blue-500/20 to-purple-500/20"
									>
										<span class="text-2xl font-black text-purple-300/70">{tFn(site.titleKey)}</span>
									</div>
								{/if}
								<div
									class="banner-text-overlay absolute inset-0 flex items-center justify-center px-6 text-center {revealedBanners[site.titleKey] ? 'is-revealed' : ''}"
								>
									<div class="banner-text-inner">
										<p class="text-xl lg:text-2xl font-black leading-tight text-white">
											{tFn(site.titleKey)}
										</p>
										<p class="mt-2 text-sm lg:text-base font-semibold leading-snug text-gray-50">
											{tFn(site.descriptionKey)}
										</p>
									</div>
								</div>
							</div>
							<div class="banner-caption px-6 py-3 bg-black">
								<p class="text-center text-base font-black leading-tight text-white">{tFn(site.titleKey)}</p>
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

	<div class="text-card mx-auto mt-12 max-w-3xl">
		<p
			class="text-center text-lg md:text-2xl font-black
			       bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400
			       bg-clip-text text-transparent"
		>
			{tFn("page.news_block.tagline")}
		</p>

		<a
			href="https://chat.whatsapp.com/Bek6Bh0fJMJ63ozhIjlgCz"
			target="_blank"
			rel="noopener noreferrer"
			class="mx-auto mt-6 block w-full transition-transform hover:scale-[1.02]"
		>
			<img
				src="/images/news.webp"
				alt={tFn("page.news_block.image_alt")}
				class="w-full rounded-2xl"
				loading="lazy"
				decoding="async"
			/>
		</a>

		<h2
			class="mt-12 text-center text-2xl md:text-4xl font-black leading-snug
			       bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
		>
			{tFn("page.socials.title")}
		</h2>

		<div class="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-4">
			{#each socials as s (s.name)}
				<a
					href={s.href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={s.name}
					class="social-icon flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full
					       transition-transform hover:scale-110"
				>
					<svg class="h-9 w-9 md:h-12 md:w-12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						{@html s.svg}
					</svg>
				</a>
			{/each}
		</div>
	</div>
</section>

<style>
	/* ===== רקע וידאו של נוף חופש (דף הבית בלבד) =====
	   הוידאו ב-position:fixed כדי שיישאר ברקע גם בגלילה.
	   ה-:global selectors מבטלים את הרקע הכהה של site-frame/body/html
	   כדי שהוידאו ייראה דרכם. החזרה לרגיל מתרחשת כשעוזבים את הדף (Svelte מסיר את ה-style). */
	:global(html),
	:global(body),
	:global(.site-frame) {
		background-color: transparent !important;
	}
	/* שכבת רקע כחולה כהה מתחת לוידאו - כדי שלא ייראה הבזק לבן בזמן טעינת הוידאו. */
	:global(html) {
		background: #070b14 !important;
	}

	.bg-video {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		object-fit: cover;
		z-index: -2;
		pointer-events: none;
	}

	/* מסגרת עדינה לבלוקי טקסט - הצבעים של הנוף מבצבצים דרכה, רק טשטוש קל מאחורי הטקסט.
	   רקע שקוף יותר (0.3), blur עדין, padding דק - כדי שהמסגרת לא תהיה דומיננטית. */
	.text-card {
		background: rgba(7, 11, 20, 0.45);
		backdrop-filter: blur(0.3px);
		-webkit-backdrop-filter: blur(0.3px);
		border-radius: 0.875rem;
		padding: 0.75rem 1.1rem;
	}
	/* וריאציה לכרטיס הגדול שעוטף את כל אזור הפלטפורמות - יותר breathing room. */
	.platforms-card {
		padding: 1.75rem 1.5rem 2.5rem 1.5rem;
		border-radius: 1.25rem;
	}
	/* וריאציה לכרטיס הוידאו - padding מינימלי סביב, רק רמז של מסגרת */
	.video-card {
		padding: 0.4rem 0.4rem 0.75rem 0.4rem;
		border-radius: 1rem;
	}
	/* וריאציה דקה עוד יותר לכותרות - רק רמז למסגרת */
	.text-card-hero {
		background: rgba(7, 11, 20, 0.4);
		backdrop-filter: blur(0.2px);
		-webkit-backdrop-filter: blur(0.2px);
		border-radius: 1rem;
		padding: 0.25rem 1rem;
		display: inline-block;
	}

	/* כיבוד העדפת תנועה מופחתת - אם המשתמש ביקש פחות אנימציות, מסתירים את הוידאו. */
	@media (prefers-reduced-motion: reduce) {
		.bg-video {
			display: none;
		}
	}

	/* ---- אינטראקציות ריחוף לבאנרים (שלט עץ תלוי על חבלים) ---- */
	.fx-banner {
		transition:
			transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1),
			border-color 0.25s ease,
			background-color 0.25s ease;
		transform-origin: top center;
	}

	/* הרמה קלה כלפי מעלה בריחוף - ללא סיבוב */
	.fx-lift:hover {
		transform: translateY(-6px);
	}

	.fx-banner:hover img { transform: scale(1.05); }

	/* ===== מעבר ענן/ערפל איטי: התמונה מטשטשת מאחורי שכבת ערפל שמתעבה ===== */
	/* הטקסט עצמו סטטי - כבר שם, ללא אנימציה. רק הענן זז ומגלה אותו. */
	.banner-img {
		transition:
			transform 1.6s cubic-bezier(0.22, 1, 0.36, 1),
			filter 1.8s cubic-bezier(0.22, 1, 0.36, 1);
		will-change: transform, filter;
	}
	.fx-banner:hover .banner-img,
	.banner-media:has(.banner-text-overlay.is-revealed) .banner-img {
		transform: scale(1.08);
		filter: blur(4px) brightness(0.7) saturate(0.85);
	}

	.banner-text-overlay {
		opacity: 0;
		pointer-events: none;
		background:
			radial-gradient(ellipse 65% 55% at 18% 22%, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0) 72%),
			radial-gradient(ellipse 55% 50% at 82% 28%, rgba(30, 41, 59, 0.92) 0%, rgba(30, 41, 59, 0) 72%),
			radial-gradient(ellipse 70% 60% at 30% 82%, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0) 72%),
			radial-gradient(ellipse 60% 55% at 80% 78%, rgba(30, 41, 59, 0.92) 0%, rgba(30, 41, 59, 0) 72%),
			radial-gradient(ellipse 90% 80% at 50% 50%, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.55) 100%);
		background-size:
			170% 170%,
			170% 170%,
			170% 170%,
			170% 170%,
			140% 140%;
		background-position:
			40% 40%,
			60% 40%,
			40% 60%,
			60% 60%,
			50% 50%;
		backdrop-filter: blur(0px) saturate(1);
		-webkit-backdrop-filter: blur(0px) saturate(1);
		transition:
			opacity 1.8s cubic-bezier(0.22, 1, 0.36, 1),
			background-position 2.2s cubic-bezier(0.22, 1, 0.36, 1),
			backdrop-filter 1.8s cubic-bezier(0.22, 1, 0.36, 1),
			-webkit-backdrop-filter 1.8s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.fx-banner:hover .banner-text-overlay,
	.banner-text-overlay.is-revealed {
		opacity: 0.9; /* 10% שקיפות - התמונה שמאחור כמעט נראית */
		background-position:
			18% 22%,
			82% 28%,
			30% 82%,
			80% 78%,
			50% 50%;
		backdrop-filter: blur(10px) saturate(1.05);
		-webkit-backdrop-filter: blur(10px) saturate(1.05);
	}

	/* בנייד: מעבר קצר ויעיל בלי will-change (תגובה מיידית לטאפ) */
	@media (max-width: 767px) {
		.banner-text-overlay {
			transition:
				opacity 0.4s ease,
				background-position 0.5s ease,
				backdrop-filter 0.4s ease,
				-webkit-backdrop-filter 0.4s ease;
		}
		.banner-img {
			transition:
				transform 0.5s ease,
				filter 0.5s ease;
		}
	}

	/* הטקסט סטטי לחלוטין - אין transition, אין transform, אין filter.
	   הוא יושב שם תמיד; הענן הוא זה שמתעבה ומגלה אותו דרך opacity של ה-overlay. */
	.banner-text-inner {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.fx-banner:hover {
			animation: none !important;
			transform: none !important;
		}
		.banner-text-overlay,
		.banner-img {
			transition: none;
		}
		.fx-banner:hover .banner-img {
			filter: none;
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
		width: 22px;
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
		animation: dust-fade 2.2s linear forwards;
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

	/* הכותרות הקטנות מתחילות להאיר רק כשפירורי הקסם נוגעים בהן -
	   ה-delay נקבע פר-עמודה דרך --reveal-delay (העמודה האמצעית מורמת ולכן מוקדמת יותר) */
	.col-heading {
		animation: heading-illuminate 1.1s ease-out var(--reveal-delay, 1.3s) both;
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
		animation: bar-charge 0.7s ease-out calc(var(--reveal-delay, 1.3s) + 0.4s) both;
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
			calc(var(--reveal-delay, 1.3s) + 0.15s) both;
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
			calc(var(--reveal-delay, 1.3s) + 0.06s) both;
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

	/* ===== קרוסלת עמודות אופקית - תצוגת נייד בלבד ===== */
	/* שלושת העמודים נערמים באותו תא רשת. הפעיל במרכז, האחרים מסביב
	   במיקומים אופקיים בלבד (±100%, ±200% מעצמם) - נכנסים ויוצאים מהצד
	   ברצף אחד, ללא scale, ללא סיבוב 3D, ללא תנועה אנכית. */
	.cols-container {
		display: grid;
		grid-template-columns: 1fr;
		align-items: start;
		justify-items: stretch;
		position: relative;
		overflow: hidden; /* חותכים את הקלפים מחוץ למסך */
		/* פרספקטיבה עדינה - נותנת לכותרות הצדדיות אפקט עומק (האותיות הרחוקות
		   מהמרכז נראות מעט קטנות יותר). פרספקטיבה רחוקה => אפקט מתון. */
		perspective: 1800px;
		perspective-origin: 50% 50%;
		touch-action: pan-y;
		-webkit-user-select: none;
		user-select: none;
		/* גרירה חיה: כל הסצנה זזה לפי האצבע, ובשחרור חוזרת חלקות. */
		transform: translate3d(var(--drag-offset, 0px), 0, 0);
		transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
		will-change: transform;
	}
	/* בזמן גרירה אקטיבית אין transition - תנועה 1:1 עם האצבע */
	.cols-container.dragging {
		transition: none;
	}

	.col-slide {
		grid-column: 1;
		grid-row: 1;
		display: flex;
		/* שומר על קונטקסט 3D כדי שה-rotateY על הכותרת לא ישתטח */
		transform-style: preserve-3d;
	}
	.col-slide-inner {
		transform-style: preserve-3d;
	}
	.col-slide[data-offset='0'] { z-index: 30; }
	.col-slide[data-offset='1'],
	.col-slide[data-offset='-1'] { z-index: 20; }
	.col-slide[data-offset='2'],
	.col-slide[data-offset='-2'] { z-index: 10; }

	/* ---- כותרת + glow-bar: שומרים על מראה ה-deck - קטנות ומציצות מהצדדים ---- */
	.col-slide-inner > div:first-child {
		transform-origin: 50% 50%;
		transform-style: preserve-3d;
		transition:
			transform 0.7s cubic-bezier(0.25, 0.46, 0.2, 1),
			opacity 0.5s cubic-bezier(0.25, 0.46, 0.2, 1);
		will-change: transform, opacity;
	}

	/* ---- אפקט עומק לפי אותיות בכותרות הצדדיות ---- */
	/* כל אות בנפרד; ב-RTL ci=0 הוא האות הימנית ביותר, ci=N-1 השמאלית.
	   ככל שהאות רחוקה יותר מהמרכז של הקרוסלה - היא מתכווצת בהדרגה. */
	.col-heading-char {
		display: inline-block;
		transition: font-size 0.6s cubic-bezier(0.25, 0.46, 0.2, 1);
	}
	/* offset=+1 (כותרת משמאל לפעיל): צד ימין קרוב למרכז - גדול; שמאל רחוק - קטן */
	.col-slide[data-offset='1'] .col-heading-char {
		font-size: calc(1em - (var(--ci) / (var(--char-count) - 1)) * 0.2em);
	}
	/* offset=-1 (כותרת מימין לפעיל): צד שמאל קרוב למרכז - גדול; ימין רחוק - קטן */
	.col-slide[data-offset='-1'] .col-heading-char {
		font-size: calc(
			1em - ((var(--char-count) - 1 - var(--ci)) / (var(--char-count) - 1)) * 0.2em
		);
	}
	.col-slide[data-offset='2'] .col-heading-char {
		font-size: calc(1em - (var(--ci) / (var(--char-count) - 1)) * 0.3em);
	}
	.col-slide[data-offset='-2'] .col-heading-char {
		font-size: calc(
			1em - ((var(--char-count) - 1 - var(--ci)) / (var(--char-count) - 1)) * 0.3em
		);
	}
	.col-slide[data-offset='0'] .col-slide-inner > div:first-child {
		transform: translateX(0) scale(1) rotateY(0);
		opacity: 1;
	}
	/* offset חיובי = העמודה משמאל לפעיל; הקצה הרחוק (משמאל) צריך להיראות
	   קטן יותר → rotateY חיובי (הקצה השמאלי נסוג לעומק).
	   rotateY מופיע לפני scale - כך הסיבוב חל על האלמנט במלוא גודלו והאפקט גלוי. */
	.col-slide[data-offset='1'] .col-slide-inner > div:first-child {
		transform: translateX(-34%) rotateY(22deg) scale(0.62);
		opacity: 0.8;
	}
	.col-slide[data-offset='-1'] .col-slide-inner > div:first-child {
		transform: translateX(34%) rotateY(-22deg) scale(0.62);
		opacity: 0.8;
	}
	.col-slide[data-offset='2'] .col-slide-inner > div:first-child {
		transform: translateX(-66%) rotateY(28deg) scale(0.5);
		opacity: 0.55;
	}
	.col-slide[data-offset='-2'] .col-slide-inner > div:first-child {
		transform: translateX(66%) rotateY(-28deg) scale(0.5);
		opacity: 0.55;
	}

	/* ---- באנרים: סליידר אופקי טהור - נכנסים ויוצאים מהצד, ללא scale ---- */
	.col-slide-inner > div:last-child {
		transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.2, 1);
		will-change: transform;
	}
	.col-slide[data-offset='0'] .col-slide-inner > div:last-child {
		transform: translateX(0);
	}
	.col-slide[data-offset='1'] .col-slide-inner > div:last-child {
		transform: translateX(calc(-100% - 1.5rem));
	}
	.col-slide[data-offset='-1'] .col-slide-inner > div:last-child {
		transform: translateX(calc(100% + 1.5rem));
	}
	.col-slide[data-offset='2'] .col-slide-inner > div:last-child {
		transform: translateX(calc(-200% - 3rem));
	}
	.col-slide[data-offset='-2'] .col-slide-inner > div:last-child {
		transform: translateX(calc(200% + 3rem));
	}

	/* קלפים שאינם פעילים - מחוץ למסך - לא יקבלו קליקים.
	   ה-glow-bar מוצג רק על העמודה הפעילה - בצדדים מציגים רק את הכותרת הקטנה. */
	@media (max-width: 767px) {
		.col-slide:not([data-offset='0']) {
			pointer-events: none;
			/* מוציאים מחישוב הגובה - הגובה של הקרוסלה ייקבע רק לפי
			   העמודה הפעילה, כדי שלא ייווצר חלל ריק מתחת לעמודות קצרות. */
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
		}
		.col-slide:not([data-offset='0']) .glow-bar {
			display: none;
		}
	}

	/* מדסקטופ ומעלה - חוזרים לפריסת שלוש עמודות רגילה זו לצד זו */
	@media (min-width: 768px) {
		.cols-container {
			display: flex;
			flex-direction: row;
			align-items: stretch;
			overflow: visible;
			touch-action: auto;
			user-select: auto;
			-webkit-user-select: auto;
			transform: none;
			transition: none;
		}
		.cols-container .col-slide,
		.cols-container .col-slide[data-offset='0'],
		.cols-container .col-slide[data-offset='1'],
		.cols-container .col-slide[data-offset='-1'],
		.cols-container .col-slide[data-offset='2'],
		.cols-container .col-slide[data-offset='-2'] {
			grid-column: auto;
			grid-row: auto;
			flex: 1 1 0%;
			transform: none;
			opacity: 1;
			filter: none;
			z-index: auto;
			pointer-events: auto;
		}
		/* איפוס מלא של הטרנספורמים הפנימיים שמשמשים רק לקרוסלה בנייד */
		.cols-container .col-slide .col-slide-inner > div:first-child,
		.cols-container .col-slide .col-slide-inner > div:last-child {
			transform: none;
			opacity: 1;
			transition: none;
		}
		/* בדסקטופ - אותיות הכותרת באותו גודל, אין צמצום פר-אות.
		   ספציפיות מועלית עם [data-offset] כדי לנצח את הכללים בנייד. */
		.cols-container .col-slide[data-offset] .col-heading-char {
			font-size: inherit;
			transition: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.col-slide {
			transition: none;
		}
	}

	/* קפיצת activeCol ללא מעבר נראה (משמש לפני הדמו השלישי כדי להצמיד למשילות) */
	.cols-container.snap-no-transition .col-slide,
	.cols-container.snap-no-transition .col-slide-inner > div:first-child,
	.cols-container.snap-no-transition .col-slide-inner > div:last-child {
		transition: none !important;
	}

	/* ===== אנימציית "אצבע מנגבת" - נייד בלבד, פעם אחת ===== */
	.finger-demo {
		position: absolute;
		/* ממוקם בחלל שבין הכותרת הראשית לכותרות העמודות */
		top: 1.5rem;
		right: 6%;
		width: 9rem; /* יד פורטרט גבוהה - רוחב מתון, גובה מתאים */
		height: auto;
		pointer-events: none;
		z-index: 50;
		filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.7));
		animation: finger-swipe 2s cubic-bezier(0.32, 0.4, 0.36, 1) forwards;
	}
	.finger-smudge {
		position: absolute;
		/* נשאר במקום קבוע על המסך - היכן שהאצבע ניגבה (לא זז עם היד) */
		top: 3.9rem;
		right: 24%;
		width: 3.6rem;
		height: 0.7rem;
		border-radius: 50%;
		background: radial-gradient(
			ellipse at center,
			rgba(255, 255, 255, 0.95) 0%,
			rgba(255, 255, 255, 0.55) 40%,
			rgba(255, 255, 255, 0.15) 70%,
			rgba(255, 255, 255, 0) 90%
		);
		filter: blur(1.5px);
		transform: rotate(0deg);
		transform-origin: center;
		opacity: 0;
		pointer-events: none;
		z-index: 49;
		animation: finger-smudge 2s cubic-bezier(0.32, 0.4, 0.36, 1) forwards;
		animation-delay: 0.5s; /* עיכוב נוסף של חצי שניה כך שהסימן יופיע אחרי שהיד עוברת */
		mix-blend-mode: screen;
	}
	@keyframes finger-smudge {
		0%   { opacity: 0; }
		20%  { opacity: 0; }
		25%  { opacity: 0.95; }
		70%  { opacity: 0.95; }
		90%  { opacity: 0; }
		100% { opacity: 0; }
	}
	.finger-demo img {
		width: 100%;
		height: auto;
		display: block;
		/* סיבוב קל פנימה לכיוון הניגוב - לא מתערב באנימציה של .finger-demo */
		transform: rotate(-18deg);
		transform-origin: 60% 30%;
		animation: finger-tilt 2s cubic-bezier(0.32, 0.4, 0.36, 1) forwards;
	}
	@keyframes finger-tilt {
		0% { transform: rotate(-18deg); }
		25% { transform: rotate(-22deg); }
		45% { transform: rotate(-28deg); }
		100% { transform: rotate(-18deg); }
	}
	/* היד נכנסת רק כמחצית לתוך המסך מצד ימין, מבצעת ניגוב קצר שמאלה,
	   ויוצאת חזרה ימינה (לא חוצה את המסך). ללא fade.
	   ללא נקודת ביניים בחזרה - תנועה רציפה אחת מהשיא חזרה לימין כדי
	   למנוע "גמגום" שנוצר משינוי כיוון מודגש באמצע. */
	@keyframes finger-swipe {
		0% {
			transform: translateX(50vw) scale(1);
			opacity: 1;
		}
		25% {
			transform: translateX(20vw) scale(1);
			opacity: 1;
		}
		45% {
			transform: translateX(10vw) scale(1);
			opacity: 1;
		}
		100% {
			transform: translateX(55vw) scale(0.95);
			opacity: 1;
		}
	}
	/* גרסה הפוכה - הילוך אחורי לכל שלוש האנימציות (יד, ניגוב, הטיה) */
	.finger-demo.reverse {
		animation-direction: reverse;
	}
	.finger-demo.reverse img {
		animation-direction: reverse;
	}
	/* בריצה ההפוכה, היד מגיעה לשיא הניגוב ב-~55% (1100ms). מחזיקים את הניגוב
	   להופיע רק אחרי שהיא מגיעה לשם, ולא לפניה (כפי שקרה כשפשוט הפעלנו את
	   ה-keyframes המקוריים בהילוך אחורי). */
	.finger-smudge.reverse {
		animation-direction: normal;
		animation-name: finger-smudge-reverse;
	}
	@keyframes finger-smudge-reverse {
		0%   { opacity: 0; }
		45%  { opacity: 0; }
		50%  { opacity: 0.95; }  /* עם delay של 0.5s זה ייתן הופעה ב-1500ms בדיוק */
		85%  { opacity: 0.95; }
		95%  { opacity: 0; }
		100% { opacity: 0; }
	}

	@media (min-width: 768px) {
		.finger-demo {
			display: none !important;
		}
	}
</style>
