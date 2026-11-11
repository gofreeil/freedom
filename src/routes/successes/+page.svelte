<script lang="ts">
	import SuccessesView from '$lib/components/successes/SuccessesView.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>ההצלחות שלנו | תנועת יוצאים לחירות</title>
	<meta name="description" content="ההישגים, המאבקים וההצלחות של תנועת יוצאים לחירות למען שקיפות, חירות וצדק חברתי" />
</svelte:head>

<SuccessesView user={data.user} canManage={data.canManage} />
