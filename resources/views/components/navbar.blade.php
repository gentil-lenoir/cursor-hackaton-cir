<nav class="cir-landing-nav sticky top-0 z-50 backdrop-blur-xl">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div class="flex items-center justify-between gap-4">
            <a href="{{ route('home') }}#home" class="flex min-w-0 items-center gap-3">
                <div class="cir-logo-mark shrink-0">
                    <span class="material-symbols-outlined text-[28px]">location_city</span>
                </div>
                <div class="min-w-0">
                    <p class="truncate text-xl font-black tracking-tight text-white sm:text-2xl"><span class="text-emerald-400">CIR</span></p>
                    <p class="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Smart Public Issue Reporting</p>
                </div>
            </a>

            <div class="hidden items-center gap-4 md:flex">
                <div class="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-emerald-300" href="#home">Home</a>
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-emerald-300" href="#about">About</a>
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-emerald-300" href="#users">Users</a>
                    <a class="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-emerald-300" href="#features">Features</a>
                </div>
                @include('components.citizen-theme-toggle')
                <div class="flex items-center gap-2" data-login-url="{{ route('login') }}" data-register-url="{{ route('register') }}">
                    <a class="cir-btn cir-btn-ghost !border-white/15 !text-white hover:!bg-white/10 auth-guest-link" href="{{ route('login') }}">Login</a>
                    <a class="cir-btn cir-btn-primary auth-guest-link" href="{{ route('register') }}">Sign Up</a>
                </div>
            </div>

            <div class="flex items-center gap-2 md:hidden">
                @include('components.citizen-theme-toggle')
                <button class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white" data-mobile-menu-toggle="landing-mobile-menu" type="button">
                    <span class="material-symbols-outlined">menu</span>
                </button>
            </div>
        </div>

        <div class="landing-mobile-menu hidden pt-4" id="landing-mobile-menu">
            <div class="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div class="grid grid-cols-2 gap-2">
                    <a class="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10" href="#home">Home</a>
                    <a class="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10" href="#about">About</a>
                    <a class="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10" href="#users">Users</a>
                    <a class="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10" href="#features">Features</a>
                </div>
                <div class="flex flex-col gap-2">
                    <a class="cir-btn cir-btn-ghost !text-white auth-guest-link" href="{{ route('login') }}">Login</a>
                    <a class="cir-btn cir-btn-primary auth-guest-link" href="{{ route('register') }}">Sign Up</a>
                </div>
            </div>
        </div>
    </div>
</nav>
