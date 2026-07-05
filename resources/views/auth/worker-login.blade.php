@extends('layouts.auth')

@section('title', 'Worker Login — CIR')

@section('body-attrs')
    data-api-worker-login-url="{{ url('/api/worker/login') }}"
    data-api-logout-url="{{ url('/api/logout') }}"
    data-api-me-url="{{ url('/api/me') }}"
    data-auth-page="worker-login"
    data-dashboard-worker="{{ route('worker.dashboard') }}"
    data-login-url="{{ route('login') }}"
    data-worker-login-url="{{ route('login.worker') }}"
@endsection

@section('content')
    <div class="cir-auth-card">
        <div class="mb-8 text-center">
            <p class="cir-auth-logo"><span>CIR</span></p>
            <p class="cir-auth-tagline !mb-2">Worker Portal Access</p>
            <p class="text-sm" style="color: var(--cir-text-muted)">Sign in with your registered name and email.</p>
        </div>

        <div class="auth-alert hidden mb-6 rounded-xl px-4 py-3 text-sm" data-auth-alert style="background: var(--cir-error-bg); color: var(--cir-error-text); border: 1px solid var(--cir-error-border)"></div>

        <form class="flex flex-col gap-5" data-auth-form="worker-login" novalidate>
            <div>
                <label class="cir-label" for="name">Full Name</label>
                <input autocomplete="name" class="cir-input" id="name" name="name" placeholder="Priya Sanitation" type="text" />
                <p class="mt-1 hidden text-xs font-medium text-rose-500" data-field-error="name"></p>
            </div>

            <div>
                <label class="cir-label" for="email">Work Email</label>
                <input autocomplete="email" class="cir-input" id="email" name="email" placeholder="worker.sanitation@civic.local" type="email" />
                <p class="mt-1 hidden text-xs font-medium text-rose-500" data-field-error="email"></p>
            </div>

            <button class="cir-btn cir-btn-primary w-full !py-3.5" data-idle-label="Login as Worker" data-loading-label="Signing in..." type="submit">
                <span data-submit-label>Login as Worker</span>
                <span class="auth-spinner hidden ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
            </button>
        </form>

        <div class="mt-8 space-y-3 border-t pt-6 text-center text-sm" style="border-color: var(--cir-border); color: var(--cir-text-muted)">
            <p>
                Citizen or admin?
                <a class="font-semibold text-emerald-500 hover:text-emerald-400" href="{{ route('login') }}">Use standard login</a>
            </p>
            <a class="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-emerald-500" href="{{ route('home') }}">
                <span class="material-symbols-outlined text-base">arrow_back</span>
                Back to homepage
            </a>
        </div>
    </div>
@endsection
