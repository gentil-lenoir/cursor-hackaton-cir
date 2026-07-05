<?php

return [
    'otp' => [
        'driver' => env('OTP_DRIVER', 'cache'),
        'ttl' => (int) env('OTP_TTL', 300),
        'rate_limit' => (int) env('OTP_RATE_LIMIT', 3),
        'rate_window' => (int) env('OTP_RATE_WINDOW', 900),
        'max_attempts' => 5,
        'dev_log' => env('OTP_DEV_LOG', true),
        // When set (e.g. in local/testing), every OTP request uses this code instead of a random one.
        'fixed_code' => env('OTP_FIXED_CODE'),
    ],

    'phone_regex' => '/^\+250[0-9]{9}$/',

    'token_ttl_days' => [
        'citizen-web' => 30,
        'citizen-mobile' => 30,
        'worker-mobile' => 30,
        'admin-desktop' => 1,
    ],
];
