<script lang="ts">
	// /admin/tv — ניהול Freedom TV
	import TvView from '$lib/components/admin/tv/TvView.svelte';
	let { data } = $props();
</script>

<svelte:head><title>חירות TV | יוצאים לחירות</title></svelte:head>

<TvView guest={data.guest} />
