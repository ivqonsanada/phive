<?php

namespace App\Http\Controllers\Api;

use App\Enums\ProjectBoxStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\ProjectBox;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectBoxController extends Controller
{
    /**
     * Everything the signed-in user is involved in, whichever side they are on.
     */
    public function index(Request $request): JsonResponse
    {
        $boxes = ProjectBox::query()
            ->where('user_id', $request->user()->id)
            ->with(['project.user'])
            ->latest()
            ->get();

        return response()->json([
            'boxes' => $boxes->map(fn (ProjectBox $box) => [
                'uuid' => $box->uuid,
                'status' => $box->status,
                'can_confirm' => $box->status === ProjectBoxStatus::Accepted,
                'updated_at' => $box->updated_at,
                'project' => new ProjectResource($box->project),
            ]),
        ]);
    }

    /**
     * A shortlisted student either commits to the project or bails out.
     *
     * Committing fixes their other pending applications: you cannot hold a seat on
     * two projects at once.
     */
    public function confirm(Request $request, ProjectBox $projectBox): JsonResponse
    {
        abort_unless($projectBox->user_id === $request->user()->id, 403);

        abort_unless(
            $projectBox->status === ProjectBoxStatus::Accepted,
            409,
            'There is nothing to confirm on this project yet.',
        );

        $accept = $request->boolean('accept');

        $projectBox->update([
            'status' => $accept ? ProjectBoxStatus::WaitingToStart : ProjectBoxStatus::BailOut,
        ]);

        return response()->json([
            'message' => $accept
                ? 'You are on the team, waiting for the lecturer to start.'
                : 'You withdrew from this project.',
        ]);
    }
}
