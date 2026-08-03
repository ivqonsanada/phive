<?php

namespace App\Http\Controllers\Api;

use App\Enums\InboxCategory;
use App\Http\Controllers\Controller;
use App\Models\Inbox;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\ProjectTeam;
use App\Models\ProjectTeamMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * A lecturer can pull a student onto a project directly instead of waiting for them
 * to apply. The invitation lands in the student's inbox.
 */
class ProjectInvitationController extends Controller
{
    public function store(Request $request, Project $project, User $user): JsonResponse
    {
        $this->authorize('update', $project);

        $lecturer = $request->user();

        abort_if($user->id === $lecturer->id, 422, 'You cannot invite yourself.');
        abort_unless($user->isStudent(), 422, 'Only students can be invited to a project.');

        $team = ProjectTeam::firstOrCreate(['project_id' => $project->id]);

        abort_if(
            ProjectTeamMember::where(['project_team_id' => $team->id, 'member_id' => $user->id])->exists(),
            422,
            'They are already on this project team.',
        );

        DB::transaction(function () use ($project, $lecturer, $user) {
            $invitation = ProjectInvitation::firstOrCreate([
                'project_id' => $project->id,
                'from_id' => $lecturer->id,
                'to_id' => $user->id,
            ]);

            Inbox::firstOrCreate(
                ['project_invitation_id' => $invitation->id],
                [
                    'recipient_id' => $user->id,
                    'sender_id' => $lecturer->id,
                    'category' => InboxCategory::ProjectInvitation,
                ],
            );
        });

        return response()->json(['message' => "Invitation sent to {$user->name}."]);
    }
}
