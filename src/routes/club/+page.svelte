<script lang="ts">
	// /club — "מועדון יוצאים לחירות": ההטבות לחבר המועדון. פתוח לכל גולש, מסומן כטיוטא.
	import ClubView from '$lib/components/club/ClubView.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>מועדון יוצאים לחירות | יוצאים לחירות</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<ClubView club={data.club} />
