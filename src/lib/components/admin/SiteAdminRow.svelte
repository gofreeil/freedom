<script lang="ts">
	import { enhance } from '$app/forms';
	import type { FreedomSite } from '$lib/sitesData';
	import AvatarCropper from './AvatarCropper.svelte';

	interface Admin {
		adminEmail: string;
		adminName: string;
		role?: string;
		phone?: string;
		communityId?: string;
		avatarUrl?: string;
		avatar?: string;
		updatedAt: string;
		updatedBy: string;
	}

	let {
		site,
		editMode = false
	}: { site: FreedomSite & { admin: Admin | null }; editMode?: boolean } = $props();

	// ערכי הטופס — מקומיים כדי לא לאבד הקלדה בזמן שמירה/שגיאה.
	// svelte-ignore state_referenced_locally
	let name = $state(site.admin?.adminName ?? '');
	// svelte-ignore state_referenced_locally
	let role = $state(site.admin?.role ?? '');
	// svelte-ignore state_referenced_locally
	let email = $state(site.admin?.adminEmail ?? '');
	// svelte-ignore state_referenced_locally
	let phone = $state(site.admin?.phone ?? '');
	// svelte-ignore state_referenced_locally
	let communityId = $state(site.admin?.communityId ?? '');
	// svelte-ignore state_referenced_locally
	let avatarUrl = $state(site.admin?.avatarUrl ?? '');
	let busy = $state(false);
	let status = $state<{ type: 'ok' | 'err'; msg: string } | null>(null);
	let imgOk = $state(true);
	let avatarBroken = $state(false);
	let pickedFile = $state<File | null>(null);
	let formEl: HTMLFormElement;
	let fileInput: HTMLInputElement;

	const hasAdmin = $derived(!!site.admin);
	// התמונה לתצוגה: מה שהועלה/הוגדר מקומית, אחרת האפקטיבית מהשרת (Gravatar וכו')
	const avatar = $derived(avatarUrl.trim() ? avatarUrl : (site.admin?.avatar ?? ''));

	// קישור וואטסאפ: 05x-xxxxxxx → 9725xxxxxxxx
	const waHref = $derived.by(() => {
		const digits = phone.replace(/\D/g, '');
		if (!digits) return '';
		return `https://wa.me/${digits.startsWith('0') ? '972' + digits.slice(1) : digits}`;
	});
	const mailHref = $derived(email.trim() ? `mailto:${email.trim()}` : '');
	// צ'אט בקהילה בשכונה: לפי מזהה מפורש, ואם אין — ניסיון לפי האימייל (חשבון credentials)
	const chatHref = $derived.by(() => {
		const id = communityId.trim() || (email.trim() ? `credentials_${email.trim().toLowerCase()}` : '');
		return id ? `https://community.gofreeil.com/admin/users/${encodeURIComponent(id)}#chat` : '';
	});

	const contactBtnCls =
		'flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm transition hover:bg-white/15';

	// שמירה אוטומטית ביציאה משדה שהשתנה (onchange) — אין כפתור "שמור".
	function autoSave() {
		if (!name.trim()) return; // בלי שם אין מה לשמור
		formEl.requestSubmit();
	}

	// בחירת קובץ תמונה (במצב עריכה)
	function pickPhoto() {
		if (!name.trim()) {
			status = { type: 'err', msg: 'צריך למלא שם אדמין לפני העלאת תמונה' };
			return;
		}
		fileInput.click();
	}
	function onFileChosen(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const f = input.files?.[0];
		if (f) pickedFile = f;
		input.value = ''; // מאפשר לבחור שוב את אותו קובץ
	}
	function onCropSave(dataUrl: string) {
		pickedFile = null;
		avatarUrl = dataUrl;
		avatarBroken = false;
		formEl.requestSubmit();
	}

	const inputCls =
		'w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[13px] text-white placeholder:text-gray-500 focus:border-sky-500 focus:outline-none';
</script>

<form
	method="POST"
	action="?/assign"
	style="display: contents"
	bind:this={formEl}
	use:enhance={({ action }) => {
		const isRemove = action.search.includes('remove');
		busy = true;
		status = null;
		return async ({ result, update }) => {
			busy = false;
			if (result.type === 'success') {
				status = { type: 'ok', msg: isRemove ? 'הוסר' : 'נשמר ✓' };
				if (isRemove) {
					name = '';
					role = '';
					avatarUrl = '';
					avatarBroken = false;
				}
			} else if (result.type === 'failure') {
				status = { type: 'err', msg: (result.data?.error as string) ?? 'הפעולה נכשלה' };
			} else {
				status = { type: 'err', msg: 'אירעה שגיאה' };
			}
			await update({ reset: false });
		};
	}}
>
	<input type="hidden" name="siteId" value={site.id} />
	<!-- התמונה נשלחת תמיד כערך חבוי (מוזנת דרך הקרופר) -->
	<input type="hidden" name="avatarUrl" value={avatarUrl} />
	{#if !editMode}
		<!-- מחוץ למצב עריכה — פרטי הקשר עוברים כערכים חבויים כדי לא להימחק בשמירה -->
		<input type="hidden" name="adminEmail" value={email} />
		<input type="hidden" name="phone" value={phone} />
		<input type="hidden" name="communityId" value={communityId} />
	{/if}

	<!-- אתר (קישור לאתר עצמו) -->
	<a
		href={site.url}
		target="_blank"
		rel="noopener"
		title={site.name}
		class="group/site flex min-w-0 items-center gap-2 py-1"
	>
		<div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
			{#if site.image && imgOk}
				<img src={site.image} alt="" class="h-full w-full object-cover" onerror={() => (imgOk = false)} />
			{:else}
				<div class="flex h-full w-full items-center justify-center text-sm">🕊️</div>
			{/if}
		</div>
		<span class="truncate text-sm font-bold text-white transition group-hover/site:text-sky-300 group-hover/site:underline">
			{site.name}
		</span>
	</a>

	<!-- שם האדמין -->
	<input
		name="adminName"
		bind:value={name}
		onchange={autoSave}
		placeholder="שם"
		aria-label="שם האדמין"
		class={inputCls}
	/>

	<!-- תפקיד / הערה -->
	<input
		name="role"
		bind:value={role}
		onchange={autoSave}
		placeholder="תפקיד / הערה"
		aria-label="תפקיד או הערה"
		class={inputCls}
	/>

	<!-- תמונת האדמין (בלי padding אנכי — כך העיגול גדל בלי להגביה את השורה) -->
	<div class="flex items-center justify-center">
		{#if editMode}
			<button
				type="button"
				onclick={pickPhoto}
				title="העלאת תמונה"
				aria-label="העלאת תמונת האדמין"
				class="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-dashed border-sky-400/60 bg-white/5"
			>
				{#if avatar && !avatarBroken}
					<img src={avatar} alt="" class="h-full w-full object-cover" onerror={() => (avatarBroken = true)} />
				{:else}
					<span class="flex h-full w-full items-center justify-center text-lg" aria-hidden="true">👤</span>
				{/if}
				<span
					class="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-base opacity-70 transition group-hover:opacity-100"
					aria-hidden="true"
				>
					📷
				</span>
			</button>
			<input type="file" accept="image/*" hidden bind:this={fileInput} onchange={onFileChosen} />
		{:else}
			<div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5">
				{#if avatar && !avatarBroken}
					<img
						src={avatar}
						alt={name || 'תמונת האדמין'}
						class="h-full w-full object-cover"
						onerror={() => (avatarBroken = true)}
					/>
				{:else}
					<div class="flex h-full w-full items-center justify-center text-lg" aria-hidden="true">👤</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- יצירת קשר -->
	<div class="flex items-center justify-center gap-1">
		{#if waHref}
			<a href={waHref} target="_blank" rel="noopener" title="וואטסאפ" aria-label="וואטסאפ" class={contactBtnCls}>💬</a>
		{:else}
			<span class="{contactBtnCls} cursor-default opacity-25" title="אין טלפון — מלאו במצב עריכה" aria-hidden="true">💬</span>
		{/if}
		{#if mailHref}
			<a href={mailHref} title="שליחת אימייל" aria-label="שליחת אימייל" class={contactBtnCls}>📧</a>
		{:else}
			<span class="{contactBtnCls} cursor-default opacity-25" title="אין אימייל — מלאו במצב עריכה" aria-hidden="true">📧</span>
		{/if}
		{#if chatHref}
			<a href={chatHref} target="_blank" rel="noopener" title="הודעה בצ'אט קהילה בשכונה" aria-label="הודעה בצ'אט קהילה בשכונה" class={contactBtnCls}>🏘️</a>
		{:else}
			<span class="{contactBtnCls} cursor-default opacity-25" title="אין מזהה/אימייל — מלאו במצב עריכה" aria-hidden="true">🏘️</span>
		{/if}
	</div>

	<!-- הסרה -->
	<div class="flex items-center justify-end">
		{#if hasAdmin}
			<button
				type="submit"
				formaction="?/remove"
				formnovalidate
				disabled={busy}
				title="הסרת האדמין"
				aria-label="הסרת האדמין"
				class="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
			>
				🗑
			</button>
		{/if}
	</div>

	<!-- פרטי קשר — נערכים רק במצב עריכה, בשורת-משנה מתחת לשורה -->
	{#if editMode}
		<div class="col-span-full flex flex-wrap items-center gap-2 pb-1.5">
			<input
				name="adminEmail"
				type="email"
				bind:value={email}
				onchange={autoSave}
				placeholder="אימייל"
				aria-label="אימייל האדמין"
				dir="ltr"
				class="{inputCls} max-w-[210px] text-right"
			/>
			<input
				name="phone"
				bind:value={phone}
				onchange={autoSave}
				placeholder="טלפון (לוואטסאפ)"
				aria-label="טלפון האדמין"
				dir="ltr"
				class="{inputCls} max-w-[160px] text-right"
			/>
			<input
				name="communityId"
				bind:value={communityId}
				onchange={autoSave}
				placeholder="מזהה בקהילה בשכונה"
				aria-label="מזהה המשתמש בקהילה בשכונה"
				dir="ltr"
				class="{inputCls} max-w-[190px] text-right"
			/>
		</div>
	{/if}

	<!-- סטטוס (משתרע על כל הרוחב, מופיע רק כשיש) -->
	{#if status}
		<div class="col-span-full -mt-0.5 pb-1 text-[11px] font-semibold {status.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}">
			{site.name}: {status.msg}
		</div>
	{/if}
</form>

{#if pickedFile}
	<AvatarCropper file={pickedFile} onsave={onCropSave} oncancel={() => (pickedFile = null)} />
{/if}
