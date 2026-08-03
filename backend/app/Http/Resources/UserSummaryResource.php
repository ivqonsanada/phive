<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Support\StoredFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The compact author/member card used wherever a user appears alongside something
 * else — a project, a leaderboard row, a team listing.
 *
 * @mixin User
 */
class UserSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'tagname' => $this->tagname,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'role' => $this->role,
            'photo_url' => StoredFile::url($this->photo_url),
            'expertise' => $this->expertise,
            'finished_project_count' => $this->whenCounted('finishedProjects'),
        ];
    }
}
