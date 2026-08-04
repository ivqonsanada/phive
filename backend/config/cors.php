<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | The API is consumed by the Next.js frontend from a different origin, so the
    | allowed origins are driven by FRONTEND_URL. Set it to a comma-separated list
    | to permit several origins (production plus preview deploys, for example).
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(
        array_map('trim', explode(',', (string) env('FRONTEND_URL', 'http://localhost:3000')))
    )),

    'allowed_origins_patterns' => array_values(array_filter(
        array_map('trim', explode(',', (string) env('FRONTEND_URL_PATTERNS', '')))
    )),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 60 * 60 * 24,

    // Bearer tokens are sent in the Authorization header, not cookies.
    'supports_credentials' => false,

];
