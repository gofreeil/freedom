<script lang="ts">
	// ============================================================
	// "צוות הרכזים" — מי אחראי על כל אתר ברשת, ברשימה שבדף /about (ובדף /admin לאדמינים).
	// פתוח לכולם וקריאה בלבד; לסופר-אדמין מוצג במקומה NetworkAdminsEditor (טבלה ניתנת לעריכה).
	//
	// שתי פריסות:
	//   • דסקטופ (sm+) — זהה לפאנל: שורה אחת לכל אתר, באותה רשת עמודות
	//     ובאותם גדלים (SITE_ROWS_GRID_COLS), רק בלי שדות עריכה.
	//   • נייד — שם האתר עולה לכותרת ממורכזת מעל השורות, וכך נשאר רוחב מלא
	//     לשם האחראי ולתפקיד; בלי מסגרת חיצונית, שחתכה את תמונות האתרים. רשת
	//     הדסקטופ לא נכנסת למסך צר (רוחב מינימלי ~770px) וגררה גלילה אופקית.
	//
	// הנתונים נמשכים מ-/api/network-admins בצד הלקוח (ולא ב-load של
	// הדף) — תמונות האדמינים שמורות כ-data URL, ואין סיבה להעמיס אותן על כל
	// מי שנכנס לאודות.
	// ============================================================
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { SITES, type FreedomSite } from '$lib/sitesData';
	import { SITE_ROWS_GRID_COLS } from '$lib/components/admin/sitesGrid';
	import { locale } from 'svelte-i18n';
	import { ABOUT_TEXT, ADMINS_TEXT, aboutLang } from '$lib/aboutContent';

	// שפת התצוגה. הטבלה עצמה נשארת RTL בכל שפה — היא מראה של פאנל הניהול
	// (אותה רשת עמודות והיסטים), והשמות והתפקידים ממילא בעברית.
	const lang = $derived(aboutLang($locale));
	const tx = $derived(ADMINS_TEXT[lang]);
	const dir = $derived(ABOUT_TEXT[lang].dir);
	const siteName = (site: FreedomSite) => tx.siteNames[site.id] ?? site.name;

	interface PublicAdmin {
		name: string;
		role: string;
		email: string;
		phone: string;
		avatar: string;
	}

	let admins = $state<Record<string, PublicAdmin> | null>(null);
	let loadFailed = $state(false);
	let brokenAvatar = $state<Record<string, boolean>>({});
	let brokenImage = $state<Record<string, boolean>>({});

	// חנות החירות אינה חלק מהניהול (כמו בפאנל הסופר-אדמין)
	const managed = SITES.filter((s) => s.id !== 'freedom_store');

	// סדר האתרים — מגיע מהשרת יחד עם המינויים, כלומר בדיוק הסידור שהסופר-אדמין
	// עשה בפאנל. ריק = הסדר של sitesData.
	let order = $state<string[]>([]);
	const sites = $derived.by(() => {
		if (!order.length) return managed;
		const pos = new Map(order.map((id, i) => [id, i]));
		return [...managed].sort((a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity));
	});

	onMount(async () => {
		try {
			const res = await fetch('/api/network-admins');
			if (!res.ok) throw new Error(String(res.status));
			const json = (await res.json()) as {
				admins: Record<string, PublicAdmin>;
				order?: string[];
			};
			if (Array.isArray(json.order)) order = json.order;
			admins = json.admins ?? {};
		} catch {
			loadFailed = true;
		}
	});

	// מסגרות השדות — אותן מחלקות בדיוק של שדות ההזנה ב-SiteAdminRow (הפאנל),
	// כדי שהתצוגה כאן תיראה זהה לו. truncate במקום שורה שנשברת: גם שם השדה
	// בפאנל הוא input בשורה אחת.
	const FIELD_CLS =
		'truncate rounded-lg border border-white/10 bg-white/5 px-2.5 py-2.5 text-[16px] text-white';
	const NAME_FIELD_CLS =
		'truncate rounded-lg border border-white/10 bg-white/5 px-2.5 py-2.5 text-[15px] font-bold text-amber-400';

	// ── יצירת קשר ──
	// וואטסאפ: חלון אזהרה ("דחוף בלבד") לפני המעבר. הודעה: נשלחת לתיבה האישית של
	// הרכז בקהילה בשכונה + SMS אליו (ראו /api/coordinator-message) — למחוברים בלבד.
	type Target = { site: FreedomSite; admin: PublicAdmin };
	let waFor = $state<Target | null>(null);
	let msgFor = $state<Target | null>(null);
	let msgText = $state('');
	let sending = $state(false);
	let msgError = $state('');
	let msgSent = $state(false);
	const loggedIn = $derived(!!page.data.user);

	function openMessage(site: FreedomSite, admin: PublicAdmin) {
		waFor = null;
		msgFor = { site, admin };
		msgText = '';
		msgError = '';
		msgSent = false;
	}

	async function sendMessage() {
		if (!msgFor || sending) return;
		sending = true;
		msgError = '';
		try {
			const res = await fetch('/api/coordinator-message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ siteId: msgFor.site.id, text: msgText })
			});
			const json = (await res.json().catch(() => ({}))) as { error?: string };
			if (!res.ok) throw new Error(json.error || tx.sendFailed);
			msgSent = true;
		} catch (e) {
			msgError = e instanceof Error ? e.message : tx.sendFailed;
		} finally {
			sending = false;
		}
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			waFor = null;
			if (!sending) msgFor = null;
		}
	}

	/** קישור וואטסאפ: 05x-xxxxxxx → 9725xxxxxxxx */
	function waHref(phone: string): string {
		const digits = phone.replace(/\D/g, '');
		if (!digits) return '';
		return `https://wa.me/${digits.startsWith('0') ? '972' + digits.slice(1) : digits}`;
	}
</script>

<!-- תמונת האחראי (או עיגול ריק לאתר שטרם מונה לו) -->
{#snippet avatar(site: FreedomSite, admin: PublicAdmin | undefined, cls: string, iconCls: string)}
	<div class="flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5 {cls}">
		{#if admin?.avatar && !brokenAvatar[site.id]}
			<img
				src={admin.avatar}
				alt={admin.name}
				loading="lazy"
				decoding="async"
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
				decoding="async"
				class="h-full w-full object-cover"
				onerror={() => (brokenImage = { ...brokenImage, [site.id]: true })}
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center {iconCls}">🕊️</div>
		{/if}
	</div>
{/snippet}

<!-- כפתורי יצירת קשר: הודעה לתיבה (לכל רכז ממונה), וואטסאפ ומייל — רק כשיש פרטים -->
{#snippet contact(site: FreedomSite, admin: PublicAdmin | undefined, cls: string)}
	{#if admin?.name}
		<button
			type="button"
			onclick={() => openMessage(site, admin)}
			title={tx.msgTo(admin.name)}
			aria-label={tx.msgTo(admin.name)}
			class="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/15 {cls}"
			>✉️</button
		>
	{/if}
	{#if admin?.phone}
		<!-- וואטסאפ עובר קודם דרך אזהרה: מיועד למקרים דחופים בלבד -->
		<button
			type="button"
			onclick={() => (waFor = { site, admin })}
			title={tx.waTo(admin.name)}
			aria-label={tx.waTo(admin.name)}
			class="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/15 {cls}"
			>💬</button
		>
	{/if}
	{#if admin?.email}
		<a
			href="mailto:{admin.email}"
			title={tx.emailTo(admin.name)}
			aria-label={tx.emailTo(admin.name)}
			class="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/15 {cls}"
			>📧</a
		>
	{/if}
{/snippet}

<section dir="rtl">
	<h2 class="mb-3 flex items-center gap-2 text-lg font-black text-white sm:mb-4 sm:text-2xl">
		<span class="h-px flex-1 bg-white/10"></span>
		<span aria-hidden="true">🛡️</span> {tx.title}
		<span class="h-px flex-1 bg-white/10"></span>
	</h2>

	{#if loadFailed}
		<p class="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{tx.loadError}</p>
	{:else if !admins}
		<p class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">{tx.loading}</p>
	{:else}
		<!-- ── נייד: שם האתר ככותרת ממורכזת, ומתחתיה שתי שורות פרטי האחראי ── -->
		<ul class="sm:hidden">
			{#each sites as site (site.id)}
				{@const admin = admins[site.id]}
				<li class="border-b border-white/5 py-2 last:border-b-0">
					<!-- כותרת: שם האתר במרכז, מעל השורות -->
					<a
						href={site.url}
						target="_blank"
						rel="noopener noreferrer"
						class="mb-1.5 block text-center text-[14px] font-bold text-white"
					>
						{siteName(site)}
					</a>

					<div class="flex items-center gap-2">
						{@render avatar(site, admin, 'h-14 w-14', 'text-lg')}

						<!-- שם ותפקיד — שתי שורות, עם כל הרוחב שהכותרת פינתה.
						     הפונטים מוגדלים עד לגבול שבו שלוש השורות (שם + שני שורות
						     תפקיד) עדיין נמוכות מ-56px, כלומר מגובה התמונות שמכתיבות
						     את גובה השורה — כך הצורה לא משתנה. -->
						<div class="min-w-0 flex-1">
							<div class="line-clamp-1 text-[14px] font-bold leading-tight text-amber-400">
								{#if admin?.name}{admin.name}{:else}<span class="font-normal text-gray-500">{tx.notAssigned}</span>{/if}
							</div>
							{#if admin?.role}
								<div class="mt-0.5 line-clamp-2 text-[12px] leading-tight text-gray-400">{admin.role}</div>
							{/if}
						</div>

						<div class="grid grid-cols-2 place-items-center gap-1">
							{@render contact(site, admin, 'h-6 w-6 text-xs')}
						</div>

						<!-- תמונת האתר -->
						<a href={site.url} target="_blank" rel="noopener noreferrer" title={siteName(site)}>
							{@render siteImage(site, 'h-14 w-14 rounded-lg', 'text-xl')}
						</a>
					</div>
				</li>
			{/each}
		</ul>

		<!-- ── דסקטופ: אותה טבלה של הפאנל ── -->
		<div class="hidden overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:block">
			<div class="grid items-center gap-x-2 gap-y-1" style={SITE_ROWS_GRID_COLS}>
				{#each sites as site (site.id)}
					{@const admin = admins[site.id]}

					{@render avatar(site, admin, 'mx-auto h-[86px] w-[86px]', 'text-lg')}

					<!-- שם האחראי — באותה מסגרת של שדה השם בפאנל.
					     שורת רווח בלתי-נראית מעל, בגובה שורת שם האתר שבעמודת התפקיד,
					     כדי ששתי המסגרות יישבו על אותו קו. -->
					<div class="min-w-0">
						<div class="invisible mb-1 text-sm font-bold" aria-hidden="true">·</div>
						<div class={NAME_FIELD_CLS}>
							{#if admin?.name}{admin.name}{:else}<span class="font-normal text-gray-500">{tx.notAssigned}</span>{/if}
						</div>
					</div>

					<!-- תפקיד / הערה — באותה מסגרת של שדה התפקיד בפאנל,
					     ומעליה שם האתר בכחול, צמוד לקצה השמאלי של המסגרת -->
					<div class="min-w-0">
						<a
							href={site.url}
							target="_blank"
							rel="noopener noreferrer"
							class="-ml-[26px] mb-1 block truncate text-left text-sm font-bold text-sky-400 transition hover:text-sky-300 hover:underline"
						>
							{siteName(site)}
						</a>
						<div class={FIELD_CLS}>{admin?.role ?? ''}</div>
					</div>

					<!-- אתר (קישור לאתר עצמו) -->
					<a
						href={site.url}
						target="_blank"
						rel="noopener noreferrer"
						title={siteName(site)}
						class="mr-[26px] flex min-w-0 items-center gap-2"
					>
						{@render siteImage(site, 'h-[80px] w-[80px] rounded-xl', 'text-2xl')}
					</a>

					<!-- יצירת קשר -->
					<div class="flex items-center justify-center gap-1">
						{@render contact(site, admin, 'h-7 w-7 text-sm')}
					</div>

					<!-- עמודת הפעולות של הפאנל — ריקה כאן, שומרת על יישור זהה -->
					<div></div>
				{/each}
			</div>
		</div>
	{/if}
</section>

<svelte:window onkeydown={onKey} />

<!-- ── חלון אזהרה לפני וואטסאפ ── -->
{#if waFor}
	{@const t = waFor}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && (waFor = null)}
	>
		<div
			class="w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#0f172a] p-5 text-start shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="wa-warn-title"
			{dir}
		>
			<h3 id="wa-warn-title" class="mb-2 text-lg font-black text-amber-300">{tx.waWarnTitle}</h3>
			<p class="text-sm leading-relaxed text-gray-300">
				{tx.waWarnText(t.admin.name)}
			</p>
			<div class="mt-5 flex flex-wrap gap-2">
				<button
					type="button"
					onclick={() => openMessage(t.site, t.admin)}
					class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-black text-white transition hover:opacity-90"
				>
					{tx.leaveMessage}
				</button>
				{#if t.admin.email}
					<a
						href="mailto:{t.admin.email}"
						onclick={() => (waFor = null)}
						class="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/10"
					>
						{tx.email}
					</a>
				{/if}
				<a
					href={waHref(t.admin.phone)}
					target="_blank"
					rel="noopener noreferrer"
					onclick={() => (waFor = null)}
					class="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-200 transition hover:bg-amber-500/20"
				>
					{tx.waUrgent}
				</a>
			</div>
		</div>
	</div>
{/if}

<!-- ── השארת הודעה: לתיבה האישית של הרכז בקהילה בשכונה + SMS אליו ── -->
{#if msgFor}
	{@const t = msgFor}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && !sending && (msgFor = null)}
	>
		<div
			class="w-full max-w-md rounded-2xl border border-white/15 bg-[#0f172a] p-5 text-start shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="msg-title"
			{dir}
		>
			<h3 id="msg-title" class="mb-1 text-lg font-black text-white">{tx.msgTitle(t.admin.name)}</h3>
			<p class="mb-4 text-xs text-gray-400">{siteName(t.site)}</p>

			{#if msgSent}
				<p class="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm leading-relaxed text-emerald-200">
					{tx.msgSent(t.admin.name)}
				</p>
				<div class="mt-4">
					<button
						type="button"
						onclick={() => (msgFor = null)}
						class="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/10"
					>
						{tx.close}
					</button>
				</div>
			{:else if !loggedIn}
				<p class="text-sm leading-relaxed text-gray-300">
					{tx.loginNeeded}
				</p>
				<div class="mt-4 flex flex-wrap gap-2">
					<a
						href="/login?redirect={encodeURIComponent(page.url.pathname + page.url.search)}"
						class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-black text-white transition hover:opacity-90"
					>
						{tx.login}
					</a>
					{#if t.admin.email}
						<a
							href="mailto:{t.admin.email}"
							class="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/10"
						>
							{tx.orEmail}
						</a>
					{/if}
				</div>
			{:else}
				<form
					onsubmit={(e) => {
						e.preventDefault();
						sendMessage();
					}}
				>
					<label for="msg-text" class="sr-only">{tx.msgLabel}</label>
					<textarea
						id="msg-text"
						bind:value={msgText}
						rows="5"
						maxlength="2000"
						required
						minlength="5"
						placeholder={tx.msgPlaceholder}
						class="w-full resize-y rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-gray-500 focus:border-sky-500 focus:outline-none"
					></textarea>
					<p class="mt-1 text-xs text-gray-500">
						{tx.msgHint}
					</p>
					{#if msgError}
						<p class="mt-2 text-sm font-semibold text-red-400">{msgError}</p>
					{/if}
					<div class="mt-4 flex flex-wrap gap-2">
						<button
							type="submit"
							disabled={sending || msgText.trim().length < 5}
							class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-black text-white transition hover:opacity-90 disabled:opacity-40"
						>
							{sending ? tx.sending : tx.send}
						</button>
						<button
							type="button"
							disabled={sending}
							onclick={() => (msgFor = null)}
							class="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/10"
						>
							{tx.cancel}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
