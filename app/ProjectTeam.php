<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectTeam extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function project () {
        return $this->belongsTo('App\Project');
    }

    public function members () {
        return $this->hasMany('App\ProjectTeamMember');
    }
}
