<?php

namespace App\Http\Controllers\Api;

use App\Enums\InboxCategory;
use App\Enums\InvitationStatus;
use App\Enums\ProjectBoxStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserSummaryResource;
use App\Models\Inbox;
use App\Models\ProjectBox;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InboxController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Inbox::query()
            ->where('recipient_id', $request->user()->id)
            ->with([
                'sender',
                'teamInvitation.team.leader',
                'projectInvitation.project',
                'messageBody',
            ])
            ->latest()
            ->get();

        return response()->json([
            'unread_count' => $items->where('is_read', false)->count(),
            'items' => $items->map(fn (Inbox $item) => $this->present($item)),
        ]);
    }

    public function markRead(Request $request, Inbox $inbox): JsonResponse
    {
        $this->assertOwnership($request, $inbox);

        $inbox->update(['is_read' => true]);

        return response()->json(['message' => 'Marked as read.']);
    }

    /**
     * Accept or decline. Both invitation kinds go through here so the inbox row and
     * the invitation itself can never drift apart.
     */
    public function respond(Request $request, Inbox $inbox): JsonResponse
    {
        $this->assertOwnership($request, $inbox);

        $accepted = $request->boolean('accept');
        $status = $accepted ? InvitationStatus::Accepted : InvitationStatus::Rejected;

        DB::transaction(function () use ($inbox, $accepted, $status, $request) {
            match ($inbox->category) {
                InboxCategory::TeamInvitation => $this->respondToTeamInvitation(
                    $inbox,
                    $accepted,
                    $status,
                    $request,
                ),
                InboxCategory::ProjectInvitation => $this->respondToProjectInvitation(
                    $inbox,
                    $accepted,
                    $status,
                ),
                default => abort(422, 'This message cannot be responded to.'),
            };

            $inbox->update(['is_read' => true]);
        });

        return response()->json([
            'message' => $accepted ? 'Invitation accepted.' : 'Invitation declined.',
        ]);
    }

    private function respondToTeamInvitation(
        Inbox $inbox,
        bool $accepted,
        InvitationStatus $status,
        Request $request,
    ): void {
        $invitation = $inbox->teamInvitation;

        abort_unless($invitation, 422, 'That invitation no longer exists.');

        $invitation->update(['status' => $status]);

        if ($accepted) {
            TeamMember::firstOrCreate(
                ['team_id' => $invitation->team_id, 'member_id' => $request->user()->id],
                ['expertise' => $request->user()->expertise],
            );
        }
    }

    /**
     * A direct invitation from the lecturer skips the application queue: accepting it
     * is itself the confirmation, so the student lands straight on "Waiting to Start".
     */
    private function respondToProjectInvitation(
        Inbox $inbox,
        bool $accepted,
        InvitationStatus $status,
    ): void {
        $invitation = $inbox->projectInvitation;

        abort_unless($invitation, 422, 'That invitation no longer exists.');

        $invitation->update(['status' => $status]);

        if ($accepted) {
            ProjectBox::updateOrCreate(
                ['project_id' => $invitation->project_id, 'user_id' => $invitation->to_id],
                ['status' => ProjectBoxStatus::WaitingToStart],
            );
        }
    }

    private function assertOwnership(Request $request, Inbox $inbox): void
    {
        abort_unless($inbox->recipient_id === $request->user()->id, 403);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Inbox $item): array
    {
        return [
            'id' => $item->id,
            'category' => $item->category,
            'is_read' => $item->is_read,
            'created_at' => $item->created_at,
            'sender' => new UserSummaryResource($item->sender),
            'team' => $item->teamInvitation?->team ? [
                'id' => $item->teamInvitation->team->id,
                'leader' => new UserSummaryResource($item->teamInvitation->team->leader),
                'status' => $item->teamInvitation->status,
            ] : null,
            'project' => $item->projectInvitation?->project ? [
                'title' => $item->projectInvitation->project->title,
                'project_url' => $item->projectInvitation->project->project_url,
                'status' => $item->projectInvitation->status,
            ] : null,
            'message' => $item->messageBody?->message,
        ];
    }
}
