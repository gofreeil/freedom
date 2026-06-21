<script lang="ts">
    import { t, locale } from "svelte-i18n";
    import { get } from "svelte/store";
    let _loc = $state(get(locale));
    $effect(() => locale.subscribe(l => (_loc = l)));
    const tFn = (k: string) => { void _loc; return get(t)(k); };
</script>

<footer class="bg-[#0d1117] border-t border-white/10 pt-4 md:pt-10 pb-0 md:pb-2 mt-1 md:mt-0">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Desktop: title centered above -->
        <a
            href="https://gofreeil.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tFn("footer.brand_aria")}
            class="hidden md:flex justify-center pt-5 pb-4 hover:opacity-80 transition-opacity"
        >
            <p class="text-lg md:text-xl font-black text-yellow-500">
                {tFn("footer.brand")}
            </p>
        </a>

        <div
            class="flex flex-col items-center justify-center gap-0 md:gap-2"
        >
            <!-- Mobile only: Brand text -->
            <a
                href="https://gofreeil.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tFn("footer.brand_aria")}
                style="cursor: pointer;"
                class="flex md:hidden items-center gap-3 hover:opacity-80 transition-opacity"
            >
                <div class="flex flex-col text-right leading-tight">
                    <p class="text-yellow-400 font-black text-base">
                        {tFn("footer.brand")}
                    </p>
                </div>
            </a>

            <!-- Center: Links -->
            <nav
                aria-label={tFn("footer.bottom_nav_aria")}
                class="flex items-center gap-2 md:gap-3 text-sm md:text-base text-gray-300 font-bold flex-nowrap justify-center whitespace-nowrap"
            >
                <a href="/about/legal" class="hover:text-white transition-colors text-center leading-tight">{tFn("footer.terms_part1")}<br class="md:hidden" /><span class="hidden md:inline">,&nbsp;</span>{tFn("footer.terms_part2")}</a>
                <span class="text-gray-600 font-black" aria-hidden="true">|</span>
                <a href="mailto:freedomhasbegun@gmail.com" class="hover:text-white transition-colors whitespace-nowrap" aria-label={tFn("footer.contact_email_aria")}>{tFn("contact_us")}</a>
                <span class="text-gray-600 font-black" aria-hidden="true">|</span>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSd54dS1D-MkSVY5PQST2pBm8cOMA5npTcA-xAgDSLQxD3OpUw/viewform?usp=header" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors text-center leading-tight">{tFn("footer.leaders_part1")}<br class="md:hidden" /><span class="hidden md:inline">&nbsp;</span>{tFn("footer.leaders_part2")}</a>
            </nav>

            <!-- Left: Copyright -->
            <p class="text-gray-400 font-bold text-xs md:text-sm text-center pt-3 md:pt-4 pb-4 md:pb-2">
                &copy; {new Date().getFullYear()} {tFn("all_rights_reserved")}
            </p>
        </div>
    </div>
</footer>
