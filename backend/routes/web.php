<?php

use App\Http\Controllers\Api\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;

// This app is API-only; the UI lives in the sibling Next.js project. The root route
// just reports what this service is and where its parts are.
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'api' => url('/api'),
    'health' => url('/up'),
    'frontend' => config('phive.frontend_url'),
]));

/*
|--------------------------------------------------------------------------
| Social sign-in
|--------------------------------------------------------------------------
|
| These live on the web routes, not under /api, because the OAuth dance is a
| browser redirect flow and needs the session to carry state across it. The
| callback finishes by redirecting to the frontend with a single-use code; the
| token itself is fetched over POST /api/auth/exchange.
|
*/

Route::get('auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])
    ->whereIn('provider', ['google', 'apple'])
    ->name('social.redirect');

Route::match(['get', 'post'], 'auth/{provider}/callback', [SocialAuthController::class, 'callback'])
    ->whereIn('provider', ['google', 'apple'])
    ->name('social.callback');
