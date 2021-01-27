<?php

namespace App;

use App\Notifications\ResetPassword;
use App\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
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

    protected $withCount = ['finished_project'];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',

        'email_verified_at', 'created_at', 'updated_at', 'email', 'photo_url',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_open_hired' => 'boolean',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'avatar', 'joined_since', 'full_name', 'cv'
    ];

    // protected $withCount = ['finishedProject'];

    /**
     * Get the profile photo URL attribute.
     *
     * @return string
     */
    public function getAvatarAttribute()
    {
        if ($this->photo_url === null) {
            // return 'https://www.gravatar.com/avatar/'.md5(strtolower($this->email)).'.jpg?s=200&d=mm';
            return 'https://i.pravatar.cc/150?u=' . $this->id;

        } else {
            return '/storage/images/avatar/' . $this->photo_url;
        }

    }

    public function getCvAttribute()
    {
        if ($this->cv_url === null) return null;

        return '/storage/images/cv/' . $this->cv_url;
    }

    public function getJoinedSinceAttribute()
    {
        return $this->email_verified_at;
    }

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
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

    public function ownsProject(Project $project)
    {
        return auth()->id() === $project->user_id;
    }

    public function project_boxes()
    {
        return $this->hasMany('App\ProjectBox');
    }

    public function projects()
    {
        return $this->hasMany('App\Project');
    }

    public function student()
    {
        return $this->hasOne('App\Student');
    }

    public function lecturer()
    {
        return $this->hasOne('App\Lecturer');
    }

    public function inboxes()
    {
        return $this->hasMany('App\Inbox');
    }

    public function skills()
    {
        return $this->hasMany('App\UserSkill', 'user_id');
    }

    public function experiences()
    {
        return $this->hasMany('App\Experience', 'user_id');
    }

    public function finished_project()
    {
        return $this->hasMany('App\ProjectBox')->where('status', 'Finished');
    }

    public function leaderboards()
    {
        return $this->hasMany('App\Leaderboard');
    }

    public function new_notifications()
    {
        return $this->hasMany('App\Inbox', 'recipient_id')->where('is_read', false);
    }
}
