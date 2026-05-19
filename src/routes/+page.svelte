<script lang="ts">
	import { onMount } from 'svelte';

	interface Site {
		title: string;
		description: string;
		href?: string;
		image?: string;
		comingSoon?: boolean;
	}

	const columns: { heading: string; sites: Site[] }[] = [
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
					description: 'בקרוב.',
					image: '/images/the-experts.png',
					comingSoon: true
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
					comingSoon: true
				}
			]
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
			delay: (r3 * 3).toFixed(2),
			duration: (3.2 + r4 * 2).toFixed(2),
			size: (2.5 + r1 * 3.8).toFixed(1)
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
					timer = setTimeout(() => (dustActive = false), 8500);
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
	<p class="intro-p text-lg md:text-xl text-gray-300 leading-snug">
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
	<p class="intro-p text-lg md:text-xl text-gray-300 leading-snug mt-3">
		<span class="font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">החזון —</span>
		התאחדות התושבים, ביזור הכח הריכוזי שבמוסדות המדינה, פיקוח, ביקורת, ומעורבות של העם
		בקבלת ההחלטות.
	</p>
	<p class="intro-p text-lg md:text-xl text-gray-300 leading-snug mt-3">
		<span class="font-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">הפעילות —</span>
		יוצאים לחירות פיתחה אפליקציות המקדמות את המשילות, הקימה רכזים חברתיים בשכונות ברחבי
		הארץ, וקהילה גדולה המקדמת את ערכי החופש, האחווה, והמשילות של העם על מוסדותיו!
	</p>
</section>

<section class="max-w-4xl mx-auto px-6 pb-16">
	<div class="relative w-full overflow-hidden rounded-2xl shadow-2xl" style="padding-top:56.25%">
		<iframe
			class="absolute inset-0 h-full w-full"
			src="https://www.youtube-nocookie.com/embed/CjBbU2ZOsa8?start=2"
			title="יוצאים לחירות"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe>
	</div>
</section>

<section class="max-w-6xl mx-auto px-6 pb-20" dir="rtl" class:revealed>
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
	<div class="flex flex-col md:flex-row md:items-stretch gap-8 md:gap-12">
		{#each columns as column, i (column.heading)}
			{#if i > 0}
				<div
					class="hidden md:block w-px self-stretch
					       bg-gradient-to-b from-transparent via-slate-400/40 to-transparent"
				></div>
			{/if}
			<div class="flex flex-1 flex-col {i === 1 ? 'md:-mt-12' : ''}">
				<div class="mb-12 flex flex-col items-center">
					<h3
						class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent
						       text-4xl md:text-6xl font-black text-center"
					>
						{column.heading}
					</h3>
					<span class="glow-bar">
						<span class="glow-bar-line glow-bar-line-start"></span>
						<span class="glow-bar-gem"></span>
						<span class="glow-bar-line glow-bar-line-end"></span>
					</span>
				</div>
				<div class="flex flex-col gap-6">
					{#each column.sites as site (site.title)}
						<svelte:element
							this={site.href ? 'a' : 'div'}
							href={site.href}
							target={site.href ? '_blank' : undefined}
							rel={site.href ? 'noopener noreferrer' : undefined}
							class="group block overflow-hidden rounded-2xl border border-purple-500/20 bg-white/5
							       transition-all hover:border-purple-500/50 hover:bg-white/10
							       {site.comingSoon ? 'opacity-60' : 'hover:scale-[1.02]'}"
						>
							<div class="h-40 w-full overflow-hidden bg-slate-800">
								{#if site.image}
									<img
										src={site.image}
										alt={site.title}
										class="h-full w-full object-cover transition-transform group-hover:scale-105"
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
							</div>
							<div class="p-4">
								<p class="mb-1 text-lg font-black text-white">{site.title}</p>
								<p class="text-sm leading-snug text-gray-400">{site.description}</p>
							</div>
						</svelte:element>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div
		class="mx-auto mt-20 h-px max-w-3xl
		       bg-gradient-to-r from-transparent via-slate-400/40 to-transparent"
	></div>

	<h2
		class="mt-12 text-center text-2xl md:text-4xl font-black leading-snug
		       bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
	>
		הצטרפו כדי לתמוך מבפנים
	</h2>

	<h2
		class="mt-12 text-center text-2xl md:text-4xl font-black leading-snug
		       bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
	>
		עקבו אחרינו ברשתות החברתיות
	</h2>
</section>

<style>
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
		animation: dust-fade 7.8s linear forwards;
		animation-play-state: paused;
	}

	.revealed .magic-dust,
	.revealed .glow-bar,
	.revealed .glow-bar-line,
	.revealed .glow-bar-gem {
		animation-play-state: running;
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
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 150px;
		margin-top: 0.55rem;
		animation: bar-charge 1.4s ease-out 6.3s both;
		animation-play-state: paused;
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
		height: 3px;
		box-shadow:
			0 0 8px rgba(241, 245, 249, 0.85),
			0 0 18px rgba(203, 213, 225, 0.5);
		animation: line-reveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
		animation-play-state: paused;
	}

	.glow-bar-line-start {
		background: linear-gradient(90deg, #ffffff 0%, rgba(203, 213, 225, 0.55) 65%, transparent 100%);
		transform-origin: left;
	}

	.glow-bar-line-end {
		background: linear-gradient(90deg, transparent 0%, rgba(203, 213, 225, 0.55) 35%, #ffffff 100%);
		transform-origin: right;
	}

	.glow-bar-gem {
		width: 9px;
		height: 9px;
		flex-shrink: 0;
		background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%);
		box-shadow:
			0 0 8px rgba(241, 245, 249, 0.95),
			0 0 18px rgba(203, 213, 225, 0.6);
		animation: gem-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
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
		.glow-bar-gem {
			animation: none;
		}
	}
</style>
