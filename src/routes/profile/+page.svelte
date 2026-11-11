<script lang="ts">
	let { data } = $props();

	async function handleLogout() {
		try { await fetch('/api/logout', { method: 'POST' }); } catch {}
		try {
			const { signOut } = await import('@auth/sveltekit/client');
			await signOut({ callbackUrl: '/' });
		} catch {
			window.location.href = '/';
		}
	}
</script>

<svelte:head>
	<title>האזור האישי | יוצאים לחירות</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-6" dir="rtl">
	<div class="rounded-2xl border border-white/10 bg-[#0f1626] p-5 shadow-xl">
		<!-- פרטי משתמש קומפקטיים -->
		<div class="flex items-center gap-3.5 border-b border-white/10 pb-4">
			{#if data.user.image}
				<img src={data.user.image} alt="" class="h-14 w-14 rounded-full object-cover border-2 border-purple-500/40 shadow-md" />
			{:else}
				<div class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-md">
					{(data.user.name || data.user.email || 'U').charAt(0).toUpperCase()}
				</div>
			{/if}
			<div class="min-w-0 flex-1">
				<h1 class="text-lg font-black text-white truncate">{data.user.name || 'האזור האישי'}</h1>
				{#if data.user.email}
					<p class="text-xs text-gray-400 truncate">{data.user.email}</p>
				{/if}
			</div>
			<button
				type="button"
				onclick={handleLogout}
				class="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-900/30 hover:text-red-300 cursor-pointer"
			>
				<span aria-hidden="true">🚪</span> התנתקות
			</button>
		</div>

		<!-- כרטיסי ניהול ופעולות בתוך הפרופיל -->
		<div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
			{#if data.user.canManage}
				<a
					href="/admin"
					class="flex items-center gap-3 rounded-xl border border-purple-500/30 bg-purple-950/25 p-3 text-white transition hover:bg-purple-900/35 hover:border-purple-500/50"
				>
					<span class="text-xl" aria-hidden="true">🛡️</span>
					<div class="min-w-0 flex-1">
						<span class="block text-sm font-bold">ניהול ומשימות</span>
						<span class="block text-[11px] text-gray-400">מרכז העבודה של הצוות</span>
					</div>
				</a>
			{/if}

			<a
				href="/budget"
				class="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-white transition hover:bg-amber-900/30 hover:border-amber-500/50"
			>
				<span class="text-xl" aria-hidden="true">💰</span>
				<div class="min-w-0 flex-1">
					<span class="block text-sm font-bold">ניהול תקציב</span>
					<span class="block text-[11px] text-gray-400">מעקב והצבעה על תקציב</span>
				</div>
			</a>

			<a
				href="/club"
				class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10"
			>
				<span class="text-xl" aria-hidden="true">🕊️</span>
				<div class="min-w-0 flex-1">
					<span class="block text-sm font-bold">מועדון החירות</span>
					<span class="block text-[11px] text-gray-400">פעילויות וקהילה</span>
				</div>
			</a>

			<a
				href="/club/charter"
				class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10"
			>
				<span class="text-xl" aria-hidden="true">📜</span>
				<div class="min-w-0 flex-1">
					<span class="block text-sm font-bold">אמנת החברים</span>
					<span class="block text-[11px] text-gray-400">עקרונות הרשת</span>
				</div>
			</a>
		</div>
	</div>
</div>
