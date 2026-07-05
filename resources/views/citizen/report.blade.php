@extends('layouts.citizen-app')

@section('title', 'Report Issue — CIR')
@section('citizen-page', 'report')

@push('head')
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
@endpush

@section('citizen-content')
    <div class="cir-content max-w-5xl">
        <a href="{{ route('citizen.dashboard') }}" class="cir-back-link mb-8">
            <span class="material-symbols-outlined text-lg">arrow_back</span>
            Back to dashboard
        </a>

        <div class="cir-panel p-6 sm:p-8 lg:p-10">
            <div class="mb-10 flex items-start gap-4">
                <div class="cir-icon-chip !h-14 !w-14">
                    <span class="material-symbols-outlined text-3xl">add_circle</span>
                </div>
                <div>
                    <h1 class="cir-title !text-2xl sm:!text-3xl">Report New Issue</h1>
                    <p class="cir-subtitle mt-2 max-w-2xl text-base">Describe the issue, pin its location on the map, and upload images to help the city respond faster.</p>
                </div>
            </div>

            <div class="mb-6 hidden" data-report-message></div>

            <form class="space-y-8" data-report-form>
                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                        <label class="cir-label">Issue Title</label>
                        <input class="cir-input" name="title" placeholder="e.g. Pothole on Main Street near bus stop" required type="text" />
                    </div>
                    <div>
                        <label class="cir-label">Category</label>
                        <select class="cir-select" name="category">
                            <option value="roads">Roads & Potholes</option>
                            <option value="lighting">Lighting</option>
                            <option value="water">Water & Drainage</option>
                            <option value="sanitation">Sanitation</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                        <label class="cir-label">Address / Landmark</label>
                        <input class="cir-input" name="address" placeholder="Enter area, landmark, or street name" type="text" />
                    </div>
                    <div>
                        <label class="cir-label">Priority</label>
                        <select class="cir-select" name="priority">
                            <option value="medium">Needs attention soon</option>
                            <option value="low">Normal issue</option>
                            <option value="high">High concern</option>
                            <option value="urgent">Urgent safety concern</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="cir-label">Description</label>
                    <textarea class="cir-textarea" name="description" placeholder="Share what you observed, when it started, and what impact it is having." required rows="6"></textarea>
                </div>

                <div class="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div class="cir-card space-y-4 p-6">
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 class="cir-section-heading">Pin Exact Location</h3>
                                <p class="mt-1 text-sm" style="color: var(--cir-text-muted)">Click on the map or use your current location.</p>
                            </div>
                            <button class="cir-btn cir-btn-secondary" data-use-location type="button">Use Current Location</button>
                        </div>
                        <div class="h-80 overflow-hidden rounded-2xl border" style="border-color: var(--cir-border)" data-report-map></div>
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <input class="cir-input" name="latitude" placeholder="Latitude" readonly required type="text" />
                            <input class="cir-input" name="longitude" placeholder="Longitude" readonly required type="text" />
                        </div>
                    </div>

                    <div class="cir-card border-dashed p-6">
                        <div class="flex items-center gap-4">
                            <div class="cir-icon-chip !bg-sky-500/10 !text-sky-500">
                                <span class="material-symbols-outlined text-3xl">upload</span>
                            </div>
                            <div>
                                <h3 class="cir-section-heading">Upload Images</h3>
                                <p class="mt-1 text-sm" style="color: var(--cir-text-muted)">Attach supporting photos to speed up verification.</p>
                            </div>
                        </div>
                        <div class="mt-6 rounded-2xl border border-dashed px-6 py-10 text-center" style="border-color: var(--cir-border); background: var(--cir-surface-muted)">
                            <span class="material-symbols-outlined mb-3 block text-5xl" style="color: var(--cir-text-faint)">image</span>
                            <label class="block cursor-pointer font-semibold" style="color: var(--cir-text-secondary)">
                                Browse image files
                                <input accept=".png,.jpg,.jpeg" class="hidden" multiple name="images[]" type="file" />
                            </label>
                            <p class="mt-1 text-sm" style="color: var(--cir-text-faint)">PNG and JPG up to 5 MB each</p>
                            <div class="mt-4 space-y-3" data-upload-preview>
                                <p class="text-sm" style="color: var(--cir-text-faint)">No files selected yet.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-4 pt-2 sm:flex-row">
                    <button class="cir-btn cir-btn-secondary flex-1" type="reset">Reset Form</button>
                    <button class="cir-btn cir-btn-primary flex-1" type="submit">Submit Report</button>
                </div>
            </form>
        </div>
    </div>
@endsection
