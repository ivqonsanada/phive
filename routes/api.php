<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['middleware' => 'auth:api'], function () {
    Route::post('logout', 'Auth\LoginController@logout');

    Route::get('user', 'Auth\UserController@current');

    Route::patch('settings/profile', 'Settings\ProfileController@update');
    Route::patch('settings/password', 'Settings\PasswordController@update');

    Route::post('user/uploadavatar', 'Auth\UserController@uploadAvatar');
    Route::post('user/saveprofile/1', 'Auth\UserController@saveProfile1');
    Route::post('user/saveprofile/2', 'Auth\UserController@saveProfile2');


    Route::post('project/{project}/apply/individual', 'Auth\ApplyController@individual');
    Route::post('project/{project}/apply/team', 'Auth\ApplyController@team');
    Route::post('project/{project}/wishlist', 'Auth\ProjectController@addWishlist');
    // Route::post('project/{project}/apply');

    Route::post('inbox', 'InboxController@getAll');


    Route::post('user/{user:tagname}/invite/team', 'InvitationController@teamInvitation');
    Route::post('user/{user:tagname}/invite/project', 'InvitationController@projectInvitation');
    Route::post('user/{user:tagname}/message', 'MessageController@index');
    Route::post('user/{user:tagname}/message/send', 'MessageController@send');

    Route::post('inbox/invitation/team', 'InboxController@teamInvitation');
    Route::post('inbox/invitation/project', 'InboxController@projectInvitation');
    Route::post('inbox/apply/individual', 'InboxController@individualApplicant');
    Route::post('inbox/apply/team', 'InboxController@teamApplicant');

});

Route::group(['middleware' => 'guest:api'], function () {
    Route::post('login', 'Auth\LoginController@login');
    Route::post('register', 'Auth\RegisterController@register');

    Route::post('password/email', 'Auth\ForgotPasswordController@sendResetLinkEmail');
    Route::post('password/reset', 'Auth\ResetPasswordController@reset');

    Route::post('email/verify/{user}', 'Auth\VerificationController@verify')->name('verification.verify');
    Route::post('email/resend', 'Auth\VerificationController@resend');

    Route::post('oauth/{driver}', 'Auth\OAuthController@redirectToProvider');
    Route::get('oauth/{driver}/callback', 'Auth\OAuthController@handleProviderCallback')->name('oauth.callback');
});

Route::group([], function() {
    Route::get('user/{user:tagname}', 'ProfileController@getUser');

    Route::get('projects', 'ProjectController@explore');
    Route::get('projects/search/', 'ProjectController@search');
    Route::get('project/{project}', 'ProjectController@show');
});
