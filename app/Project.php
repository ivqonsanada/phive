<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $guard = [
        // 'id',
        // 'user_id'
    ];


    public function user()
    {
        return $this->belongsTo('App\User');
    }

    public function requirements() {
        return $this->hasMany('App\Requirement');
    }

    public function skills() {
        return $this->hasMany('App\Skill');
    }
}
