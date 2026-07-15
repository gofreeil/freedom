<script lang="ts">
    import { t, locale } from 'svelte-i18n';
	import { get } from 'svelte/store';
    import { goto, beforeNavigate } from "$app/navigation";
    import { onMount } from "svelte";

    // משתמש מחובר (מגיע מ-+layout.server דרך +layout.svelte); null = אנונימי
    let { user = null }: { user?: { name: string; email: string; isSuperAdmin?: boolean } | null } = $props();

    let languages = [
        { name: "עברית", code: "he", flag: "il" },
        { name: "English", code: "en", flag: "us" },
        { name: "русский", code: "ru", flag: "ru" },
    ];

    let showLangDropdown = $state(false);

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

        // hover על כפתור אודות - תמונה ב-fixed position
        const preview = document.getElementById('about-preview') as HTMLElement | null;
        const btnWrapper = document.getElementById('about-btn-wrapper');
        if (preview && btnWrapper) {
            btnWrapper.addEventListener('mouseenter', () => {
                const rect = btnWrapper.getBoundingClientRect();
                const imgW = 700;
                let left = rect.left + rect.width / 2 - imgW / 2;
                if (left < 8) left = 8;
                if (left + imgW > window.innerWidth - 8) left = window.innerWidth - imgW - 8;
                preview.style.left = left + 'px';
                preview.style.top = (rect.bottom + 10) + 'px';
                preview.style.opacity = '1';
                preview.style.transform = 'scale(1)';
            });
            btnWrapper.addEventListener('mouseleave', () => {
                preview.style.opacity = '0';
                preview.style.transform = 'scale(0.05)';
            });
        }

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    });

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest(".lang-dropdown-container")) {
            showLangDropdown = false;
        }
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

	// סגור תמונת preview של אודות בזמן ניווט
	beforeNavigate(() => {
		const preview = document.getElementById('about-preview') as HTMLElement | null;
		if (preview) {
			setTimeout(() => {
				preview.style.opacity = '0';
			}, 1000);
		}
	});

</script>

<header
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
                                    class="w-full h-full object-cover scale-[1.2]"
                                />
                            </div>
                            <div
                                class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"
                            ></div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <h1
                                class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-black text-transparent leading-tight"
                            >
                                {tFn("welcome")}
                            </h1>
                            <p class="text-xs text-gray-400 leading-tight">
                                {tFn("app_description")}
                            </p>
                        </div>
                    </a>

                    <div class="flex items-center gap-1.5">
                        <!-- כפתור אודות - מובייל (מוסתר זמנית) -->
                        {#if false}
                        <button
                            onclick={() => goto("/about")}
                            class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                            aria-label={tFn("about")}
                        >
                            <span class="text-xl font-bold text-white leading-none">ℹ</span>
                        </button>
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
                                alt=""
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
                    <h1
                        class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent group-hover:opacity-80 transition-opacity"
                    >
                        {tFn("welcome")}
                    </h1>
                    <p class="text-lg text-gray-100 font-extrabold group-hover:opacity-80 transition-opacity">{tFn("app_description")}</p>
                </a>
            </div>
<div class="flex items-center gap-2">
                <!-- התחברות / אזור אישי -->
                {#if user}
                    <a
                        href={user.isSuperAdmin ? "/admin" : "/map"}
                        class="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm font-bold text-white transition-colors"
                        title={user.isSuperAdmin ? "ניהול אתרי הרשת" : "מפת הרשת שלי"}
                    >
                        <span class="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-pink-600 text-xs">{user.isSuperAdmin ? '🛡️' : '👤'}</span>
                        <span class="hidden sm:inline max-w-[120px] truncate">{user.isSuperAdmin ? 'ניהול הרשת' : (user.name || user.email)}</span>
                    </a>
                {:else}
                    <a
                        href="/login"
                        class="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 px-3 py-2 text-sm font-bold text-white transition-all"
                    >
                        <span>🕊️</span>
                        <span class="hidden sm:inline">התחברות</span>
                    </a>
                {/if}
                <!-- כפתור אודות עם תצוגה מקדימה (מוסתר זמנית) -->
                {#if false}
                <div class="relative" id="about-btn-wrapper">
                    <button
                        class="relative flex items-center rounded-lg px-4 py-2 font-bold text-white transition-all duration-300 hover:scale-105 hover:tracking-wide"
                        style="background:linear-gradient(135deg,#4f46e5,#7c3aed); box-shadow:0 4px 15px rgba(124,58,237,0.4);"
                        onmouseenter={(e) => (e.currentTarget as HTMLElement).style.boxShadow='0 0 24px 6px rgba(167,139,250,0.7), 0 4px 15px rgba(124,58,237,0.5)'}
                        onmouseleave={(e) => (e.currentTarget as HTMLElement).style.boxShadow='0 4px 15px rgba(124,58,237,0.4)'}
                        onclick={() => goto("/about")}
                    >
                        {tFn("about")}
                    </button>
                </div>
                <!-- תמונת preview - position:fixed כדי לחמוק מ-overflow של ההדר -->
                <div id="about-preview"
                     style="position:fixed; z-index:9999; pointer-events:none;
                            transition: opacity 0.2s ease-out, transform 0.2s ease-out;
                            opacity:0; transform:scale(0.05);
                            transform-origin: top center;">
                    <img
                        src="/images/ad_neighborhoods.webp"
                        alt={tFn("welcome")}
                        style="width:580px; border-radius:24px;
                               -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 55%, transparent 100%);
                               mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 55%, transparent 100%);
                               filter: drop-shadow(0 0 40px rgba(0,0,0,0.95)) drop-shadow(0 0 80px rgba(0,0,0,0.7));"
                    />
                </div>
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
