<script lang="ts">
	import { onMount } from 'svelte';
	import BudgetView from '$lib/components/budget/BudgetView.svelte';
	import TeamWorkspace from '$lib/components/admin/team/TeamWorkspace.svelte';
	import NetworkAdmins from '$lib/components/NetworkAdmins.svelte';
	import NetworkAdminsEditor from '$lib/components/admin/NetworkAdminsEditor.svelte';
	import TvView from '$lib/components/admin/tv/TvView.svelte';
	import ProtocolsView from '$lib/components/admin/protocols/ProtocolsView.svelte';
	import AchievementsView from '$lib/components/achievements/AchievementsView.svelte';
	import ConferenceView from '$lib/components/admin/conference/ConferenceView.svelte';

	let { data } = $props();

	type TabKey = 'admin' | 'budget' | 'tv' | 'protocols' | 'conference' | 'achievements';
	let activeTab = $state<TabKey>(data.user.canManage ? 'admin' : 'budget');

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const t = params.get('tab') as TabKey | null;
		if (t && (t === 'budget' || t === 'achievements' || ((t === 'admin' || t === 'tv' || t === 'protocols' || t === 'conference') && data.user.canManage))) {
			activeTab = t;
		}
	});

	function switchTab(t: TabKey) {
		activeTab = t;
		const url = new URL(window.location.href);
		url.searchParams.set('tab', t);
		window.history.replaceState({}, '', url);
	}

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

<div class="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6" dir="rtl">
	<div class="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1626] shadow-xl">
		<!-- פרטי משתמש קומפקטיים -->
		<div class="flex items-center gap-3.5 border-b border-white/10 bg-white/[0.02] p-4 sm:p-5">
			{#if data.user.image}
				<img src={data.user.image} alt="" class="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-purple-500/40 shadow-md" />
			{:else}
				<div class="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg sm:text-xl font-bold text-white shadow-md">
					{(data.user.name || data.user.email || 'U').charAt(0).toUpperCase()}
				</div>
			{/if}
			<div class="min-w-0 flex-1">
				<h1 class="text-base sm:text-lg font-black text-white truncate">{data.user.name || 'האזור האישי'}</h1>
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

		<!-- שורת לשוניות (כרטיסיות) למעבר תחת אותו דף -->
		<div class="flex flex-wrap items-center gap-1.5 sm:gap-2 border-b border-white/10 bg-[#141c2f]/70 px-3 py-2 sm:px-5">
			{#if data.user.canManage}
				<button
					type="button"
					onclick={() => switchTab('admin')}
					class="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer {activeTab === 'admin' ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'}"
				>
					<span aria-hidden="true">🛡️</span>
					<span>ניהול ומשימות</span>
				</button>
			{/if}

			<button
				type="button"
				onclick={() => switchTab('budget')}
				class="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer {activeTab === 'budget' ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'}"
			>
				<span aria-hidden="true">💰</span>
				<span>ניהול תקציב</span>
			</button>

			<button
				type="button"
				onclick={() => switchTab('achievements')}
				class="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer {activeTab === 'achievements' ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'}"
			>
				<span aria-hidden="true">🏆</span>
				<span>ההישגים שלי</span>
			</button>

			{#if data.user.canManage}
				<button
					type="button"
					onclick={() => switchTab('tv')}
					class="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer {activeTab === 'tv' ? 'bg-blue-500/25 text-blue-200 border border-blue-400/40 shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'}"
				>
					<span aria-hidden="true">📺</span>
					<span>חירות TV</span>
				</button>
				<button
					type="button"
					onclick={() => switchTab('protocols')}
					class="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer {activeTab === 'protocols' ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'}"
				>
					<span aria-hidden="true">📜</span>
					<span>פרוטוקולים</span>
				</button>
				<button
					type="button"
					onclick={() => switchTab('conference')}
					class="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer {activeTab === 'conference' ? 'bg-teal-500/25 text-teal-200 border border-teal-400/40 shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'}"
				>
					<span aria-hidden="true">🎙️</span>
					<span>ועידה</span>
				</button>
			{/if}
		</div>

		<!-- תוכן הכרטיסייה הפתוחה -->
		<div class="p-2 sm:p-4">
			{#if activeTab === 'admin' && data.user.canManage}
				<div class="py-2">
					<TeamWorkspace>
						{#if data.panel}
							<NetworkAdminsEditor panelData={data.panel} />
						{:else}
							<NetworkAdmins />
						{/if}
					</TeamWorkspace>
				</div>
			{:else if activeTab === 'budget'}
				<BudgetView canVote={data.canVote} />
			{:else if activeTab === 'achievements'}
				<AchievementsView user={data.user} canManage={data.user.canManage} />
			{:else if activeTab === 'tv' && data.user.canManage}
				<TvView guest={data.tvGuest} />
			{:else if activeTab === 'protocols' && data.user.canManage}
				<ProtocolsView />
			{:else if activeTab === 'conference' && data.user.canManage}
				<ConferenceView user={data.user} />
			{/if}
		</div>
	</div>
</div>
