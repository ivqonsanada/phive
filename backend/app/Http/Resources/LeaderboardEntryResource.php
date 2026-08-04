<?php

namespace App\Http\Resources;

use App\Models\Leaderboard;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Leaderboard
 */
class LeaderboardEntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'expertise' => $this->expertise,
            'points' => $this->points,
            'user' => new UserSummaryResource($this->whenLoaded('user')),
        ];
    }
}
