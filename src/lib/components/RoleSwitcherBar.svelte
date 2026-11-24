<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';

	let { currentRole = 'super_admin' }: { currentRole?: 'super_admin' | 'admin' | 'user' | 'guest' } = $props();

	let loadingRole = $state<string | null>(null);
	let isMinimized = $state(false);

	async function switchRole(role: 'super_admin' | 'admin' | 'user' | 'guest') {
		if (loadingRole || currentRole === role) return;
		loadingRole = role;

		try {
			// שמירת מצב הסימולציה בעוגייה
			document.cookie = 'role_sim_active=1; path=/; max-age=604800; SameSite=Lax';
			document.cookie = `role_sim_role=${role}; path=/; max-age=604800; SameSite=Lax`;

			if (role === 'guest') {
				await signOut({ redirect: false });
				const path = window.location.pathname;
				if (path.startsWith('/admin') || path.startsWith('/profile') || path.startsWith('/protocols')) {
					window.location.href = '/';
				} else {
					window.location.reload();
				}
				return;
			}

			const currentPath = window.location.pathname;
			// אם היינו בדף שחסום לתפקיד החדש, נייעד לדף מתאים
			let target = currentPath;
			if (role === 'user' && (currentPath.startsWith('/admin') || currentPath.startsWith('/protocols'))) {
				target = '/';
			}

			await signIn('role-login', {
				role,
				redirect: true,
				callbackUrl: target || '/'
			});
		} catch (e) {
			console.error('Role switch failed:', e);
			loadingRole = null;
		}
	}

	async function closeSimulator() {
		// ניקוי הסימולציה
		document.cookie = 'role_sim_active=; path=/; max-age=0; SameSite=Lax';
		document.cookie = 'role_sim_role=; path=/; max-age=0; SameSite=Lax';
		await signOut({ redirect: false });
		window.location.href = '/';
	}
</script>

{#if !isMinimized}
	<aside
		class="sticky top-0 z-[60] w-full border-b border-amber-500/30 bg-[#0b1120]/95 px-2 py-1 backdrop-blur text-xs text-white shadow-md"
		dir="rtl"
		aria-label="בורר תצוגה לסופר אדמין"
	>
		<div class="mx-auto flex max-w-7xl items-center justify-between gap-1 sm:gap-2">
			<!-- תווית קומפקטית -->
			<div class="flex items-center gap-1.5 flex-shrink-0 text-amber-300 font-bold">
				<span class="text-sm">👑</span>
				<span class="hidden sm:inline">תצוגת סופר אדמין:</span>
			</div>

			<!-- 4 כפתורי החיבור המדויקים -->
			<div class="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
				<button
					type="button"
					onclick={() => switchRole('super_admin')}
					disabled={loadingRole !== null}
					title="התחבר כסופר אדמין"
					class="flex items-center gap-1 rounded-md px-2 py-0.5 font-bold transition-all text-[11px] sm:text-xs {currentRole === 'super_admin' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white/10 text-gray-200 hover:bg-white/20'}"
				>
					{#if loadingRole === 'super_admin'}
						<span class="h-3 w-3 animate-spin rounded-full border-2 border-slate-900 border-t-transparent"></span>
					{:else}
						<span>👑</span>
					{/if}
					<span>התחבר כסופר אדמין</span>
				</button>

				<button
					type="button"
					onclick={() => switchRole('admin')}
					disabled={loadingRole !== null}
					title="התחבר כאדמין"
					class="flex items-center gap-1 rounded-md px-2 py-0.5 font-bold transition-all text-[11px] sm:text-xs {currentRole === 'admin' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white/10 text-gray-200 hover:bg-white/20'}"
				>
					{#if loadingRole === 'admin'}
						<span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
					{:else}
						<span>🛡️</span>
					{/if}
					<span>התחבר כאדמין</span>
				</button>

				<button
					type="button"
					onclick={() => switchRole('user')}
					disabled={loadingRole !== null}
					title="התחבר כמשתמש מחובר"
					class="flex items-center gap-1 rounded-md px-2 py-0.5 font-bold transition-all text-[11px] sm:text-xs {currentRole === 'user' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/10 text-gray-200 hover:bg-white/20'}"
				>
					{#if loadingRole === 'user'}
						<span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
					{:else}
						<span>👤</span>
					{/if}
					<span>התחבר כמשתמש מחובר</span>
				</button>

				<button
					type="button"
					onclick={() => switchRole('guest')}
					disabled={loadingRole !== null}
					title="הכנס כאורח"
					class="flex items-center gap-1 rounded-md px-2 py-0.5 font-bold transition-all text-[11px] sm:text-xs {currentRole === 'guest' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white/10 text-gray-200 hover:bg-white/20'}"
				>
					{#if loadingRole === 'guest'}
						<span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
					{:else}
						<span>🕊️</span>
					{/if}
					<span>הכנס כאורח</span>
				</button>
			</div>

			<!-- כפתורי מזעור וסגירה -->
			<div class="flex items-center gap-1 flex-shrink-0">
				<button
					type="button"
					onclick={() => (isMinimized = true)}
					title="מזער סרגל"
					class="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-white/10 hover:text-white"
				>
					−
				</button>
				<button
					type="button"
					onclick={closeSimulator}
					title="יציאה מסימולציה וחזרה רגילה"
					class="flex h-5 w-5 items-center justify-center rounded text-red-400 hover:bg-red-500/20 hover:text-red-300"
				>
					✕
				</button>
			</div>
		</div>
	</aside>
{:else}
	<!-- מצב ממוזער — כפתור צף קומפקטי בפינה -->
	<button
		type="button"
		onclick={() => (isMinimized = false)}
		class="fixed bottom-3 right-3 z-[60] flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-[#0f172a] px-3 py-1.5 text-xs font-bold text-amber-300 shadow-xl hover:bg-[#1e293b]"
		title="פתח בורר תצוגה לסופר אדמין"
	>
		<span>👑</span>
		<span>תצוגה: {currentRole === 'super_admin' ? 'סופר אדמין' : currentRole === 'admin' ? 'אדמין' : currentRole === 'user' ? 'משתמש' : 'אורח'}</span>
	</button>
{/if}

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
