<?php

namespace App\Http\Controllers\Inbox;

use App\Http\Controllers\Controller;
use App\Inbox;
use App\IndividualApplicant;
use App\ProjectBox;
use App\ProjectInvitation;
use App\ProjectTeam;
use App\ProjectTeamMember;
use App\Team;
use App\TeamInvitation;
use App\TeamMember;
use Illuminate\Http\Request;

class InboxStudentController extends Controller
{
    public function acceptTeamInvitation(Request $request)
    {
        $user = $request->user();

        $teamInvitation = TeamInvitation::findOrFail($request->post('team_invitation_id'));

        $message = '';

        if ($user->id === $teamInvitation->to_id) {
            if ($request->post('isAgree')) {
                $team = Team::where('leader_id', $teamInvitation->from_id)->firstOrFail();
                TeamMember::firstOrCreate(
                    [
                        'team_id' => $team->id,
                        'member_id' => $user->id,
                    ],
                    [
                        'expertise' => $user->expertise,
                    ],
                );

                $message = 'You did agree to join the Team';
            } else {
                $message = 'You did not agree to join the Team';
            }

            Inbox::where('team_invitation_id', $teamInvitation->id)->delete();

            $inboxes = Inbox::getInboxes($user);

            return response()->json([
                'message' => $message,
                'inboxes' => $inboxes,
            ]);
        }
    }

    public function acceptProjectInvitation(Request $request)
    {
        $user = $request->user();

        $projectInvitation = ProjectInvitation::findOrFail($request->post('project_invitation_id'));

        if ($user->id === $projectInvitation->to_id) {
            if ($request->post('isAgree')) {
                $projectTeam = ProjectTeam::firstOrCreate([
                    'project_id' => $projectInvitation->project_id,
                ]);

                ProjectTeamMember::firstOrCreate([
                    'project_team_id' => $projectTeam->id,
                    'member_id' => $user->id,
                ], [
                    'expertise' => $user->expertise,
                ], );

                ProjectBox::updateOrCreate([
                    'project_id' => $projectInvitation->project_id,
                    'user_id' => $user->id,
                ], [
                    'status' => 'Waiting to Start',
                ]);

                IndividualApplicant::where([
                    'project_id' => $projectInvitation->project_id,
                    'from_id' => $user->id,
                ])->delete();

                Inbox::where('project_invitation_id', $projectInvitation->id)->delete();

                $inboxes = Inbox::getInboxes($user);

                return response()->json([
                    'message' => 'You did agree to join the Project Invitation',
                    'inboxes' => $inboxes,
                ]);
            } else {
                Inbox::where('project_invitation_id', $projectInvitation->id)->delete();

                $inboxes = Inbox::getInboxes($user);

                return response()->json([
                    'message' => 'You did not agree to join the Project Invitation',
                    'inboxes' => $inboxes,
                ]);
            }
        }
    }
}
