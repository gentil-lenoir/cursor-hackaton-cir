@extends('layouts.app')

@push('page_assets')
    @vite(['resources/js/main.js'])
@endpush

@section('content')
    {{-- Hero --}}
    <section class="cir-landing-hero px-6 py-16 md:px-12 md:py-24 lg:px-24" id="home">
        <div class="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div class="text-center lg:text-left">
                <span class="cir-pill mb-6 !text-emerald-600">Smarter Cities, Better Lives</span>
                <h1 class="cir-title mb-6 !text-4xl md:!text-5xl lg:!text-6xl">
                    Report. Track. <span class="text-emerald-500">Resolve.</span>
                </h1>
                <p class="cir-subtitle mb-8 max-w-xl mx-auto lg:mx-0">
                    CIR turns citizen reports into visible action with real-time issue tracking, location-based reporting, and a resolution pipeline built for Rwanda.
                </p>
                <div
                    class="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start"
                    data-hero-auth
                    data-login-url="{{ route('login') }}"
                    data-register-url="{{ route('register') }}"
                >
                    <a class="cir-btn cir-btn-ghost !px-8 !py-4 !text-base auth-guest-link" href="{{ route('login') }}">Login</a>
                    <a class="cir-btn cir-btn-secondary !px-8 !py-4 !text-base auth-guest-link !border-sky-400/40 !text-sky-600 hover:!bg-sky-500/10" href="{{ route('login.worker') }}">Login as Worker</a>
                    <a class="cir-btn cir-btn-primary !px-8 !py-4 !text-base auth-guest-link" href="{{ route('register') }}">Sign Up</a>
                    <a class="cir-btn cir-btn-primary !px-8 !py-4 !text-base auth-citizen-link hidden" href="{{ route('citizen.dashboard') }}">Dashboard</a>
                    <a class="cir-btn cir-btn-secondary !px-8 !py-4 !text-base auth-citizen-link hidden" href="{{ route('citizen.report') }}">Report Issue</a>
                    <a class="cir-btn cir-btn-secondary !px-8 !py-4 !text-base auth-worker-link hidden" href="{{ route('worker.dashboard') }}">Worker Dashboard</a>
                    <button class="cir-btn cir-btn-ghost !px-8 !py-4 !text-base !border-rose-400/30 !text-rose-500 hover:!bg-rose-500/10 auth-citizen-link hidden" data-auth-logout type="button">Logout</button>
                </div>
            </div>

            <div class="cir-landing-card p-6 md:p-8">
                <div class="cir-card mb-4 p-6">
                    <p class="cir-label !mb-2">Live System Snapshot</p>
                    <p class="text-2xl font-bold" style="color: var(--cir-text)">City Response Hub</p>
                </div>
                <div class="mb-4 grid grid-cols-3 gap-3">
                    <div class="cir-card p-4 text-center">
                        <span class="cir-label !mb-1 !text-[10px]">Total</span>
                        <span class="text-2xl font-bold" style="color: var(--cir-text)" data-stat-value="total">--</span>
                    </div>
                    <div class="cir-card p-4 text-center">
                        <span class="cir-label !mb-1 !text-[10px]">Resolved</span>
                        <span class="text-2xl font-bold text-emerald-500" data-stat-value="resolved">--</span>
                    </div>
                    <div class="cir-card p-4 text-center">
                        <span class="cir-label !mb-1 !text-[10px]">Pending</span>
                        <span class="text-2xl font-bold text-amber-500" data-stat-value="pending">--</span>
                    </div>
                </div>
                <div class="flex items-center gap-3 rounded-2xl p-5" style="background: var(--cir-surface-muted)">
                    <span class="material-symbols-outlined text-emerald-500">location_on</span>
                    <p class="text-sm" style="color: var(--cir-text-muted)">Location-tagged issue reporting connected to field operations and transparent updates.</p>
                </div>
            </div>
        </div>
    </section>

    {{-- About --}}
    <section class="cir-landing-section px-6 py-16 md:px-12 md:py-20 lg:px-24" id="about">
        <div class="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
                <p class="cir-label mb-3 !text-emerald-500">About CIR</p>
                <h2 class="cir-title mb-4 !text-3xl lg:!text-4xl">A smarter way to connect public issues with real action</h2>
                <p class="cir-subtitle mb-8">
                    CIR gives citizens a direct channel to report problems, helps departments prioritize urgent work, and keeps the full resolution journey visible.
                </p>
                <div class="grid gap-4 md:grid-cols-3">
                    <div class="cir-landing-card p-6">
                        <div class="cir-icon-chip mb-4"><span class="material-symbols-outlined">photo_camera</span></div>
                        <h3 class="mb-2 font-bold" style="color: var(--cir-text)">Visual Reporting</h3>
                        <p class="text-sm" style="color: var(--cir-text-muted)">Attach photos and make each complaint actionable from the start.</p>
                    </div>
                    <div class="cir-landing-card p-6">
                        <div class="cir-icon-chip mb-4"><span class="material-symbols-outlined">route</span></div>
                        <h3 class="mb-2 font-bold" style="color: var(--cir-text)">Smart Routing</h3>
                        <p class="text-sm" style="color: var(--cir-text-muted)">Direct issues to the right municipal team with better accountability.</p>
                    </div>
                    <div class="cir-landing-card p-6">
                        <div class="cir-icon-chip mb-4"><span class="material-symbols-outlined">verified</span></div>
                        <h3 class="mb-2 font-bold" style="color: var(--cir-text)">Transparent Updates</h3>
                        <p class="text-sm" style="color: var(--cir-text-muted)">Citizens and workers stay aligned with visible status changes.</p>
                    </div>
                </div>
            </div>

            <aside class="cir-landing-card p-6" data-stats-url="{{ url('/api/stats') }}" data-login-url="{{ route('login') }}">
                <p class="cir-label mb-2 !text-emerald-500">System Stats</p>
                <h3 class="mb-6 text-xl font-bold" style="color: var(--cir-text)">Real-time civic response at a glance</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between border-b py-3" style="border-color: var(--cir-border)">
                        <span style="color: var(--cir-text-muted)">Total Issues</span>
                        <strong id="total-issues-value" style="color: var(--cir-text)">--</strong>
                    </div>
                    <div class="flex items-center justify-between border-b py-3" style="border-color: var(--cir-border)">
                        <span style="color: var(--cir-text-muted)">Resolved</span>
                        <strong class="text-emerald-500" id="resolved-issues-value">--</strong>
                    </div>
                    <div class="flex items-center justify-between py-3">
                        <span style="color: var(--cir-text-muted)">Pending</span>
                        <strong class="text-amber-500" id="pending-issues-value">--</strong>
                    </div>
                </div>
                <p class="mt-6 hidden text-sm" id="stats-feedback" role="status" style="color: var(--cir-text-muted)"></p>
            </aside>
        </div>
    </section>

    {{-- User types --}}
    <section class="cir-landing-hero px-6 py-16 md:px-12 md:py-20 lg:px-24" id="users">
        <div class="mx-auto max-w-7xl">
            <div class="mb-10 max-w-3xl">
                <p class="cir-label mb-3 !text-emerald-500">User Types</p>
                <h2 class="cir-title mb-4 !text-3xl lg:!text-4xl">Built for every stakeholder in the civic response cycle</h2>
                <p class="cir-subtitle">Each user gets a focused workspace while keeping reporting, assignment, and resolution connected in one flow.</p>
            </div>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div class="cir-landing-card p-6">
                    <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                        <span class="material-symbols-outlined text-3xl">location_on</span>
                    </div>
                    <p class="cir-label mb-2 !text-emerald-500">Citizen</p>
                    <h3 class="mb-3 text-xl font-bold" style="color: var(--cir-text)">Report local issues and monitor progress</h3>
                    <p class="text-sm" style="color: var(--cir-text-muted)">Dedicated tools for citizens to participate in Rwanda's civic response platform.</p>
                </div>
                <div class="cir-landing-card p-6">
                    <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                        <span class="material-symbols-outlined text-3xl">engineering</span>
                    </div>
                    <p class="cir-label mb-2 !text-sky-500">Worker</p>
                    <h3 class="mb-3 text-xl font-bold" style="color: var(--cir-text)">Handle field assignments with clarity</h3>
                    <p class="text-sm" style="color: var(--cir-text-muted)">Dedicated tools for workers to participate in Rwanda's civic response platform.</p>
                </div>
                <div class="cir-landing-card p-6">
                    <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                        <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
                    </div>
                    <p class="cir-label mb-2 !text-violet-500">Admin</p>
                    <h3 class="mb-3 text-xl font-bold" style="color: var(--cir-text)">Coordinate city-wide response and oversight</h3>
                    <p class="text-sm" style="color: var(--cir-text-muted)">Dedicated tools for admins to participate in Rwanda's civic response platform.</p>
                </div>
            </div>
        </div>
    </section>

    {{-- Features --}}
    <section class="cir-landing-section px-6 py-16 md:px-12 md:py-20 lg:px-24" id="features">
        <div class="mx-auto max-w-7xl">
            <div class="mb-10 max-w-3xl">
                <p class="cir-label mb-3 !text-emerald-500">Platform Features</p>
                <h2 class="cir-title mb-4 !text-3xl lg:!text-4xl">Core features that make the system practical and accountable</h2>
            </div>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div class="cir-landing-card p-6">
                    <div class="cir-icon-chip mb-4"><span class="material-symbols-outlined">search</span></div>
                    <h3 class="mb-2 font-semibold" style="color: var(--cir-text)">Location-Based Reporting</h3>
                    <p class="text-sm" style="color: var(--cir-text-muted)">Built into the CIR platform for transparent municipal response in Rwanda.</p>
                </div>
                <div class="cir-landing-card p-6">
                    <div class="cir-icon-chip mb-4"><span class="material-symbols-outlined">task_alt</span></div>
                    <h3 class="mb-2 font-semibold" style="color: var(--cir-text)">Status Tracking</h3>
                    <p class="text-sm" style="color: var(--cir-text-muted)">Built into the CIR platform for transparent municipal response in Rwanda.</p>
                </div>
                <div class="cir-landing-card p-6">
                    <div class="cir-icon-chip mb-4"><span class="material-symbols-outlined">groups</span></div>
                    <h3 class="mb-2 font-semibold" style="color: var(--cir-text)">Role-Based Workspaces</h3>
                    <p class="text-sm" style="color: var(--cir-text-muted)">Built into the CIR platform for transparent municipal response in Rwanda.</p>
                </div>
                <div class="cir-landing-card p-6">
                    <div class="cir-icon-chip mb-4"><span class="material-symbols-outlined">monitoring</span></div>
                    <h3 class="mb-2 font-semibold" style="color: var(--cir-text)">Operational Visibility</h3>
                    <p class="text-sm" style="color: var(--cir-text-muted)">Built into the CIR platform for transparent municipal response in Rwanda.</p>
                </div>
            </div>
        </div>
    </section>

    {{-- CTA --}}
    <section class="bg-emerald-600 px-6 py-16 md:px-12 md:py-20 lg:px-24" id="cta">
        <div class="mx-auto max-w-4xl text-center">
            <h2 class="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">Ready to make a visible difference?</h2>
            <p class="mb-8 text-lg text-emerald-100">Move from static information to live civic action — report, monitor, and improve public spaces.</p>
            <button class="cir-btn bg-white !px-8 !py-4 !text-base !text-emerald-700 hover:!bg-emerald-50" id="get-started-btn" data-login-url="{{ route('login') }}" type="button">
                Get Started Now
                <span class="material-symbols-outlined">arrow_forward</span>
            </button>
        </div>
    </section>
@endsection
