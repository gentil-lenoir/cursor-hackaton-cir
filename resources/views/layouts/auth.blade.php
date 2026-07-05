<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <title>@yield('title', 'CIR — Authentication')</title>
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
        @vite(['resources/css/app.css', 'resources/css/citizen-theme.css', 'resources/js/app.js', 'resources/js/auth.js'])
    </head>
    <body class="cir-auth-page" @yield('body-attrs')>
        <div class="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
            @include('components.citizen-theme-toggle')
        </div>
        @yield('content')
    </body>
</html>
