<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectTeam extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'status' => 'boolean',

            'project_id' => 'integer',
            'leader_id' => 'integer',

    ];

    public function project () {
        return $this->belongsTo('App\Project');
    }

    public function members () {
        return $this->hasMany('App\ProjectTeamMember');
    }
}
