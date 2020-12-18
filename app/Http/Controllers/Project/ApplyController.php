<?php

namespace App\Http\Controllers\Project;

use App\ApplicantTeamMember;
use App\Http\Controllers\Controller;
use App\IndividualApplicant;
use App\Project;
use App\ProjectBox;
use App\ProjectTeam;
use App\ProjectTeamMember;
use App\TeamApplicant;
use App\User;
use Illuminate\Http\Request;

class ApplyController extends Controller
{
    public function applyAsIndividual(Request $request, Project $project)
    {
        $applicant = $request->get('apply');
        $sender_id = $request->user()->id;
        $recipient_id = User::findOrFail($project->user_id)->id;

        if ($project->is_open_hiring) {
            $projectTeam = ProjectTeam::firstOrCreate(
                [
                    'project_id' => $project->id,
                ]
            );

            $isAlreadyInTeamMembers = ProjectTeamMember::where(
                [
                    'project_team_id' => $projectTeam->id,
                    'member_id' => $sender_id,
                ]
            )->first();

            if ($isAlreadyInTeamMembers) {
                return response()->json([
                    'message' => "You already joined the project team members",
                ], 400);
            }

            IndividualApplicant::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'from_id' => $sender_id,
                    'to_id' => $recipient_id,
                ],
                [
                    'expertise' => $applicant['expertise'],
                    'self_describe' => $applicant['self_describe'],
                    'apply_reason' => $applicant['apply_reason'],
                ]
            );

            ProjectBox::firstOrCreate(
                [
                    'user_id' => $sender_id,
                    'project_id' => $project->id,
                    'status' => 'Waiting',
                ]
            );

            return response()->json([
                'message' => "Individual Application Submitted",
            ]);
        } else {
            return response()->json([
                'message' => 'Project hiring is closed',
            ], 400);
        }
    }

    public function applyAsTeam(Request $request, Project $project)
    {
        $user_id = $request->user()->id;

        $to = User::findOrFail($project->user_id);

        $teamApplicant = TeamApplicant::firstOrCreate(
            [
                'project_id' => $project->id,
                'from_id' => $user_id,
                'to_id' => $to->id,
            ],
            [
                'self_describe' => $request->post('self_describe'),
                'apply_reason' => $request->post('apply_reason'),
            ]
        );

        $team = $request->post('team');
        $applicantTeamMembers = [];

        for ($i = 0; $i < count($team); $i++) {
            $applicantTeamMembers[] = [
                'team_applicant_id' => $teamApplicant->id,
                'member_id' => $team[$i]['member_id'],
                'expertise' => $team[$i]['expertise'],
            ];
        }

        ApplicantTeamMember::where('team_applicant_id', $teamApplicant->id)->delete();
        ApplicantTeamMember::insert($applicantTeamMembers);

        ProjectBox::firstOrCreate(
            [
                'user_id' => $user_id,
                'project_id' => $project->id,
                'status' => 'Waiting',
            ]
        );

        return response()->json([
            'message' => "Team Application submitted",
        ]);
    }
}
