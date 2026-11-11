<script lang="ts">
    import { headerHeight } from '$lib/actions/headerHeight';
    import { t, locale } from 'svelte-i18n';
	import { get } from 'svelte/store';
    import { goto, afterNavigate } from "$app/navigation";
    import { onMount } from "svelte";

    // משתמש מחובר (מגיע מ-+layout.server דרך +layout.svelte); null = אנונימי
    let { user = null }: { user?: { name: string; email: string; image?: string; isSuperAdmin?: boolean; canManage?: boolean } | null } = $props();
    // תמונת פרופיל שלא נטענה → עיגול עם האות הראשונה
    let avatarBroken = $state(false);

    let languages = [
        { name: "עברית", code: "he", flag: "il" },
        { name: "English", code: "en", flag: "us" },
    ];

    let showNavMenu = $state(false);
    let showProfileMenu = $state(false);
    let profileCloseTimer: ReturnType<typeof setTimeout> | undefined;

    function handleProfileMouseEnter() {
        if (profileCloseTimer) {
            clearTimeout(profileCloseTimer);
            profileCloseTimer = undefined;
        }
        showProfileMenu = true;
        showNavMenu = false;
    }

    function handleProfileMouseLeave() {
        if (profileCloseTimer) clearTimeout(profileCloseTimer);
        profileCloseTimer = setTimeout(() => {
            showProfileMenu = false;
            profileCloseTimer = undefined;
        }, 220);
    }

    // חיפוש
    let searchQuery     = $state('');
    let showMobileSearch = $state(false);

    function doSearch() {
        const q = searchQuery.trim();
        if (!q) return;
        goto(`/search?q=${encodeURIComponent(q)}`);
        showMobileSearch = false;
        searchQuery = '';
    }
    function handleSearchKey(e: KeyboardEvent) {
        if (e.key === 'Enter') doSearch();
        if (e.key === 'Escape') { showMobileSearch = false; searchQuery = ''; }
    }

    function changeLang(language: { name: string; code: string }) {
        locale.set(language.code);
        try { localStorage.setItem('lang', language.code); } catch {}
    }

    onMount(() => {
        // שחזר שפה שמורה
        try {
            const saved = localStorage.getItem('lang');
            if (saved) locale.set(saved);
        } catch {}

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            if (profileCloseTimer) clearTimeout(profileCloseTimer);
        };
    });

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest(".nav-menu-container")) showNavMenu = false;
        if (!target.closest(".profile-menu-container")) {
            showProfileMenu = false;
            if (profileCloseTimer) {
                clearTimeout(profileCloseTimer);
                profileCloseTimer = undefined;
            }
        }
    }

	// tFn: תרגום reactive - $t אסור ב-Svelte 5
	let _loc = $state(get(locale));
	$effect(() => locale.subscribe(l => (_loc = l)));
	const isActiveLang = (code: string) => _loc === code || !!_loc?.startsWith(code);
	const tFn = (k: string) => { void _loc; return get(t)(k); };

	// התפריטים נסגרים בכל ניווט
	afterNavigate(() => {
        showNavMenu = false;
        showProfileMenu = false;
        if (profileCloseTimer) {
            clearTimeout(profileCloseTimer);
            profileCloseTimer = undefined;
        }
    });

</script>

<!-- תפריט הדפים הנוספים — משותף לדסקטופ ולמובייל. Freedom TV לאדמינים בלבד -->
{#snippet navMenu()}
    <div role="menu" class="absolute end-0 top-full z-[160] mt-2 w-56 overflow-hidden rounded-xl border border-white/15 bg-[#0f1626] py-1 shadow-2xl">
        {#if !user}
            <a role="menuitem" href="/login" class="flex items-center gap-2.5 px-4 py-2.5 text-base font-bold text-white hover:bg-white/10"><span aria-hidden="true">🕊️</span> התחברות</a>
        {/if}
        <a role="menuitem" href="/about" class="flex items-center gap-2.5 px-4 py-2.5 text-base font-bold text-white hover:bg-white/10"><span aria-hidden="true">ℹ️</span> {tFn("about")}</a>
        {#if user}
            <a role="menuitem" href="/club" class="flex items-center gap-2.5 px-4 py-2.5 text-base font-bold text-white hover:bg-white/10"><span aria-hidden="true">🕊️</span> מועדון החברים</a>
            <a role="menuitem" href="/club/charter" class="flex items-center gap-2.5 px-4 py-2.5 text-base font-bold text-white hover:bg-white/10"><span aria-hidden="true">📜</span> אמנת יוצאים לחירות</a>
        {/if}
        <div class="mt-5 mb-3 border-t border-white/20"></div>
        <div class="flex items-center gap-1.5 px-2.5 pb-2 pt-0.5" role="group" aria-label={tFn("choose_language")}>
            {#each languages as langOption}
                <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActiveLang(langOption.code)}
                    title={langOption.name}
                    class="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-1.5 py-1 text-[11px] font-bold text-white hover:bg-white/10 {isActiveLang(langOption.code) ? 'bg-white/15 ring-1 ring-white/30' : ''}"
                    onclick={() => changeLang(langOption)}
                >
                    <span class="fi fi-{langOption.flag}" style="font-size: 0.95rem;" aria-hidden="true"></span>
                    <span>{langOption.name}</span>
                </button>
            {/each}
        </div>
    </div>
{/snippet}

<!-- תפריט הפרופיל והאזור האישי שנפתח בריחוף מעל תמונת המשתמש (קיצור דרך) -->
{#snippet profileMenu()}
    <div
        role="menu"
        class="absolute left-0 top-full z-[160] mt-2 w-60 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-white/15 bg-[#0f1626] py-1 shadow-2xl before:absolute before:-top-3 before:inset-x-0 before:h-3 before:content-['']"
    >
        {#if user}
            <a
                role="menuitem"
                href="/profile"
                onclick={() => (showProfileMenu = false)}
                class="group block border-b border-white/10 bg-white/[0.03] px-4 py-2.5 text-right transition-colors hover:bg-white/[0.08]"
                title="מעבר לאזור האישי"
            >
                <p class="truncate text-sm font-bold text-white transition-colors group-hover:text-purple-200">
                    {user.name || 'משתמש מחובר'}
                </p>
                <p class="mt-0.5 truncate text-xs text-gray-400 transition-colors group-hover:text-gray-300">
                    אזור אישי
                </p>
            </a>

            {#if user.canManage}
                <a
                    role="menuitem"
                    href="/admin"
                    onclick={() => (showProfileMenu = false)}
                    class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                >
                    <span aria-hidden="true">🛡️</span> ניהול ומשימות
                </a>
                <a
                    role="menuitem"
                    href="/admin/tv"
                    onclick={() => (showProfileMenu = false)}
                    class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                >
                    <span aria-hidden="true">📺</span> חירות TV
                </a>
                <a
                    role="menuitem"
                    href="/protocols"
                    onclick={() => (showProfileMenu = false)}
                    class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                >
                    <span aria-hidden="true">📜</span> פרוטוקולים
                </a>
                <a
                    role="menuitem"
                    href="/profile?tab=conference"
                    onclick={() => (showProfileMenu = false)}
                    class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                >
                    <span aria-hidden="true">🎙️</span> ועידה
                </a>
            {/if}

            <a
                role="menuitem"
                href="/budget"
                onclick={() => (showProfileMenu = false)}
                class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
                <span aria-hidden="true">💰</span> ניהול תקציב
            </a>
        {/if}
    </div>
{/snippet}

<!-- כפתור פרופיל / התחברות: בריחוף נפתח תפריט קיצור, בלחיצה נכנסים ישירות לדף הפרופיל -->
{#snippet userAuthButton(isMobile = false)}
    {#if user}
        <div
            class="profile-menu-container relative"
            role="group"
            aria-label="תפריט פרופיל מהיר"
            onmouseenter={handleProfileMouseEnter}
            onmouseleave={handleProfileMouseLeave}
        >
            <a
                href="/profile"
                onclick={() => (showProfileMenu = false)}
                class="flex-shrink-0 rounded-full transition-transform hover:scale-105 block focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                title={user.name || user.email}
                aria-label={user.name || user.email}
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
            >
                {#if user.image && !avatarBroken}
                    <img
                        src={user.image}
                        alt=""
                        width={isMobile ? "36" : "48"}
                        height={isMobile ? "36" : "48"}
                        decoding="async"
                        referrerpolicy="no-referrer"
                        class="{isMobile ? 'h-9 w-9' : 'h-12 w-12'} rounded-full object-cover border-2 border-purple-500/40 shadow-lg"
                        onerror={() => (avatarBroken = true)}
                    />
                {:else}
                    <span class="login-grad flex {isMobile ? 'h-9 w-9 text-xs' : 'h-12 w-12 text-lg'} items-center justify-center rounded-full border border-white/10 font-bold text-white shadow-lg" aria-hidden="true">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                {/if}
            </a>
            {#if showProfileMenu}
                {@render profileMenu()}
            {/if}
        </div>
    {:else}
        <a
            href="/login"
            class="login-grad flex items-center {isMobile ? 'justify-center w-8 h-8 rounded-lg text-sm' : 'gap-1.5 rounded-lg px-3 py-1.5 text-sm'} font-bold text-white transition-all hover:brightness-110"
            title="התחברות"
            aria-label="התחברות"
        >
            <span>🕊️</span>
            {#if !isMobile}
                <span class="hidden sm:inline">התחברות</span>
            {/if}
        </a>
    {/if}
{/snippet}

<header use:headerHeight
    class="sticky top-0 z-50 border-b-2 md:border-b-4 border-blue-600 shadow-lg backdrop-blur-lg"
    style="background: linear-gradient(to bottom, rgba(17, 24, 39, 0.88) 0%, rgba(17, 24, 39, 0.88) 66%, rgba(17, 24, 39, 0.1) 100%);"
>
    <div class="relative mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
        <!-- Mobile Header Area -->
        <div class="md:hidden h-[80px] relative">
                <!-- Mobile Header -->
                <div
                    class="flex items-center justify-between h-full px-1 absolute inset-0"
                >
                    <a
                        href="/"
                        class="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                        <div class="relative">
                            <div class="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                    src="/images/ad_neighborhoods.webp"
                                    alt=""
                                    width="462"
                                    height="430"
                                    decoding="async"
                                    class="w-full h-full object-cover scale-[1.2]"
                                />
                            </div>
                            <div
                                class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"
                            ></div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <!-- שם המותג בכותרת הוא <p> ולא <h1>: ה-h1 שייך לכותרת הייחודית של כל דף.
                                 h1 גלובלי זהה בכל הדפים היה מטשטש לגוגל במה כל דף עוסק. -->
                            <p
                                class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-black text-transparent leading-tight"
                            >
                                {tFn("welcome")}
                            </p>
                            <p class="text-xs text-gray-400 leading-tight">
                                {tFn("app_description")}
                            </p>
                        </div>
                    </a>

                    <div class="flex items-center gap-2.5">
                        <div class="nav-menu-container relative">
                            <button
                                type="button"
                                class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                                onclick={() => { showNavMenu = !showNavMenu; if (showNavMenu) showProfileMenu = false; }}
                                onkeydown={(e) => e.key === 'Escape' && (showNavMenu = false)}
                                aria-label="תפריט"
                                aria-haspopup="menu"
                                aria-expanded={showNavMenu}
                            >
                                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-width="2.2" d="M4 7h16M4 12h16M4 17h16" /></svg>
                            </button>
                            {#if showNavMenu}
                                {@render navMenu()}
                            {/if}
                        </div>
                        {@render userAuthButton(true)}
                    </div>
                </div>
        </div>

        <!-- Desktop Header - Full Layout -->
        <div
            class="hidden md:flex flex-col items-center pt-0 pb-0.5 md:flex-row md:items-center md:justify-between"
        >
            <div class="flex items-center space-x-4">
                <div class="relative group">
                    <a
                        href="/"
                        class="flex h-20 w-20 items-center justify-center rounded-xl shadow-lg transition-transform hover:scale-105"
                    >
                        <div class="h-14 w-14 rounded-full overflow-hidden">
                            <img
                                src="/images/ad_neighborhoods.webp"
                                alt="{tFn('welcome')} – {tFn('back_home')}"
                                width="462"
                                height="430"
                                decoding="async"
                                class="w-full h-full object-cover scale-[1.2]"
                            />
                        </div>
                    </a>
                    <!-- Tooltip - Below Logo -->
                    <div
                        class="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-[9999]"
                    >
                        <div
                            class="bg-gray-900 text-white text-sm rounded-lg px-4 py-2 shadow-xl whitespace-nowrap"
                        >
                            {tFn("back_home")}
                            <div
                                class="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900"
                            ></div>
                        </div>
                    </div>
                </div>
                <a href="/" class="group">
                    <p
                        class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent group-hover:opacity-80 transition-opacity"
                    >
                        {tFn("welcome")}
                    </p>
                    <p class="text-lg text-gray-100 font-extrabold group-hover:opacity-80 transition-opacity">{tFn("app_description")}</p>
                </a>
            </div>
            <div class="flex items-center gap-8">
                <!-- הסדר מימין לשמאל: תפריט (אודות · Freedom TV · ניהול הרשת) · שפה · משתמש -->
                <!-- שני הקישורים האחרונים — לסופר-אדמין ולאדמיני אתרי הרשת בלבד; לשאר נשאר כפתור "אודות" רגיל -->
                <!-- "ניהול תקציב" — לכל משתמש מחובר (צפייה); ההצבעה נקבעת בדף עצמו -->
                <div class="nav-menu-container relative">
                    <button
                        type="button"
                        class="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
                        style="background:linear-gradient(135deg,#4f46e5,#7c3aed); box-shadow:0 4px 15px rgba(124,58,237,0.4);"
                        onclick={() => { showNavMenu = !showNavMenu; if (showNavMenu) showProfileMenu = false; }}
                        onkeydown={(e) => e.key === 'Escape' && (showNavMenu = false)}
                        aria-haspopup="menu"
                        aria-expanded={showNavMenu}
                    >
                        {tFn("menu")}
                        <svg class="h-3.5 w-3.5 transition-transform {showNavMenu ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {#if showNavMenu}
                        {@render navMenu()}
                    {/if}
                </div>
                <!-- התחברות / תמונת המשתמש — עיגול כמו בשאר אתרי יוצאים לחירות -->
                {@render userAuthButton(false)}
            </div>
        </div>
    </div>
</header>

<style>
    @keyframes pulse-slow {
        0%,
        100% {
            opacity: 1;
        }
        36% {
            opacity: 0.75;
        }
    }

    :global(.animate-pulse-slow) {
        animation: pulse-slow 11s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>
