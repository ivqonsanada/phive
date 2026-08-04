<?php

namespace App\Http\Controllers\Api;

use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Toggle a project on the signed-in student's wishlist.
     *
     * Rows are kept and flipped rather than deleted, so the unique
     * (user_id, project_id) constraint never has to be worked around.
     */
    public function toggle(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        // A draft is invisible everywhere else — the detail endpoint 404s on one — so
        // it must not be starrable either. Otherwise this route quietly confirms that
        // an unpublished project exists.
        abort_if($project->status === ProjectStatus::Draft, 404);

        abort_unless($user->isStudent(), 403, 'Only students keep a wishlist.');

        $wishlist = Wishlist::firstOrNew([
            'user_id' => $user->id,
            'project_id' => $project->id,
        ]);

        $wishlist->status = ! $wishlist->exists || ! $wishlist->status;
        $wishlist->save();

        return response()->json([
            'is_wished' => $wishlist->status,
        ]);
    }

    /**
     * Everything the signed-in student has starred.
     */
    public function index(Request $request): JsonResponse
    {
        $projects = Project::query()
            ->published()
            ->with('user')
            ->whereHas(
                'wishlists',
                fn ($query) => $query->where('user_id', $request->user()->id)->where('status', true),
            )
            ->latest()
            ->get();

        return response()->json([
            'projects' => ProjectResource::collection($projects),
        ]);
    }
}
