<?php

use Illuminate\Support\Facades\Route;

// This app is API-only; the UI lives in the sibling Next.js project. The root route
// just reports what this service is and where its parts are.
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'api' => url('/api'),
    'health' => url('/up'),
    'frontend' => config('phive.frontend_url'),
]));
