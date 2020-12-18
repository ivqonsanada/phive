<?php

namespace App\Http\Controllers;

use App\Inbox;
use App\Project;
use App\ProjectBox;
use App\ProjectInvitation;
use App\ProjectTeam;
use App\ProjectTeamMember;
use App\Team;
use App\TeamInvitation;
use App\TeamMember;
use App\User;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function teamInvitation(Request $request, User $user)
    {
        $sender = $request->user();
        $recipient = $user;

        $team = Team::firstOrCreate(['leader_id' => $sender->id]);

        TeamMember::firstOrCreate(
            [
                'team_id' => $team->id,
                'member_id' => $sender->id
            ],
            [
                'expertise' => $sender->expertise
            ],
        );

        if ( $sender->id !== $recipient->id ) {
            $teamInvitation = TeamInvitation::firstOrCreate(
                [
                    'team_id' => $team->id,
                    'from_id' => $sender->id,
                    'to_id' => $recipient->id
                ],
            );

            Inbox::firstOrCreate(
                ['team_invitation_id' => $teamInvitation->id],
                [
                    'user_id' => $recipient->id,
                    'category' => 'Team Invitation'
                ],
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => "Team Invitation to $recipient->first_name $recipient->last_name delivered"
        ]);
    }

    public function projectInvitation(Request $request, User $user)
    {
        $sender = $request->user();
        $recipient = $user;

        $project = Project::where('user_id', $sender->id)->latest()->first();

        $projectTeam = ProjectTeam::firstOrCreate(
            [
                'project_id' => $project->id,
                'leader_id' => $sender->id
            ]
        );

        ProjectTeamMember::firstOrCreate(
            [
                'project_team_id' => $projectTeam->id,
                'member_id' => $sender->id
            ]
        );

        if ( $sender->id !== $recipient->id ) {
            $projectInvitation = ProjectInvitation::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'from_id' => $sender->id,
                    'to_id' => $recipient->id
                ],
            );

            Inbox::firstOrCreate(
                ['project_invitation_id' => $projectInvitation->id],
                [
                    'user_id' => $recipient->id,
                    'category' => 'Project Invitation'
                ],
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => "Project Invitation to $recipient->first_name $recipient->last_name delivered"
        ]);
    }
}
