<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Frontend URL
    |--------------------------------------------------------------------------
    |
    | The origin of the Next.js app. Email verification and password reset links
    | point here rather than at the API. The first entry is used when building
    | links; every entry is allowed through CORS (see config/cors.php).
    |
    */

    'frontend_url' => rtrim((string) explode(',', (string) env('FRONTEND_URL', 'http://localhost:3000'))[0], '/'),

    /*
    |--------------------------------------------------------------------------
    | Lecturer Email Rule
    |--------------------------------------------------------------------------
    |
    | PHive was built for Indonesian universities, where staff addresses live on
    | an `.ac.id` domain and student addresses are prefixed with `student`. Fork
    | this for your own institution, or set the pattern to null to accept any
    | address for lecturer sign-ups.
    |
    */

    'lecturer_email_pattern' => env(
        'LECTURER_EMAIL_PATTERN',
        '/^[a-zA-Z0-9._%+-]+@(?!.*student).*\.ac\.id$/'
    ),

    /*
    |--------------------------------------------------------------------------
    | Demo Mode
    |--------------------------------------------------------------------------
    |
    | Marks this instance as a throwaway demo. It is the single gate on
    | `phive:demo-reset`, which drops every table — so it defaults to false and
    | has to be turned on deliberately, per environment.
    |
    */

    'demo_mode' => (bool) env('DEMO_MODE', false),

    // Local time of the nightly reset, when demo mode is on.
    'demo_reset_at' => env('DEMO_RESET_AT', '03:00'),

    /*
    |--------------------------------------------------------------------------
    | Uploads
    |--------------------------------------------------------------------------
    */

    'uploads' => [
        'avatar_max_kb' => (int) env('UPLOAD_AVATAR_MAX_KB', 1024),
        'cv_max_kb' => (int) env('UPLOAD_CV_MAX_KB', 4096),
        'thumbnail_max_kb' => (int) env('UPLOAD_THUMBNAIL_MAX_KB', 2048),
    ],

];
