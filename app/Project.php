<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo('App\User');
    }

    public function project_requirements() {
        return $this->hasMany('App\ProjectRequirement');
    }

    public function project_skills() {
        return $this->hasMany('App\ProjectSkill');
    }

    public function project_team () {
        return $this->hasOne('App\ProjectTeam');
    }
}
