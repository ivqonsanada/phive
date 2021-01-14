<?php

namespace App\Http\Controllers;

use App\Inbox;
use App\Team;
use App\TeamInvitation;
use App\TeamMember;
use App\User;
use Illuminate\Http\Request;

class PartyController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $leader = Team::with(['members' => function ($q) use ($user) {
            $q->where('team_members.member_id', '!=', $user->id);
        }, 'members.member'])->where('leader_id', $user->id)->first();

        $memberIn = TeamMember::where('member_id', $user->id)->get();
        $memberIns = $memberIn->pluck('team_id')->toArray();
        $member = Team::with('members.member')->whereIn('id', $memberIns)->where('leader_id', '!=', $user->id)->get();

        return response()->json([
            'leader' => $leader,
            'member' => $member,
        ]);
    }

    public function kickPartyMember(Request $request)
    {
        $user = $request->user();

        $team = Team::where('leader_id', $user->id)->firstOrFail();

        TeamMember::where([
            'team_id' => $team->id,
            'member_id' => $request->post('member_id'),
        ])->delete();

        $leader = Team::with(['members' => function ($q) use ($user) {
            $q->where('team_members.member_id', '!=', $user->id);
        }, 'members.member'])->where('leader_id', $user->id)->first();

        return response()->json([

            'message' => $request->post('member_name') . ' has been kicked from party.',
            'leader' => $leader,
        ]);
    }

    public function inviteToParty(Request $request, User $user)
    {
        $sender = $request->user();
        $recipient = $user;

        $team = Team::firstOrCreate(['leader_id' => $sender->id]);

        TeamMember::firstOrCreate(
            [
                'team_id' => $team->id,
                'member_id' => $sender->id,
            ],
            [
                'expertise' => $sender->expertise,
            ],
        );

        if ($sender->id !== $recipient->id) {
            $teamInvitation = TeamInvitation::firstOrCreate(
                [
                    'team_id' => $team->id,
                    'from_id' => $sender->id,
                    'to_id' => $recipient->id,
                ],
            );

            Inbox::firstOrCreate(
                ['team_invitation_id' => $teamInvitation->id],
                [
                    'recipient_id' => $recipient->id,
                    'sender_id' => $sender->id,
                    'category' => 'Team Invitation',
                ],
            );
        }

        return response()->json([
            'message' => "Team Invitation to $recipient->first_name $recipient->last_name delivered",
        ]);
    }
}
