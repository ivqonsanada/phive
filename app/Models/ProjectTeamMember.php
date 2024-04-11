<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectTeamMember extends Model
{
    use HasFactory;

       protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
            'project_team_id' => 'integer',
            'member_id' => 'integer',

    ];


    public function project_team () {
        return $this->belongsTo('App\ProjectTeam');
    }

    public function member () {
        return $this->belongsTo('App\User');
    }
}
