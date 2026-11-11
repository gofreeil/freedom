<script lang="ts">
	// /budget — "ניהול תקציב": צפייה לכל משתמש מחובר; הצבעה על חלוקת התקציב לאדמינים
	import BudgetView from '$lib/components/budget/BudgetView.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>ניהול תקציב | יוצאים לחירות</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<BudgetView canVote={data.canVote} />
