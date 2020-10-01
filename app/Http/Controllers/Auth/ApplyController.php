<?php

namespace App\Http\Controllers\Auth;

use App\ApplyTeam;
use App\Http\Controllers\Controller;
use App\Inbox;
use App\IndividualApplicant;
use App\Project;
use App\TeamApplicant;
use App\User;
use Illuminate\Http\Request;

class ApplyController extends Controller
{
    public function individual(Request $request, Project $project) {
        $applicant = $request->get('apply');
        $from_id = $request->user()->id;
        $to_id = User::findOrFail($project->user_id)->id;

        $individualApplicant = IndividualApplicant::firstOrCreate(
            [
                'project_id' => $project->id,
                'from_id' => $from_id,
                'to_id' => $to_id,
            ],
            [
                'expertise' => $applicant['expertise'],
                'self_describe' => $applicant['self_describe'],
                'apply_reason' => $applicant['apply_reason']
            ]
        );

        Inbox::firstOrCreate(
            ['individual_applicant_id' => $individualApplicant->id],
            [
                'user_id' => $to_id,
                'category' => 'Individual Applicant'
            ],
        );

        return response()->json([
            'status' => 'success',
            'message' => "Individual Application Submitted"
        ]);
    }

    public function team(Request $request, Project $project) {
        $applicant = $request->get('apply');
        $user_id = $request->user()->id;

        $to = User::findOrFail($project->user_id);

        $individualApplicant = TeamApplicant::firstOrCreate(
            [
                'project_id' => $project->id,
                'from_id' => $user_id,
                'to_id' => $to->id,
            ],
            [
                'self_describe' => $applicant['self_describe'],
                'apply_reason' => $applicant['apply_reason']
            ]
        );

        Inbox::firstOrCreate(
            ['individual_applicant_id' => $individualApplicant->id],
            [
                'user_id' => $user_id,
                'category' => 'Team Applicant'
            ],
        );

        return response()->json([
            'status' => 'success',
            'message' => "Team Application Submitted"
        ]);
    }
}
