<script lang="ts">
	// ============================================================
	// "ניהול הרשת" — מי אחראי על כל אתר ברשת, לתצוגה בכרטיסייה שבדף /about.
	// פתוח לכולם וקריאה בלבד; העריכה נשארת בפאנל הסופר-אדמין (/admin).
	//
	// הנתונים נמשכים מ-/api/network-admins בפתיחת הכרטיסייה (ולא ב-load של
	// הדף) — תמונות האדמינים נשמרות כ-data URL, ואין סיבה להעמיס אותן על כל
	// מי שנכנס לאודות.
	// ============================================================
	import { onMount } from 'svelte';
	import { SITES } from '$lib/sitesData';

	let { canEdit = false }: { canEdit?: boolean } = $props();

	interface PublicAdmin {
		name: string;
		role: string;
		email: string;
		phone: string;
		avatar: string;
	}

	let admins = $state<Record<string, PublicAdmin> | null>(null);
	let error = $state('');
	let broken = $state<Record<string, boolean>>({});

	// חנות החירות אינה חלק מהניהול (כמו בפאנל הסופר-אדמין)
	const managed = SITES.filter((s) => s.id !== 'freedom_store');

	const staffed = $derived(
		admins ? managed.filter((s) => admins?.[s.id]?.name?.trim()) : []
	);
	const vacant = $derived(
		admins ? managed.filter((s) => !admins?.[s.id]?.name?.trim()) : []
	);

	onMount(async () => {
		try {
			const res = await fetch('/api/network-admins');
			if (!res.ok) throw new Error(String(res.status));
			admins = ((await res.json()) as { admins: Record<string, PublicAdmin> }).admins ?? {};
		} catch {
			error = 'לא הצלחנו לטעון את בעלי התפקידים ברשת. נסו לרענן את הדף.';
		}
	});

	/** קישור וואטסאפ: 05x-xxxxxxx → 9725xxxxxxxx */
	function waHref(phone: string): string {
		const digits = phone.replace(/\D/g, '');
		if (!digits) return '';
		return `https://wa.me/${digits.startsWith('0') ? '972' + digits.slice(1) : digits}`;
	}

	const contactCls =
		'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm transition hover:bg-white/15';
</script>

<section>
	<h2 class="mb-2 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
		<span aria-hidden="true">🛡️</span> ניהול הרשת
		<span class="h-px flex-1 bg-white/10"></span>
	</h2>
	<p class="mb-5 text-sm leading-relaxed text-gray-400">
		לכל פלטפורמה ברשת יש אחראי — מתנדב שמוביל אותה, מלווה את המשתמשים ואפשר לפנות אליו ישירות.
		הרשימה פתוחה לכולם; העדכון שלה נעשה בפאנל הניהול.
	</p>

	{#if error}
		<p class="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>
	{:else if !admins}
		<p class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">טוען…</p>
	{:else}
		{#if staffed.length}
			<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{#each staffed as site (site.id)}
					{@const admin = admins[site.id]}
					<li
						class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg transition hover:border-amber-400/30 hover:bg-white/[0.06]"
					>
						<!-- תמונת האחראי -->
						<div
							class="h-[68px] w-[68px] flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5"
						>
							{#if admin.avatar && !broken[site.id]}
								<img
									src={admin.avatar}
									alt={admin.name}
									loading="lazy"
									class="h-full w-full object-cover"
									onerror={() => (broken = { ...broken, [site.id]: true })}
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center text-xl" aria-hidden="true">👤</div>
							{/if}
						</div>

						<div class="min-w-0 flex-1">
							<div class="truncate text-[15px] font-black text-amber-400">{admin.name}</div>
							{#if admin.role}
								<div class="truncate text-xs text-gray-400">{admin.role}</div>
							{/if}
							<a
								href={site.url}
								target="_blank"
								rel="noopener noreferrer"
								class="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-white transition hover:text-sky-300 hover:underline"
							>
								{#if site.image}
									<img src={site.image} alt="" loading="lazy" class="h-5 w-5 rounded object-cover" />
								{/if}
								{site.name}
							</a>
						</div>

						<!-- יצירת קשר -->
						<div class="flex flex-shrink-0 flex-col gap-1.5">
							{#if admin.phone}
								<a
									href={waHref(admin.phone)}
									target="_blank"
									rel="noopener noreferrer"
									title="וואטסאפ ל{admin.name}"
									aria-label="וואטסאפ ל{admin.name}"
									class={contactCls}>💬</a
								>
							{/if}
							{#if admin.email}
								<a
									href="mailto:{admin.email}"
									title="אימייל ל{admin.name}"
									aria-label="אימייל ל{admin.name}"
									class={contactCls}>📧</a
								>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">
				עדיין לא מונו אחראים לאתרי הרשת.
			</p>
		{/if}

		{#if vacant.length}
			<div class="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
				<h3 class="mb-1.5 text-sm font-black text-gray-300">אתרים שממתינים לאחראי</h3>
				<p class="text-sm leading-relaxed text-gray-500">
					{vacant.map((s) => s.name).join(' · ')}
				</p>
				<p class="mt-2 text-xs text-gray-500">
					רוצים להוביל אחד מהם? כתבו לנו — נשמח לצרף אתכם.
				</p>
			</div>
		{/if}

		{#if canEdit}
			<div class="mt-4">
				<a
					href="/admin"
					class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/10"
				>
					✏️ עריכה בפאנל הניהול
				</a>
			</div>
		{/if}
	{/if}
</section>
