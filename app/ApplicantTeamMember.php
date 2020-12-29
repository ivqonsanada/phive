<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ApplicantTeamMember extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'team_applicant_id' => 'integer',
        'member_id' => 'integer',
    ];

    public function team_applicant () {
        return $this->belongsTo('App\TeamApplicant');
    }

    public function member () {
        return $this->belongsTo('App\User');
    }
}
