<?php

namespace App\Http\Controllers\Api;

use App\Enums\Expertise;
use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\LeaderboardEntryResource;
use App\Http\Resources\ProjectResource;
use App\Models\Leaderboard;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'stats' => $this->projectCounts(),
            'top_boards' => $this->topPerExpertise(),
            'latest_projects' => ProjectResource::collection(
                Project::query()->hiring()->with('user')->latest()->take(6)->get(),
            ),
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function projectCounts(): array
    {
        $counts = Project::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'hiring' => (int) $counts->get(ProjectStatus::Hiring->value, 0),
            'ongoing' => (int) $counts->get(ProjectStatus::Ongoing->value, 0),
            'finished' => (int) $counts->get(ProjectStatus::Finished->value, 0),
        ];
    }

    /**
     * The single highest scorer in each expertise, keyed by project column name.
     *
     * @return array<string, LeaderboardEntryResource|null>
     */
    private function topPerExpertise(): array
    {
        return collect(Expertise::cases())
            ->mapWithKeys(function (Expertise $expertise) {
                $top = Leaderboard::query()
                    ->forExpertise($expertise)
                    ->with(['user' => fn ($query) => $query->withCount('finishedProjects')])
                    ->first();

                return [
                    $expertise->projectColumn() => $top ? new LeaderboardEntryResource($top) : null,
                ];
            })
            ->all();
    }
}
