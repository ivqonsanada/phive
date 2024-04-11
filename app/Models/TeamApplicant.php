<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamApplicant extends Model
{
    use HasFactory;

        protected $guarded = [];

    public $timestamps = false;

    protected $withCount = ["applicant_team_members"];

    protected $casts = [
        'project_id' => 'integer',
        'from_id' => 'integer',
        'to_id' => 'integer',
    ];

    public function from () {
        return $this->belongsTo('App\User');
    }

    public function to () {
        return $this->belongsTo('App\User');
    }

    public function applicant_team_members () {
        return $this->hasMany('App\ApplicantTeamMember');
    }

    public function project () {
        return $this->belongsTo('App\Project');
    }
}
