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
use App\Http\Controllers\Api\ProjectManagementController;
use App\Http\Controllers\Api\Settings\ExperienceController;
use App\Http\Controllers\Api\Settings\MediaController;
use App\Http\Controllers\Api\Settings\ProfileController as SettingsProfileController;
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

    // Lecturer project management. Kept under /my so none of these collide with the
    // public {project} slug routes above.
    Route::get('my/projects', [ProjectManagementController::class, 'index']);
    Route::post('my/projects', [ProjectManagementController::class, 'store']);
    Route::patch('my/projects/{project}', [ProjectManagementController::class, 'update']);
    Route::delete('my/projects/{project}', [ProjectManagementController::class, 'destroy']);
    Route::post('my/projects/{project}/publish', [ProjectManagementController::class, 'publish']);
    Route::post('my/projects/{project}/close', [ProjectManagementController::class, 'closeApplications']);
    Route::post('my/projects/{project}/thumbnail', [MediaController::class, 'uploadThumbnail']);
    Route::delete('my/projects/{project}/thumbnail', [MediaController::class, 'deleteThumbnail']);

    // Own profile and media.
    Route::patch('settings/profile', [SettingsProfileController::class, 'update']);
    Route::post('settings/avatar', [MediaController::class, 'uploadAvatar']);
    Route::delete('settings/avatar', [MediaController::class, 'deleteAvatar']);
    Route::post('settings/cv', [MediaController::class, 'uploadCv']);
    Route::delete('settings/cv', [MediaController::class, 'deleteCv']);

    Route::post('settings/experiences', [ExperienceController::class, 'store']);
    Route::patch('settings/experiences/{experience}', [ExperienceController::class, 'update']);
    Route::delete('settings/experiences/{experience}', [ExperienceController::class, 'destroy']);
});
