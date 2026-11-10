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
        { name: "русский", code: "ru", flag: "ru" },
    ];

    let showLangDropdown = $state(false);
    let showNavMenu = $state(false);

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
        return () => document.removeEventListener("click", handleClickOutside);
    });

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest(".lang-dropdown-container")) {
            showLangDropdown = false;
        }
        if (!target.closest(".nav-menu-container")) showNavMenu = false;
    }

    function handleLangKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            showLangDropdown = false;
            return;
        }

        // פתיחת הרשימה עם חץ למטה כשהיא סגורה
        if (event.key === 'ArrowDown' && !showLangDropdown) {
            event.preventDefault();
            showLangDropdown = true;
            setTimeout(() => {
                const container = (event.target as HTMLElement).closest('.lang-dropdown-container');
                const firstOption = container?.querySelector('[role="option"]') as HTMLElement;
                firstOption?.focus();
            }, 0);
            return;
        }

        if (!showLangDropdown) return;

        const target = event.target as HTMLElement;
        const container = target.closest('.lang-dropdown-container');
        if (!container) return;

        const options = Array.from(container.querySelectorAll('[role="option"]')) as HTMLElement[];
        if (options.length === 0) return;

        const currentIndex = options.indexOf(target);

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            options[currentIndex < options.length - 1 ? currentIndex + 1 : 0].focus();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            options[currentIndex > 0 ? currentIndex - 1 : options.length - 1].focus();
        } else if (event.key === 'Home') {
            event.preventDefault();
            options[0].focus();
        } else if (event.key === 'End') {
            event.preventDefault();
            options[options.length - 1].focus();
        }
    }
	// tFn: תרגום reactive - $t אסור ב-Svelte 5
	let _loc = $state(get(locale));
	$effect(() => locale.subscribe(l => (_loc = l)));
	const tFn = (k: string) => { void _loc; return get(t)(k); };

	// התפריט נסגר בכל ניווט
	afterNavigate(() => (showNavMenu = false));

</script>

<!-- תפריט הדפים הנוספים — משותף לדסקטופ ולמובייל. Freedom TV וניהול הרשת לאדמינים בלבד -->
{#snippet navMenu()}
    <div role="menu" class="absolute end-0 top-full z-[160] mt-2 w-52 overflow-hidden rounded-xl border border-white/15 bg-[#0f1626] py-1 shadow-2xl">
        <a role="menuitem" href="/about" class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"><span aria-hidden="true">ℹ️</span> {tFn("about")}</a>
        {#if user?.canManage}
            <a role="menuitem" href="/admin/tv" class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"><span aria-hidden="true">📺</span> חירות TV</a>
            <a role="menuitem" href="/admin" class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"><span aria-hidden="true">🛡️</span> ניהול ומשימות</a>
        {/if}
        <a role="menuitem" href="/club" class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"><span aria-hidden="true">🕊️</span> מועדון החירות</a>
        <a role="menuitem" href="/club/charter" class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"><span aria-hidden="true">📜</span> אמנת החברים</a>
        <a role="menuitem" href="/budget" class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"><span aria-hidden="true">💰</span> ניהול תקציב</a>
    </div>
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

                    <div class="flex items-center gap-1.5">
                        <!-- מובייל: למשתמש מחובר — כפתור תפריט (אודות + הדפים הנוספים); לאנונימי — כפתור אודות -->
                        {#if user}
                            <div class="nav-menu-container relative">
                                <button
                                    type="button"
                                    class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                                    onclick={() => (showNavMenu = !showNavMenu)}
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
                        {:else}
                            <a
                                href="/about"
                                class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                                aria-label={tFn("about")}
                            >
                                <span class="text-xl font-bold text-white leading-none">ℹ</span>
                            </a>
                        {/if}

                        <!-- כפתור דגל שפה - מובייל -->
                        <div class="relative lang-dropdown-container">
                            <button
                                onclick={() => (showLangDropdown = !showLangDropdown)}
                                onkeydown={handleLangKeydown}
                                class="flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                                aria-label={tFn("choose_language")}
                                aria-haspopup="listbox"
                                aria-expanded={showLangDropdown}
                            >
                                <span
                                    class="fi fi-{languages.find((l) => l.code === $locale || $locale?.startsWith(l.code))?.flag || 'il'}"
                                    style="font-size: 1.2rem;"
                                    aria-hidden="true"
                                ></span>
                            </button>
                            {#if showLangDropdown}
                                <div
                                    class="absolute left-0 z-[160] mt-2 w-36 rounded-lg bg-[#0f172a] border border-white/10 shadow-xl"
                                    role="listbox"
                                    aria-label={tFn("choose_language")}
                                >
                                    {#each languages as langOption}
                                        <button
                                            class="flex w-full items-center gap-3 px-3 py-2 text-right text-white hover:bg-white/10 transition-colors"
                                            onclick={() => { changeLang(langOption); showLangDropdown = false; }}
                                            onkeydown={handleLangKeydown}
                                            role="option"
                                            aria-selected={$locale === langOption.code || $locale?.startsWith(langOption.code)}
                                        >
                                            <span class="fi fi-{langOption.flag}" style="font-size: 1.2rem;" aria-hidden="true"></span>
                                            <span class="text-sm">{langOption.name}</span>
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
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
<div class="flex items-center gap-2">
                <!-- הסדר מימין לשמאל: תפריט (אודות · Freedom TV · ניהול הרשת) · שפה · משתמש -->
                <!-- שני הקישורים האחרונים — לסופר-אדמין ולאדמיני אתרי הרשת בלבד; לשאר נשאר כפתור "אודות" רגיל -->
                <!-- "ניהול תקציב" — לכל משתמש מחובר (צפייה); ההצבעה נקבעת בדף עצמו -->
                {#if user}
                    <div class="nav-menu-container relative">
                        <button
                            type="button"
                            class="relative flex items-center gap-2 rounded-lg px-4 py-2 font-bold text-white transition-all duration-300 hover:scale-105"
                            style="background:linear-gradient(135deg,#4f46e5,#7c3aed); box-shadow:0 4px 15px rgba(124,58,237,0.4);"
                            onclick={() => (showNavMenu = !showNavMenu)}
                            onkeydown={(e) => e.key === 'Escape' && (showNavMenu = false)}
                            aria-haspopup="menu"
                            aria-expanded={showNavMenu}
                        >
                            {tFn("menu")}
                            <svg class="h-4 w-4 transition-transform {showNavMenu ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {#if showNavMenu}
                            {@render navMenu()}
                        {/if}
                    </div>
                {:else}
                    <a
                        href="/about"
                        class="relative flex items-center rounded-lg px-4 py-2 font-bold text-white transition-all duration-300 hover:scale-105"
                        style="background:linear-gradient(135deg,#4f46e5,#7c3aed); box-shadow:0 4px 15px rgba(124,58,237,0.4);"
                    >
                        {tFn("about")}
                    </a>
                {/if}
                <!-- Language Dropdown -->
                <div class="lang-dropdown-container relative">
                    <button
                        class="flex items-center rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm text-white transition-colors"
                        onclick={() => (showLangDropdown = !showLangDropdown)}
                        onkeydown={handleLangKeydown}
                        aria-label={tFn("choose_language")}
                        aria-haspopup="listbox"
                        aria-expanded={showLangDropdown}
                    >
                        <span
                            class="fi fi-{languages.find(
                                (l) => l.code === $locale || $locale?.startsWith(l.code),
                            )?.flag || 'il'} ml-2"
                            style="font-size: 1.5rem; margin-left: 0.75rem;"
                            aria-hidden="true"
                        ></span>
                        {languages.find((l) => l.code === $locale || $locale?.startsWith(l.code))?.name ||
                            'עברית'}
                        <svg
                            class="mr-1 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {#if showLangDropdown}
                        <div
                            class="absolute right-0 z-[160] mt-2 w-44 rounded-lg bg-[#0f172a] border border-white/10 shadow-xl"
                            role="listbox"
                            aria-label={tFn("choose_language")}
                        >
                            {#each languages as langOption}
                                <button
                                    class="flex w-full items-center gap-4 px-4 py-2 text-right text-white hover:bg-white/10 transition-colors"
                                    onclick={() => {
                                        changeLang(langOption);
                                        showLangDropdown = false;
                                    }}
                                    onkeydown={handleLangKeydown}
                                    role="option"
                                    aria-selected={$locale === langOption.code || $locale?.startsWith(langOption.code)}
                                >
                                    <span class="text-sm">{langOption.name}</span>
                                    <span
                                        class="fi fi-{langOption.flag}"
                                        style="font-size: 1.5rem;"
                                        aria-hidden="true"
                                    ></span>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
                <!-- התחברות / תמונת המשתמש — עיגול כמו בשאר אתרי יוצאים לחירות -->
                {#if user}
                    <a
                        href="/profile"
                        class="flex-shrink-0 rounded-full transition-transform hover:scale-105"
                        title={user.name || user.email}
                        aria-label={user.name || user.email}
                    >
                        {#if user.image && !avatarBroken}
                            <img
                                src={user.image}
                                alt=""
                                width="36"
                                height="36"
                                decoding="async"
                                referrerpolicy="no-referrer"
                                class="h-9 w-9 rounded-full object-cover border-2 border-purple-500/40 shadow-lg"
                                onerror={() => (avatarBroken = true)}
                            />
                        {:else}
                            <span class="login-grad flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm font-bold text-white shadow-lg" aria-hidden="true">
                                {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                        {/if}
                    </a>
                {:else}
                    <a
                        href="/login"
                        class="login-grad flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-white transition-all hover:brightness-110"
                    >
                        <span>🕊️</span>
                        <span class="hidden sm:inline">התחברות</span>
                    </a>
                {/if}
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
