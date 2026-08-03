<?php

namespace App\Http\Controllers\Api;

use App\Enums\ProjectBoxStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * A public profile. Students show the work they finished; lecturers show the
     * projects they published.
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $user->load(['skills', 'experiences', 'leaderboard']);

        return response()->json([
            'user' => new UserResource($user),
            'projects' => ProjectResource::collection(
                $user->isStudent() ? $this->finishedWork($user) : $this->published($user),
            ),
        ]);
    }

    /**
     * @return Collection<int, Project>
     */
    private function finishedWork(User $user)
    {
        return Project::query()
            ->published()
            ->with('user')
            ->whereHas(
                'projectBoxes',
                fn ($query) => $query
                    ->where('user_id', $user->id)
                    ->where('status', ProjectBoxStatus::Finished),
            )
            ->latest()
            ->get();
    }

    /**
     * @return Collection<int, Project>
     */
    private function published(User $user)
    {
        return Project::query()
            ->published()
            ->with('user')
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }
}
