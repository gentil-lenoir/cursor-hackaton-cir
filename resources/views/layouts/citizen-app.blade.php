@extends('layouts.citizen-page')

@section('title', $pageTitle ?? 'Citizen Portal — CIR')
@section('citizen-page', $citizenPage ?? 'shell')

@section('body')
    <div class="portal-drawer-backdrop hidden" data-drawer-backdrop="citizen-sidebar"></div>
    <div class="flex min-h-screen">
        {{-- Sidebar --}}
        <aside
            class="portal-mobile-sidebar is-closed cir-sidebar fixed inset-y-0 left-0 z-50 flex w-[88vw] max-w-72 flex-col lg:static lg:w-72 lg:max-w-none lg:translate-x-0"
            id="citizen-sidebar"
        >
            <div class="border-b border-white/10 p-6">
                <div class="flex items-center justify-between gap-3">
                    <a href="{{ route('citizen.dashboard') }}" class="flex min-w-0 items-center gap-3">
                        <div class="cir-logo-mark shrink-0">
                            <span class="material-symbols-outlined text-[28px]">location_city</span>
                        </div>
                        <div class="min-w-0">
                            <p class="truncate text-xl font-black tracking-tight text-white"><span class="text-emerald-400">CIR</span></p>
                            <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Citizen Portal</p>
                        </div>
                    </a>
                    <button class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden" data-drawer-close="citizen-sidebar" type="button">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            <nav class="flex-1 space-y-1 overflow-y-auto px-4 py-4">
                <a href="{{ route('citizen.dashboard') }}" class="cir-sidebar-link {{ request()->routeIs('citizen.dashboard', 'citizen.dashcode') ? 'active' : '' }}">
                    <span class="material-symbols-outlined">dashboard</span>
                    <span>Dashboard</span>
                </a>
                <a href="{{ route('citizen.report') }}" class="cir-sidebar-link {{ request()->routeIs('citizen.report') ? 'active' : '' }}">
                    <span class="material-symbols-outlined">add_circle</span>
                    <span>Report Issue</span>
                </a>
                <a href="{{ route('citizen.my_issues') }}" class="cir-sidebar-link {{ request()->routeIs('citizen.my_issues') ? 'active' : '' }}">
                    <span class="material-symbols-outlined">list_alt</span>
                    <span>My Issues</span>
                </a>
                <a href="{{ route('community.index') }}" class="cir-sidebar-link {{ request()->routeIs('community.*') ? 'active' : '' }}">
                    <span class="material-symbols-outlined">groups</span>
                    <span>Community Feed</span>
                </a>
                <a href="{{ route('home') }}" class="cir-sidebar-link">
                    <span class="material-symbols-outlined">home</span>
                    <span>Public Home</span>
                </a>

                <div class="px-4 pb-2 pt-5">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Account</span>
                </div>
                <a href="{{ route('citizen.profile') }}" class="cir-sidebar-link {{ request()->routeIs('citizen.profile') ? 'active' : '' }}">
                    <span class="material-symbols-outlined">account_circle</span>
                    <span>My Profile</span>
                </a>
            </nav>

            <div class="space-y-4 border-t border-white/10 p-4">
                <div class="flex items-center justify-between gap-3 px-2">
                    <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Theme</span>
                    @include('components.citizen-theme-toggle')
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Citizen</p>
                    <p class="mt-2 truncate text-sm font-bold text-white" data-citizen-shell-name>Citizen</p>
                    <p class="mt-0.5 truncate text-xs text-slate-400" data-citizen-shell-email>—</p>
                </div>
                <a
                    href="{{ route('login') }}"
                    class="cir-sidebar-link text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    data-auth-logout
                    data-redirect-url="{{ route('login') }}"
                >
                    <span class="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                </a>
            </div>
        </aside>

        {{-- Main --}}
        <div class="cir-main flex min-h-screen min-w-0 flex-col">
            <header class="cir-topbar lg:hidden">
                <div>
                    <p class="text-sm font-black" style="color: var(--cir-text)">Citizen Portal</p>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.16em]" style="color: var(--cir-text-muted)">CIR Rwanda</p>
                </div>
                <div class="flex items-center gap-2">
                    @include('components.citizen-theme-toggle')
                    <button class="cir-btn cir-btn-ghost !p-2.5" data-drawer-open="citizen-sidebar" type="button">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </header>

            <main class="flex-1">
                @yield('citizen-content')
            </main>
        </div>
    </div>
@endsection
