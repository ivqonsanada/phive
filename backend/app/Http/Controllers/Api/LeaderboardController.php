<?php

namespace App\Http\Controllers\Api;

use App\Enums\Expertise;
use App\Http\Controllers\Controller;
use App\Http\Resources\LeaderboardEntryResource;
use App\Models\Leaderboard;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    /**
     * One board per expertise, keyed by the project column name so the frontend can
     * map boards to tabs without translating display strings.
     */
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->integer('limit', 10);

        $boards = collect(Expertise::cases())->mapWithKeys(fn (Expertise $expertise) => [
            $expertise->projectColumn() => LeaderboardEntryResource::collection(
                $this->board($expertise, $limit),
            ),
        ]);

        return response()->json(['boards' => $boards]);
    }

    /**
     * @return Collection<int, Leaderboard>
     */
    private function board(Expertise $expertise, int $limit)
    {
        return Leaderboard::query()
            ->forExpertise($expertise)
            // Counted in the eager load, not per row, so the board stays two queries.
            ->with(['user' => fn ($query) => $query->withCount('finishedProjects')])
            ->take(min($limit, 50))
            ->get();
    }
}
