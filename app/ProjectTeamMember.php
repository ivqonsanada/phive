<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectTeamMember extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function project_team () {
        return $this->belongsTo('App\ProjectTeam');
    }

    public function member () {
        return $this->belongsTo('App\User');
    }
}
