<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Inbox extends Model
{
    protected $guarded = [];

    public function individual_applicant()
    {
        return $this->belongsTo('App\IndividualApplicant');
    }

    public function team_applicant()
    {
        return $this->belongsTo('App\TeamApplicant');
    }

    public function team_invitation()
    {
        return $this->belongsTo('App\TeamInvitation');
    }

    public function project_invitation()
    {
        return $this->belongsTo('App\ProjectInvitation');
    }

    public function message_body ()
    {
        return $this->belongsTo('App\MessageBody');
    }

    public function user()
    {
        return $this->belongsTo('App\User');
    }
}
