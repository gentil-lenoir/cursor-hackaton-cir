<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <title>@yield('title', 'CIR - Smart Public Issue Reporting & Resolution')</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
        <script>
            (function () {
                try {
                    const settings = JSON.parse(localStorage.getItem('citizen_settings') || '{}');
                    document.documentElement.dataset.citizenTheme = settings.theme_preference || 'light';
                } catch (error) {
                    document.documentElement.dataset.citizenTheme = 'light';
                }
            })();
        </script>
        @vite(['resources/css/app.css', 'resources/css/citizen-theme.css', 'resources/js/app.js'])
        @stack('page_assets')
    </head>
    <body
        class="cir-page font-display antialiased"
        data-api-me-url="{{ url('/api/me') }}"
        data-login-url="{{ route('login') }}"
        data-dashboard-citizen-url="{{ route('citizen.dashboard') }}"
        data-report-issue-url="{{ route('citizen.report') }}"
    >
        @include('components.navbar')
        @yield('content')
        @include('components.footer')
    </body>
</html>
