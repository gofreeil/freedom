<script lang="ts">
	// ============================================================
	// /admin — "ניהול הרשת" (סופר-אדמין ואדמיני אתרי הרשת בלבד; ההרשאה ב-load).
	// מרכז העבודה של הצוות: משימות, דיווחי פעילות וסקירת צוות (TeamWorkspace),
	// ובלשונית "צוות הרכזים" — הטבלה: ניתנת לעריכה לסופר-אדמין, לקריאה לשאר.
	// ============================================================
	import NetworkAdmins from '$lib/components/NetworkAdmins.svelte';
	import NetworkAdminsEditor from '$lib/components/admin/NetworkAdminsEditor.svelte';
	import TeamWorkspace from '$lib/components/admin/team/TeamWorkspace.svelte';

	let { data } = $props();
</script>

<svelte:head><title>ניהול הרשת | יוצאים לחירות</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 py-6" dir="rtl">
	<h1 class="mb-6 flex items-center gap-2.5 text-xl font-black text-white sm:text-2xl">
		<span aria-hidden="true">🛡️</span> ניהול הרשת
	</h1>

	<TeamWorkspace>
		{#if data.panel}
			<NetworkAdminsEditor panelData={data.panel} />
		{:else}
			<NetworkAdmins />
		{/if}
	</TeamWorkspace>
</div>
