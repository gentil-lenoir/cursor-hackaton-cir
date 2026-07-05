@extends('layouts.citizen-app')

@section('title', 'My Issues — CIR')
@section('citizen-page', 'issues')

@section('citizen-content')
    <div class="cir-content max-w-5xl">
        <a href="{{ route('citizen.dashboard') }}" class="cir-back-link mb-8">
            <span class="material-symbols-outlined text-lg">arrow_back</span>
            Back to dashboard
        </a>

        <div class="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div class="flex items-start gap-4">
                <div class="cir-icon-chip">
                    <span class="material-symbols-outlined text-2xl">list_alt</span>
                </div>
                <div>
                    <h1 class="cir-title !text-2xl sm:!text-3xl">My Reported Issues</h1>
                    <p class="cir-subtitle mt-2">Track resolution progress and status changes for every issue you submitted.</p>
                </div>
            </div>
            <span class="cir-pill"><span data-issues-total>0</span> Total</span>
        </div>

        <div class="cir-card mb-5 grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <div class="relative">
                <span class="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl" style="color: var(--cir-text-faint)">search</span>
                <input class="cir-input !pl-12" data-issues-search placeholder="Search by title, location, or category" type="text" />
            </div>
            <select class="cir-select" data-issues-status-filter>
                <option value="">All statuses</option>
                <option value="reported">Reported</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
            </select>
        </div>

        <div class="space-y-5" data-issues-list>
            <div class="cir-card p-6 text-sm" style="color: var(--cir-text-muted)">Loading your issues...</div>
        </div>
    </div>
@endsection
