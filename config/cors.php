<?php

$allowedOrigins = env('CORS_ALLOWED_ORIGINS');

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Required for browser clients and Electron renderer requests to /api/*.
    | Without this file on production, Laravel sends no CORS headers.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins
        ? array_values(array_filter(array_map('trim', explode(',', $allowedOrigins))))
        : ['*'],

    'allowed_origins_patterns' => [
        '/^https?:\/\/(.*\.)?helioho\.st(:\d+)?$/',
        '/^http:\/\/localhost(:\d+)?$/',
        '/^http:\/\/127\.0\.0\.1(:\d+)?$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];
