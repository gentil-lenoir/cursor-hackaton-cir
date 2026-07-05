@extends('layouts.app')

@push('page_assets')
    @vite(['resources/js/community.js'])
@endpush

@section('title', 'Community Issues — CIR')

@section('content')
    <section class="cir-landing-section px-6 py-12 md:px-12 md:py-16 lg:px-24">
        <div class="mx-auto max-w-7xl">
            <div class="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                    <p class="cir-label mb-3 !text-emerald-500">Community Feed</p>
                    <h1 class="cir-title mb-3 !text-3xl lg:!text-4xl">See what others are reporting</h1>
                    <p class="cir-subtitle max-w-2xl">
                        Browse civic issues reported across Rwanda, support urgent reports with upvotes, and join the conversation with comments.
                    </p>
                </div>
                <a href="{{ route('citizen.report') }}" class="cir-btn cir-btn-primary shrink-0">
                    <span class="material-symbols-outlined">add_circle</span>
                    Report an Issue
                </a>
            </div>

            <div class="cir-card mb-8 grid grid-cols-1 gap-4 p-5 md:grid-cols-4">
                <div class="relative md:col-span-2">
                    <span class="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl" style="color: var(--cir-text-faint)">search</span>
                    <input class="cir-input !pl-12" data-community-search placeholder="Search title, location, or category" type="search" />
                </div>
                <select class="cir-select" data-community-status>
                    <option value="">All statuses</option>
                    <option value="reported">Reported</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalated</option>
                </select>
                <select class="cir-select" data-community-category>
                    <option value="">All categories</option>
                    <option value="roads">Roads</option>
                    <option value="sanitation">Sanitation</option>
                    <option value="water">Water</option>
                    <option value="electricity">Electricity</option>
                    <option value="public safety">Public Safety</option>
                    <option value="environment">Environment</option>
                    <option value="general">General</option>
                </select>
            </div>

            <div class="mb-6 flex items-center justify-between gap-4">
                <p class="text-sm font-semibold" style="color: var(--cir-text-muted)">
                    <span data-community-count>0</span> issues found
                </p>
                <p class="hidden text-sm" data-community-feedback role="status" style="color: var(--cir-text-muted)"></p>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" data-community-feed>
                <div class="cir-card p-6 text-sm md:col-span-2 xl:col-span-3" style="color: var(--cir-text-muted)">Loading community issues...</div>
            </div>

            <div class="mt-10 flex justify-center">
                <button class="cir-btn cir-btn-secondary hidden" data-community-load-more type="button">
                    Load more issues
                </button>
            </div>
        </div>
    </section>
@endsection
