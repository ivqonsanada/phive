<?php

namespace App\Http\Resources;

use App\Models\ProjectTeam;
use App\Models\ProjectTeamMember;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ProjectTeam
 */
class ProjectTeamResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'leader' => new UserSummaryResource($this->whenLoaded('leader')),
            'members' => $this->whenLoaded(
                'members',
                fn () => $this->members->map(fn (ProjectTeamMember $member) => [
                    'expertise' => $member->expertise,
                    'score' => $member->score,
                    'assessment' => $member->assessment,
                    // `whenLoaded` belongs to JsonResource, not to the model — the
                    // relation is eager-loaded by the controller, so read it directly.
                    'user' => new UserSummaryResource($member->member),
                ]),
            ),
        ];
    }
}
