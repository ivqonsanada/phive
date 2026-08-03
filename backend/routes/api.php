<?php

use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\PasswordController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public reads
|--------------------------------------------------------------------------
|
| These work for guests, but personalise themselves when the request carries a
| token — the default guard is Sanctum, so `$request->user()` resolves a bearer
| token here without rejecting anonymous callers.
|
*/

Route::get('home', [HomeController::class, 'index']);
Route::get('projects', [ProjectController::class, 'index']);
Route::get('projects/{project}', [ProjectController::class, 'show']);
Route::get('projects/{project}/similar', [ProjectController::class, 'similar']);
Route::get('users/{user}', [ProfileController::class, 'show']);
Route::get('leaderboards', [LeaderboardController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Guest auth
|--------------------------------------------------------------------------
*/

Route::post('register', RegisterController::class)->middleware('throttle:6,1');
Route::post('login', [LoginController::class, 'store']);

Route::post('password/email', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:6,1');
Route::post('password/reset', [PasswordResetController::class, 'reset']);

Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [LoginController::class, 'destroy']);

    Route::get('user', [UserController::class, 'current']);

    Route::patch('settings/password', [PasswordController::class, 'update']);

    Route::post('email/resend', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1');

    Route::get('wishlist', [WishlistController::class, 'index']);
    Route::post('projects/{project}/wishlist', [WishlistController::class, 'toggle']);
});
