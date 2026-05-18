<script lang="ts">
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
</script>

<section class="flex items-center justify-center pt-0 pb-4 md:pb-6">
	<h1
		class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent
		       text-5xl md:text-7xl lg:text-8xl font-black text-center leading-tight px-4"
	>
		יוצאים לחירות
	</h1>
</section>

<section class="max-w-3xl mx-auto px-6 pb-12 text-center" dir="rtl">
	<h2
		class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent
		       text-3xl md:text-5xl font-black mb-2"
	>
		מי אנחנו?
	</h2>
	<p class="text-lg md:text-xl text-gray-300 leading-snug">
		יוצאים לחירות הינה תנועה חברתית, העוסקת לקדם ולשפר את החברה בישראל לחברה יותר
		אחראית, סולידרית וחופשיה. התנועה עוסקת לשחרר את התושבים מריכוזי הכח הנמצאים היום
		אצל קומץ השולטים בבנקים, בתקשורת, בכלכלה, בפוליטיקה וברשויות המדינה.
	</p>
	<p class="text-lg md:text-xl text-gray-300 leading-snug mt-3">
		<span class="font-black text-purple-300">החזון —</span>
		התאחדות התושבים, ביזור הכח הריכוזי שבמוסדות המדינה, פיקוח, ביקורת, ומעורבות של העם
		בקבלת ההחלטות.
	</p>
	<p class="text-lg md:text-xl text-gray-300 leading-snug mt-3">
		<span class="font-black text-purple-300">הפעלות —</span>
		יוצאים לחירות פיתחה אפליקציות המקדמות את המשילות, הקימה רכזים חברתיים בשכונות ברחבי
		הארץ, וקהילה גדולה המקדמת את ערכי החופש, האחווה, והמשילות של העם על מוסדותיו!
	</p>
</section>

<section class="max-w-3xl mx-auto px-6 pb-16">
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

<section class="max-w-6xl mx-auto px-6 pb-20" dir="rtl">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
		{#each columns as column, i (column.heading)}
			<div class="flex flex-col {i === 1 ? 'md:-mt-12' : ''}">
				<div class="mb-6 flex flex-col items-center">
					<h3
						class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent
						       text-4xl md:text-6xl font-black text-center"
					>
						{column.heading}
					</h3>
					<span class="glow-bar"></span>
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
</section>

<style>
	.glow-bar {
		display: block;
		height: 5px;
		width: 110px;
		margin-top: 0.6rem;
		border-radius: 9999px;
		background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
		box-shadow:
			0 0 10px rgba(167, 139, 250, 0.9),
			0 0 22px rgba(96, 165, 250, 0.55);
		transform-origin: center;
		animation: bar-reveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
	}

	@keyframes bar-reveal {
		0% {
			transform: scaleX(0);
			opacity: 0;
			filter: brightness(2.4);
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

	@media (prefers-reduced-motion: reduce) {
		.glow-bar {
			animation: none;
		}
	}
</style>
