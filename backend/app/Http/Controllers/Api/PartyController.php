<?php

namespace App\Http\Controllers\Api;

use App\Enums\InboxCategory;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserSummaryResource;
use App\Models\Inbox;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * A "party" is the standing group a student recruits before applying to projects
 * together. Each student leads at most one, and may be a member of others.
 */
class PartyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $led = Team::with('members.member')->firstWhere('leader_id', $user->id);

        $memberOf = Team::with(['leader', 'members.member'])
            ->where('leader_id', '!=', $user->id)
            ->whereHas('members', fn ($query) => $query->where('member_id', $user->id))
            ->get();

        return response()->json([
            'led' => $led ? $this->present($led) : null,
            'member_of' => $memberOf->map(fn (Team $team) => $this->present($team)),
        ]);
    }

    /**
     * Invite someone to the party, creating it on first use.
     */
    public function invite(Request $request, User $user): JsonResponse
    {
        $sender = $request->user();

        abort_unless($sender->isStudent(), 403, 'Only students form parties.');
        abort_if($sender->id === $user->id, 422, 'You are already in your own party.');
        abort_unless($user->isStudent(), 422, 'Only students can join a party.');

        $team = DB::transaction(function () use ($sender, $user) {
            $team = Team::firstOrCreate(['leader_id' => $sender->id]);

            // The leader is a member of their own party.
            TeamMember::firstOrCreate(
                ['team_id' => $team->id, 'member_id' => $sender->id],
                ['expertise' => $sender->expertise],
            );

            abort_if(
                TeamMember::where(['team_id' => $team->id, 'member_id' => $user->id])->exists(),
                422,
                'They are already in your party.',
            );

            $invitation = TeamInvitation::firstOrCreate([
                'team_id' => $team->id,
                'from_id' => $sender->id,
                'to_id' => $user->id,
            ]);

            Inbox::firstOrCreate(
                ['team_invitation_id' => $invitation->id],
                [
                    'recipient_id' => $user->id,
                    'sender_id' => $sender->id,
                    'category' => InboxCategory::TeamInvitation,
                ],
            );

            return $team;
        });

        return response()->json([
            'message' => "Invitation sent to {$user->name}.",
            'party' => $this->present($team->fresh()->load('members.member')),
        ]);
    }

    public function kick(Request $request, User $user): JsonResponse
    {
        $leader = $request->user();

        $team = Team::where('leader_id', $leader->id)->firstOrFail();

        abort_if($user->id === $leader->id, 422, 'Disband the party instead of kicking yourself.');

        TeamMember::where(['team_id' => $team->id, 'member_id' => $user->id])->delete();

        return response()->json([
            'message' => "{$user->name} has been removed from your party.",
            'party' => $this->present($team->fresh()->load('members.member')),
        ]);
    }

    /**
     * Leave a party someone else leads.
     */
    public function leave(Request $request, Team $team): JsonResponse
    {
        $user = $request->user();

        abort_if($team->leader_id === $user->id, 422, 'A leader cannot leave their own party.');

        TeamMember::where(['team_id' => $team->id, 'member_id' => $user->id])->delete();

        return response()->json(['message' => 'You left the party.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Team $team): array
    {
        return [
            'id' => $team->id,
            'leader' => new UserSummaryResource($team->leader),
            'members' => $team->members->map(fn (TeamMember $member) => [
                'expertise' => $member->expertise,
                'is_leader' => $member->member_id === $team->leader_id,
                'user' => new UserSummaryResource($member->member),
            ]),
        ];
    }
}
