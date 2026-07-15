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

	const catColor: Record<string, string> = {
		'ראשי': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
		'קהילה': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
		'משילות': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
		'כלכלה': 'bg-purple-500/20 text-purple-300 border-purple-500/30'
	};

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
			<span>🗺️</span> מפת רשת יוצאים לחירות
		</h1>
		<p class="mt-1 text-sm text-gray-400">
			כל הפלטפורמות של הרשת במקום אחד — סמנו אילו אתרים אתם כבר מכירים, וגלו את השאר.
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
	{/if}

	<!-- מקרא + הבהרת שמירה -->
	<div class="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
		<span class="inline-flex items-center gap-1.5">
			<span class="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-300">✓</span>
			מכירים
		</span>
		<span class="inline-flex items-center gap-1.5">
			<span class="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[10px] text-amber-300">✨</span>
			עדיין לא
		</span>
		<span class="text-gray-500">· לחיצה על "סימון" מסמנת אתר כמוכר · נשמר בדפדפן הזה</span>
	</div>

	<!-- קבוצות לפי קטגוריה -->
	{#each data.groups as group (group.category)}
		<section class="mb-8">
			<h2 class="mb-3 flex items-center gap-2 text-lg font-black text-white">
				<span>{catIcon[group.category] ?? '🕊️'}</span>
				<span>{group.category}</span>
				<span class="h-px flex-1 bg-white/10"></span>
			</h2>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each group.sites as site (site.id)}
					{@const isKnown = known.has(site.id)}
					<div
						class="relative flex flex-col overflow-hidden rounded-2xl border p-4 shadow-lg transition
							{isKnown
								? 'border-emerald-500/30 bg-emerald-500/[0.06]'
								: 'border-white/10 bg-white/[0.03]'}"
					>
						<!-- תג היכרות -->
						<span
							class="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold transition
								{isKnown
									? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-200'
									: 'border-amber-500/30 bg-amber-500/15 text-amber-200'}"
						>
							{#if isKnown}✓ מכירים{:else}✨ חדש לכם{/if}
						</span>

						<!-- אזור הקישור לאתר -->
						<a
							href={site.url}
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-start gap-3"
						>
							<div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
								{#if site.image}
									<img src={site.image} alt="" class="h-full w-full object-cover transition group-hover:scale-105" />
								{:else}
									<div class="flex h-full w-full items-center justify-center text-2xl">🕊️</div>
								{/if}
							</div>
							<div class="min-w-0 flex-1 pt-0.5">
								<h3 class="truncate text-base font-bold text-white group-hover:text-sky-300">{site.name}</h3>
								<span class="mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold {catColor[site.category] ?? 'border-white/20 text-gray-300'}">
									{site.category}
								</span>
								<p class="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-400">{site.description}</p>
								<span class="mt-1 inline-block text-xs text-sky-400" dir="ltr">
									{site.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
								</span>
							</div>
						</a>

						<!-- כפתור סימון ידני -->
						<button
							type="button"
							onclick={() => toggle(site.id)}
							disabled={!ready}
							aria-pressed={isKnown}
							class="mt-3 w-full rounded-lg border px-3 py-2 text-sm font-bold transition disabled:opacity-50
								{isKnown
									? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
									: 'border-white/15 bg-white/5 text-gray-200 hover:border-amber-400/40 hover:bg-white/10'}"
						>
							{#if isKnown}✓ אני מכיר/ה — בטלו סימון{:else}☆ סמנו: אני מכיר/ה{/if}
						</button>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>
