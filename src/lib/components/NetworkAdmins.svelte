<script lang="ts">
	// ============================================================
	// "ניהול הרשת" — מי אחראי על כל אתר ברשת, בכרטיסייה שבדף /about.
	// פתוח לכולם וקריאה בלבד; העריכה נשארת בפאנל הסופר-אדמין (/admin).
	//
	// שתי פריסות:
	//   • דסקטופ (sm+) — זהה לפאנל: שורה אחת לכל אתר, באותה רשת עמודות
	//     ובאותם גדלים (SITE_ROWS_GRID_COLS), רק בלי שדות עריכה.
	//   • נייד — אותן עמודות דחוסות לשורה כפולה: תמונות ופונטים קטנים יותר,
	//     והכיתובים נשברים לשתי שורות במקום להיחתך. רשת הדסקטופ לא נכנסת
	//     למסך צר (רוחב מינימלי ~770px) והייתה גוררת גלילה אופקית.
	//
	// הנתונים נמשכים מ-/api/network-admins בפתיחת הכרטיסייה (ולא ב-load של
	// הדף) — תמונות האדמינים שמורות כ-data URL, ואין סיבה להעמיס אותן על כל
	// מי שנכנס לאודות.
	// ============================================================
	import { onMount } from 'svelte';
	import { SITES, type FreedomSite } from '$lib/sitesData';
	import { SITE_ROWS_GRID_COLS } from '$lib/components/admin/sitesGrid';

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
	let brokenAvatar = $state<Record<string, boolean>>({});
	let brokenImage = $state<Record<string, boolean>>({});

	// חנות החירות אינה חלק מהניהול (כמו בפאנל הסופר-אדמין)
	const managed = SITES.filter((s) => s.id !== 'freedom_store');

	// סדר האתרים — אותו סידור אישי ששמור בדפדפן מהפאנל, כדי שהרשימה תיראה
	// אותו דבר בשני המקומות. למי שלא סידר (כלומר כל שאר המבקרים) — סדר sitesData.
	const ORDER_KEY = 'admin:sitesOrder';
	let order = $state<string[]>([]);
	const sites = $derived.by(() => {
		if (!order.length) return managed;
		const pos = new Map(order.map((id, i) => [id, i]));
		return [...managed].sort((a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity));
	});

	onMount(async () => {
		try {
			const saved = JSON.parse(localStorage.getItem(ORDER_KEY) ?? '[]');
			if (Array.isArray(saved)) order = saved.filter((id) => typeof id === 'string');
		} catch {}
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

	// רוחב העמודות בנייד: תמונת אחראי | שם+תפקיד | אתר | יצירת קשר
	const MOBILE_GRID_COLS = 'grid-template-columns: 44px minmax(0,1fr) minmax(0,0.95fr) auto;';
</script>

<!-- תמונת האחראי (או עיגול ריק לאתר שטרם מונה לו) -->
{#snippet avatar(site: FreedomSite, admin: PublicAdmin | undefined, cls: string, iconCls: string)}
	<div class="flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5 {cls}">
		{#if admin?.avatar && !brokenAvatar[site.id]}
			<img
				src={admin.avatar}
				alt={admin.name}
				loading="lazy"
				class="h-full w-full object-cover"
				onerror={() => (brokenAvatar = { ...brokenAvatar, [site.id]: true })}
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center {iconCls}" aria-hidden="true">👤</div>
		{/if}
	</div>
{/snippet}

<!-- תמונת האתר -->
{#snippet siteImage(site: FreedomSite, cls: string, iconCls: string)}
	<div class="flex-shrink-0 overflow-hidden bg-white/5 {cls}">
		{#if site.image && !brokenImage[site.id]}
			<img
				src={site.image}
				alt=""
				loading="lazy"
				class="h-full w-full object-cover"
				onerror={() => (brokenImage = { ...brokenImage, [site.id]: true })}
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center {iconCls}">🕊️</div>
		{/if}
	</div>
{/snippet}

<!-- כפתורי יצירת קשר (מוצגים רק כשיש פרטים) -->
{#snippet contact(admin: PublicAdmin | undefined, cls: string)}
	{#if admin?.phone}
		<a
			href={waHref(admin.phone)}
			target="_blank"
			rel="noopener noreferrer"
			title="וואטסאפ ל{admin.name}"
			aria-label="וואטסאפ ל{admin.name}"
			class="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/15 {cls}"
			>💬</a
		>
	{/if}
	{#if admin?.email}
		<a
			href="mailto:{admin.email}"
			title="אימייל ל{admin.name}"
			aria-label="אימייל ל{admin.name}"
			class="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/15 {cls}"
			>📧</a
		>
	{/if}
{/snippet}

<section>
	<h2 class="mb-2 flex items-center gap-2 text-lg font-black text-white sm:text-2xl">
		<span aria-hidden="true">🛡️</span> ניהול הרשת
		<span class="h-px flex-1 bg-white/10"></span>
	</h2>
	<p class="mb-4 text-[13px] leading-relaxed text-gray-400 sm:mb-5 sm:text-sm">
		לכל פלטפורמה ברשת יש אחראי — מתנדב שמוביל אותה, מלווה את המשתמשים ואפשר לפנות אליו ישירות.
		הרשימה פתוחה לכולם; העדכון שלה נעשה בפאנל הניהול.
	</p>

	{#if error}
		<p class="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>
	{:else if !admins}
		<p class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">טוען…</p>
	{:else}
		<!-- ── נייד: שורה כפולה דחוסה לכל אתר ── -->
		<ul class="rounded-2xl border border-white/10 bg-white/[0.02] px-2 py-1 sm:hidden">
			{#each sites as site (site.id)}
				{@const admin = admins[site.id]}
				<li
					class="grid items-center gap-x-2 border-b border-white/5 py-2 last:border-b-0"
					style={MOBILE_GRID_COLS}
				>
					{@render avatar(site, admin, 'h-11 w-11', 'text-sm')}

					<!-- שם ותפקיד — הכיתוב נשבר לשתי שורות במקום להיחתך -->
					<div class="min-w-0">
						<div class="line-clamp-1 text-[12px] font-bold text-amber-400">
							{#if admin?.name}{admin.name}{:else}<span class="font-normal text-gray-500">טרם מונה</span>{/if}
						</div>
						{#if admin?.role}
							<div class="line-clamp-2 text-[10px] leading-tight text-gray-400">{admin.role}</div>
						{/if}
					</div>

					<!-- האתר -->
					<a
						href={site.url}
						target="_blank"
						rel="noopener noreferrer"
						title={site.name}
						class="flex min-w-0 items-center gap-1.5"
					>
						{@render siteImage(site, 'h-9 w-9 rounded-lg', 'text-base')}
						<span class="line-clamp-2 text-[11px] font-bold leading-tight text-white">{site.name}</span>
					</a>

					<div class="flex flex-col items-center gap-1">
						{@render contact(admin, 'h-6 w-6 text-xs')}
					</div>
				</li>
			{/each}
		</ul>

		<!-- ── דסקטופ: אותה טבלה של הפאנל ── -->
		<div class="hidden overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:block">
			<div class="grid items-center gap-x-2 gap-y-1" style={SITE_ROWS_GRID_COLS}>
				{#each sites as site (site.id)}
					{@const admin = admins[site.id]}

					{@render avatar(site, admin, 'mx-auto h-[76px] w-[76px]', 'text-lg')}

					<!-- שם האחראי -->
					<div class="truncate px-2.5 py-2.5 text-[15px] font-bold text-amber-400">
						{#if admin?.name}{admin.name}{:else}<span class="font-normal text-gray-500">טרם מונה</span>{/if}
					</div>

					<!-- תפקיד / הערה -->
					<div class="px-2.5 py-2.5 text-[13px] leading-snug text-gray-300">{admin?.role ?? ''}</div>

					<!-- אתר (קישור לאתר עצמו) -->
					<a
						href={site.url}
						target="_blank"
						rel="noopener noreferrer"
						title={site.name}
						class="group/site flex min-w-0 items-center gap-2"
					>
						{@render siteImage(site, 'h-[70px] w-[70px] rounded-xl', 'text-2xl')}
						<span
							class="truncate text-sm font-bold text-white transition group-hover/site:text-sky-300 group-hover/site:underline"
						>
							{site.name}
						</span>
					</a>

					<!-- יצירת קשר -->
					<div class="flex items-center justify-center gap-1">
						{@render contact(admin, 'h-7 w-7 text-sm')}
					</div>

					<!-- עמודת הפעולות של הפאנל — ריקה כאן, שומרת על יישור זהה -->
					<div></div>
				{/each}
			</div>
		</div>

		{#if canEdit}
			<div class="mt-3">
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
