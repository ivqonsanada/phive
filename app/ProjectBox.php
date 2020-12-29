<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ProjectBox extends Model
{
    protected $guarded = [];

    protected $casts = [
        'project_id' => 'integer',
        'user_id' => 'integer',
    ];

    public function project () {
        return $this->belongsTo('App\Project');
    }

    public static function lecturerProjectBoxes ($user) {
        return ProjectBox::with(['project', 'project.individual_applicants.from:id,first_name,last_name,photo_url,tagname,email', 'project.individual_applicants' => function ($q) {
                $q->where('individual_applicants.status', '!=', 'Applying');
        }, 'project.team_applicants.applicant_team_members.member', 'project.team_applicants' => function ($q) {
            $q->where('team_applicants.status', '!=', 'Applying');
    }])->where('user_id', $user->id)->latest()->get();
    }
}
