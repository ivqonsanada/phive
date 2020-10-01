<?php

namespace App\Http\Controllers;

use App\Inbox;
use App\ProjectBox;
use App\ProjectInvitation;
use App\ProjectTeam;
use App\ProjectTeamMember;
use App\Team;
use App\TeamInvitation;
use App\TeamMember;
use Illuminate\Http\Request;

class InboxController extends Controller
{
    public function getAll(Request $request)
    {
        $inbox = Inbox::where('user_id', $request->user()->id)->with(['individual_applicant.from', 'individual_applicant.project', 'team_applicant.members', 'message_body.sender:id,photo_url,tagname,first_name,last_name', 'team_invitation.from', 'project_invitation.project', 'project_invitation.from'])->latest()->get();

        return response()->json($inbox);
    }

    public function teamInvitation(Request $request)
    {
        $user = $request->user();
        $teamInvitation_id = $request->post('team_invitation_id');
        $teamInvitation = TeamInvitation::findOrFail($teamInvitation_id);

        if ( $user->id === $teamInvitation->to_id ) {
            $team = Team::where('leader_id', $teamInvitation->from_id)->firstOrFail();
            TeamMember::firstOrCreate(
                [
                    'team_id' => $team->id,
                    'member_id' => $user->id
                ],
                [
                    'expertise' => $user->expertise
                ],
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => 'You did agree to join the Team Invitation'
        ]);
    }

    public function projectInvitation(Request $request)
    {
        $user = $request->user();
        $projectInvitation_id = $request->post('project_invitation_id');
        $projectInvitation = ProjectInvitation::findOrFail($projectInvitation_id);

        if ( $user->id === $projectInvitation->to_id ) {
            $team = ProjectTeam::where('leader_id', $projectInvitation->from_id)->firstOrFail();
            ProjectTeamMember::firstOrCreate(
                [
                    'project_team_id' => $team->id,
                    'member_id' => $user->id
                ],
                [
                    'expertise' => $user->expertise
                ],
            );

            ProjectBox::firstOrCreate(
                [
                    'project_id' => $team->project_id,
                    'user_id' => $user->id
                ]
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => 'You did agree to join the Project Invitation'
        ]);
    }
}
