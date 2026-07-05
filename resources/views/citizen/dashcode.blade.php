@extends('layouts.citizen-app')

@section('title', 'Dashboard — CIR')
@section('citizen-page', 'dashboard')

@section('citizen-content')
    <div class="cir-content">
        {{-- Page header --}}
        <section class="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
                <h1 class="cir-title">Welcome, <span data-citizen-name>Citizen</span></h1>
                <p class="cir-subtitle mt-2">Track your complaints, report new issues, and monitor how the city responds.</p>
            </div>
            <div class="cir-card inline-flex items-center gap-3 px-5 py-3">
                <div class="cir-icon-chip !h-9 !w-9">
                    <span class="material-symbols-outlined text-lg">location_on</span>
                </div>
                <span class="text-sm font-semibold" style="color: var(--cir-text-secondary)" data-stat="preferred_location">No preferred location set yet</span>
            </div>
        </section>

        {{-- Stats --}}
        <section class="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div class="cir-stat-card">
                <p class="cir-label !mb-3">Total Reported</p>
                <p class="text-4xl font-extrabold" style="color: var(--cir-text)" data-stat="total_reported">0</p>
            </div>
            <div class="cir-stat-card">
                <p class="cir-label !mb-3">In Progress</p>
                <p class="text-4xl font-extrabold" style="color: var(--cir-text)" data-stat="in_progress">0</p>
            </div>
            <div class="cir-stat-card">
                <p class="cir-label !mb-3">Resolved</p>
                <p class="text-4xl font-extrabold" style="color: var(--cir-text)" data-stat="resolved">0</p>
            </div>
            <div class="cir-stat-card">
                <p class="cir-label !mb-3">Upvotes Received</p>
                <p class="text-4xl font-extrabold" style="color: var(--cir-text)" data-stat="upvotes_received">0</p>
            </div>
        </section>

        {{-- Quick actions --}}
        <section class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <a href="{{ route('citizen.report') }}" class="cir-action-tile group flex flex-col items-center">
                <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <span class="material-symbols-outlined text-4xl">add_circle</span>
                </div>
                <h4 class="cir-section-heading mb-2">Report New Issue</h4>
                <p class="max-w-xs text-sm" style="color: var(--cir-text-muted)">Pin the location, upload photos, and submit a complaint to the live system.</p>
            </a>
            <a href="{{ route('citizen.my_issues') }}" class="cir-action-tile group flex flex-col items-center">
                <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-500 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                    <span class="material-symbols-outlined text-4xl">history</span>
                </div>
                <h4 class="cir-section-heading mb-2">My Reported Issues</h4>
                <p class="max-w-xs text-sm" style="color: var(--cir-text-muted)">See your complaint history, assigned workers, and status updates.</p>
            </a>
            <a href="{{ route('community.index') }}" class="cir-action-tile group flex flex-col items-center">
                <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-500 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                    <span class="material-symbols-outlined text-4xl">groups</span>
                </div>
                <h4 class="cir-section-heading mb-2">Community Feed</h4>
                <p class="max-w-xs text-sm" style="color: var(--cir-text-muted)">Browse other citizens' reports, upvote urgent issues, and join discussions.</p>
            </a>
        </section>

        {{-- Recent updates --}}
        <section>
            <div class="mb-6 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="h-6 w-1.5 rounded-full bg-emerald-500"></div>
                    <h3 class="cir-section-heading uppercase tracking-tight">Recent Updates</h3>
                </div>
                <a href="{{ route('citizen.my_issues') }}" class="cir-back-link">
                    View all
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
            </div>
            <div class="cir-card-lg overflow-hidden">
                <div class="cir-divide" data-recent-issues>
                    <div class="p-6 text-sm" style="color: var(--cir-text-muted)">Loading your latest reports...</div>
                </div>
            </div>
        </section>
    </div>
@endsection
