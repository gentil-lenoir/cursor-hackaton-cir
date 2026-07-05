@extends('layouts.citizen-app')

@section('title', 'My Profile — CIR')
@section('citizen-page', 'profile')

@section('citizen-content')
    <div class="cir-content max-w-5xl">
        <div class="mb-8">
            <h1 class="cir-title !text-2xl sm:!text-3xl">My Profile</h1>
            <p class="cir-subtitle mt-2">Manage your citizen account and reporting preferences.</p>
        </div>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <section class="cir-panel p-8 text-center">
                <div class="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-emerald-500/15 text-3xl font-black text-emerald-500 ring-4 ring-emerald-500/10">CF</div>
                <h2 class="mt-5 text-2xl font-extrabold" style="color: var(--cir-text)" data-profile-name>Citizen</h2>
                <p class="mt-1 text-sm" style="color: var(--cir-text-muted)" data-profile-email>citizen@example.com</p>

                <div class="mt-8 grid grid-cols-2 gap-4">
                    <div class="cir-card p-4">
                        <p class="text-3xl font-extrabold text-emerald-500" data-profile-total>0</p>
                        <p class="cir-label !mb-0 mt-2">Reported</p>
                    </div>
                    <div class="cir-card p-4">
                        <p class="text-3xl font-extrabold text-emerald-500" data-profile-resolved>0</p>
                        <p class="cir-label !mb-0 mt-2">Resolved</p>
                    </div>
                </div>

                <div class="mt-8 flex items-center justify-center gap-3">
                    <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--cir-text-muted)">Appearance</span>
                    @include('components.citizen-theme-toggle')
                </div>
            </section>

            <section class="cir-panel p-8">
                <div class="mb-8 flex items-center gap-3">
                    <div class="cir-icon-chip">
                        <span class="material-symbols-outlined text-2xl">person</span>
                    </div>
                    <div>
                        <h3 class="cir-section-heading">Personal Information</h3>
                        <p class="text-sm" style="color: var(--cir-text-muted)">Keep your civic reporting profile up to date.</p>
                    </div>
                </div>

                <div class="mb-6 hidden" data-profile-message></div>

                <form class="grid grid-cols-1 gap-6 md:grid-cols-2" data-citizen-profile-form>
                    <div>
                        <label class="cir-label">Full Name</label>
                        <input class="cir-input" name="name" type="text" />
                    </div>
                    <div>
                        <label class="cir-label">Email Address</label>
                        <input class="cir-input" name="email" type="email" />
                    </div>
                    <div>
                        <label class="cir-label">Mobile Number</label>
                        <input class="cir-input" name="phone" type="tel" />
                    </div>
                    <div>
                        <label class="cir-label">Preferred Location</label>
                        <input class="cir-input" name="preferred_location" type="text" />
                    </div>
                    <div>
                        <label class="cir-label">New Password</label>
                        <input class="cir-input" name="password" type="password" />
                    </div>
                    <div>
                        <label class="cir-label">Confirm Password</label>
                        <input class="cir-input" name="password_confirmation" type="password" />
                    </div>
                    <div class="flex justify-end gap-4 pt-2 md:col-span-2">
                        <button class="cir-btn cir-btn-secondary" type="reset">Reset</button>
                        <button class="cir-btn cir-btn-primary" type="submit">Save Changes</button>
                    </div>
                </form>
            </section>
        </div>
    </div>
@endsection
