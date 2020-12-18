<?php

namespace App;

use App\Notifications\ResetPassword;
use App\Notifications\VerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject, MustVerifyEmail
{
    use Notifiable;

    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = [
        'id',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',

        'email_verified_at', 'created_at', 'updated_at', 'email', 'photo_url'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'avatar', 'joined_since'
    ];

    /**
     * Get the profile photo URL attribute.
     *
     * @return string
     */
    public function getAvatarAttribute()
    {
        if ($this->photo_url == null) {
            return 'https://www.gravatar.com/avatar/'.md5(strtolower($this->email)).'.jpg?s=200&d=mm';
        } else return '/storage/images/avatar/' . $this->photo_url;
    }

    public function getJoinedSinceAttribute()
    {
        return $this->email_verified_at;
    }

    /**
     * Get the oauth providers.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function oauthProviders()
    {
        return $this->hasMany(OAuthProvider::class);
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPassword($token));
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmail);
    }

    /**
     * @return int
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function projects() {
        return $this->hasMany('App\Project');
    }

    public function student() {
        return $this->hasOne('App\Student');
    }

    public function lecturer() {
        return $this->hasOne('App\Lecturer');
    }

    public function inboxes() {
        return $this->hasMany('App\Inbox');
    }
}
