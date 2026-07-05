@extends('layouts.auth')

@section('title', 'Login — CIR')

@section('body-attrs')
    data-api-login-url="{{ url('/api/login') }}"
    data-api-logout-url="{{ url('/api/logout') }}"
    data-api-me-url="{{ url('/api/me') }}"
    data-auth-page="login"
    data-dashboard-municipal-manager="{{ route('admin.dashboard') }}"
    data-dashboard-system-manager="{{ route('admin.dashboard') }}"
    data-admin-session-login-url="{{ route('admin.session-login') }}"
    data-dashboard-citizen="{{ route('citizen.dashboard') }}"
    data-dashboard-worker="{{ route('worker.dashboard') }}"
    data-login-url="{{ route('login') }}"
    data-register-url="{{ route('register') }}"
@endsection

@section('content')
    <div class="cir-auth-card">
        <div class="mb-8 text-center">
            <p class="cir-auth-logo"><span>CIR</span></p>
            <p class="cir-auth-tagline !mb-0">Smart Public Issue Reporting</p>
        </div>

        <div class="auth-alert hidden mb-6 rounded-xl px-4 py-3 text-sm" data-auth-alert style="background: var(--cir-error-bg); color: var(--cir-error-text); border: 1px solid var(--cir-error-border)"></div>

        <form class="flex flex-col gap-5" data-auth-form="login" novalidate>
            <div>
                <label class="cir-label" for="email">Email Address</label>
                <input autocomplete="email" class="cir-input" id="email" name="email" placeholder="alex@example.com" type="email" />
                <p class="mt-1 hidden text-xs font-medium text-rose-500" data-field-error="email"></p>
            </div>

            <div>
                <label class="cir-label" for="password">Password</label>
                <div class="relative">
                    <input autocomplete="current-password" class="cir-input !pr-12" id="password" name="password" placeholder="Enter your password" type="password" />
                    <button aria-label="Toggle password visibility" class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cir-text-faint)]" data-password-toggle="password" type="button">
                        <span class="material-symbols-outlined text-xl">visibility</span>
                    </button>
                </div>
                <p class="mt-1 hidden text-xs font-medium text-rose-500" data-field-error="password"></p>
            </div>

            <button class="cir-btn cir-btn-primary w-full !py-3.5" data-idle-label="Login to Account" data-loading-label="Signing in..." type="submit">
                <span data-submit-label>Login to Account</span>
                <span class="auth-spinner hidden ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
            </button>
        </form>

        <div class="mt-8 border-t pt-6 text-center text-sm" style="border-color: var(--cir-border); color: var(--cir-text-muted)">
            Municipal field worker?
            <a class="font-semibold text-sky-500 hover:text-sky-400" href="{{ route('login.worker') }}">Login as Worker</a>
        </div>

        <div class="mt-4 text-center text-sm" style="color: var(--cir-text-muted)">
            Need a new account?
            <a class="font-semibold text-emerald-500 hover:text-emerald-400" href="{{ route('register') }}">Create one here</a>
        </div>
    </div>
@endsection
