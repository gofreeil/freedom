<script lang="ts">
	import { onMount } from 'svelte';
	import { signOut } from '@auth/sveltekit/client';

	let { data } = $props();

	// ההיכרות מסומנת ידנית ונשמרת בדפדפן. מפתח נפרד לכל משתמש (לפי אימייל),
	// כדי ששני משתמשים באותו דפדפן לא יראו את הסימונים אחד של השני.
	const STORAGE_KEY = $derived('gofreeil:known-sites:' + (data.me?.email || 'guest'));

	let known = $state<Set<string>>(new Set());
	let ready = $state(false);

	onMount(() => {
		if (!data.loggedIn) return; // אורח לא מסמן — סימון דורש התחברות/הרשמה
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const arr = JSON.parse(raw);
				if (Array.isArray(arr)) known = new Set(arr.filter((x) => typeof x === 'string'));
			}
		} catch {
			/* דפדפן ללא גישה ל-localStorage — ממשיכים ריק */
		}
		ready = true;
	});

	function toggle(id: string) {
		const next = new Set(known);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		known = next; // השמה מחדש — כדי להפעיל ריאקטיביות
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
		} catch {
			/* אין localStorage — הסימון עדיין עובד לצפייה הנוכחית */
		}
	}

	const knownCount = $derived(known.size);
	const pct = $derived(data.total ? Math.round((knownCount / data.total) * 100) : 0);
	const remaining = $derived(data.total - knownCount);

	const catIcon: Record<string, string> = {
		'ראשי': '🏛️',
		'קהילה': '🤝',
		'משילות': '⚖️',
		'כלכלה': '💰'
	};
</script>

<svelte:head><title>מפת רשת יוצאים לחירות</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8" dir="rtl">
	<!-- כותרת -->
	<header class="mb-6 text-center">
		<h1 class="flex items-center justify-center gap-2 text-2xl font-black text-white sm:text-3xl">
			<span>🗺️</span> יוצאים לחירות
		</h1>
		<p class="mt-1 text-sm text-gray-400">
			כל הפלטפורמות של הרשת במקום אחד — סמן אילו אתרים אתה כבר מכיר, וגלה את השאר.
		</p>
	</header>

	{#if data.loggedIn && data.me}
		<!-- מצב אישי: זהות + התקדמות היכרות -->
		<div class="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-lg">
			<div class="flex flex-wrap items-center gap-4">
				<div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-amber-500 to-pink-600">
					<img src={data.me.avatar} alt="" class="h-full w-full object-cover" />
				</div>
				<div class="min-w-0 flex-1">
					<div class="truncate text-lg font-black text-white">{data.me.name || 'ברוך הבא'}</div>
					<div class="truncate text-xs text-gray-400" dir="ltr">{data.me.email}</div>
				</div>
				<div class="flex items-center gap-2">
					<a
						href="https://community.gofreeil.com/profile"
						class="rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
					>
						🕊️ הפרופיל בקהילה
					</a>
					<button
						type="button"
						onclick={() => signOut({ callbackUrl: '/' })}
						class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-gray-300 transition hover:bg-white/10"
					>
						התנתקות
					</button>
				</div>
			</div>

			<!-- פס התקדמות -->
			<div class="mt-5">
				<div class="mb-1.5 flex items-center justify-between text-sm">
					<span class="font-bold text-white">
						סימנתם <span class="text-emerald-300">{knownCount}</span> מתוך {data.total} אתרי הרשת
					</span>
					<span class="text-gray-400">{pct}%</span>
				</div>
				<div class="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
					<div
						class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all"
						style="width: {pct}%"
					></div>
				</div>
				{#if remaining > 0}
					<p class="mt-2 text-xs text-gray-400">
						נותרו עוד <span class="font-bold text-amber-300">{remaining}</span> אתרים שאולי שווה להכיר ✨
					</p>
				{:else if knownCount > 0}
					<p class="mt-2 text-xs text-emerald-300">🎉 סימנתם את כל הרשת! כל הכבוד.</p>
				{/if}
			</div>
		</div>
	{:else}
		<!-- אורח: הזמנה ברורה להרשמה + הבטחת הזיהוי המשותף -->
		<div class="mb-8 rounded-3xl border border-amber-500/25 bg-gradient-to-l from-amber-500/10 to-pink-600/10 p-6 text-center shadow-lg">
			<p class="text-lg font-black text-white sm:text-xl">🕊️ הרשמה אחת — נוכחות בכל הרשת</p>
			<p class="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-amber-100/90 sm:text-base">
				מי שנרשם כאן מזוהה <span class="font-bold text-white">אוטומטית בכל האפליקציות</span> של יוצאים לחירות —
				חשבון אחד לכל אתרי הרשת. התחברו כדי לסמן אילו אתרים כבר מוכרים לכם ולגלות את השאר.
			</p>
			<div class="mt-4 flex flex-wrap justify-center gap-3">
				<a
					href="/register?redirect=/map"
					class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-black text-white transition hover:opacity-90"
				>
					✨ הרשמה
				</a>
				<a
					href="/login?redirect=/map"
					class="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-bold text-gray-200 transition hover:bg-white/10"
				>
					כבר רשומים? התחברות
				</a>
			</div>
		</div>
	{/if}

	<!-- קבוצות לפי קטגוריה -->
	{#each data.groups as group (group.category)}
		<section class="mb-8">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-black text-white">
				<span>{catIcon[group.category] ?? '🕊️'}</span>
				<span>{group.category}</span>
				<span class="h-px flex-1 bg-white/10"></span>
			</h2>

			<!-- קטגוריית "ראשי" (כרטיס יחיד) — הבאנר ממורכז; שאר הקטגוריות בגריד רגיל -->
			<div class="{group.category === 'ראשי' ? 'flex justify-center' : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'}">
				{#each group.sites as site (site.id)}
					{@const isKnown = data.loggedIn && known.has(site.id)}
					<div
						class="flex flex-col overflow-hidden rounded-2xl border shadow-lg transition
							{group.category === 'ראשי' ? 'w-full max-w-md' : ''}
							{isKnown ? 'border-emerald-500/40 bg-emerald-500/[0.06]' : 'border-white/10 bg-white/[0.03]'}"
					>
						<!-- באנר תמונה גדול -->
						<a
							href={site.url}
							target="_blank"
							rel="noopener noreferrer"
							class="group relative block"
							aria-label={site.name}
						>
							<div class="relative h-44 w-full overflow-hidden bg-white/5">
								{#if site.image}
									<img
										src={site.image}
										alt=""
										class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
									/>
								{:else}
									<div class="flex h-full w-full items-center justify-center text-5xl">🕊️</div>
								{/if}
								<!-- הצללה תחתונה לקריאוּת השם -->
								<div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

								<!-- תג היכרות (רק למחוברים) -->
								{#if data.loggedIn}
									<span
										class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm transition
											{isKnown
												? 'border-emerald-400/40 bg-emerald-500/30 text-emerald-50'
												: 'border-white/25 bg-black/40 text-amber-100'}"
									>
										{#if isKnown}✓ מכירים{:else}✨ חדש{/if}
									</span>
								{/if}

								<!-- שם האתר על הבאנר -->
								<h3 class="absolute inset-x-0 bottom-0 px-4 pb-3 text-xl font-black leading-tight text-white drop-shadow-lg">
									{site.name}
								</h3>
							</div>
						</a>

						<!-- פעולה: סימון (מחובר) / הזמנה להתחבר (אורח) -->
						<div class="p-3">
							{#if data.loggedIn}
								<button
									type="button"
									onclick={() => toggle(site.id)}
									disabled={!ready}
									aria-pressed={isKnown}
									class="w-full rounded-xl border px-3 py-2.5 text-sm font-bold transition disabled:opacity-50
										{isKnown
											? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25'
											: 'border-white/15 bg-white/5 text-gray-100 hover:border-amber-400/40 hover:bg-white/10'}"
								>
									{#if isKnown}✓ אני מכיר/ה — בטל סימון{:else}☆ סמן: אני מכיר/ה{/if}
								</button>
							{:else}
								<a
									href="/register?redirect=/map"
									class="flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold text-gray-200 transition hover:border-amber-400/40 hover:bg-white/10"
								>
									🔒 התחברו כדי לסמן
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>
