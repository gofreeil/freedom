<script lang="ts">
	// ============================================================
	// /admin — "ניהול הרשת" (סופר-אדמין ואדמיני אתרי הרשת בלבד; ההרשאה ב-load).
	// כאן ינוהלו בהמשך גם משימות הארגון. כרגע: טבלת הרכזים — ניתנת לעריכה
	// לסופר-אדמין, לקריאה בלבד לשאר האדמינים.
	// ============================================================
	import NetworkAdmins from '$lib/components/NetworkAdmins.svelte';
	import NetworkAdminsEditor from '$lib/components/admin/NetworkAdminsEditor.svelte';

	let { data } = $props();
</script>

<svelte:head><title>ניהול הרשת | יוצאים לחירות</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 py-6" dir="rtl">
	<h1 class="mb-6 flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
		<span aria-hidden="true">🛡️</span> ניהול הרשת
	</h1>

	{#if data.panel}
		<NetworkAdminsEditor panelData={data.panel} />
	{:else}
		<NetworkAdmins />
	{/if}
</div>
