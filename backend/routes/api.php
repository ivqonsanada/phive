<?php

use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\PasswordController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public
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
});
