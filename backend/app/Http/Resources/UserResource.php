<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tagname' => $this->tagname,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'role' => $this->role,
            'email' => $this->email,
            'email_verified' => $this->hasVerifiedEmail(),
            'identity_number' => $this->identity_number,
            'photo_url' => $this->photo_url,
            'expertise' => $this->expertise,
            'university' => $this->university,
            'faculty' => $this->faculty,
            'major' => $this->major,
            'location' => $this->location,
            'biography' => $this->biography,
            'is_open_hired' => $this->is_open_hired,
            'cv_url' => $this->cv_url,
            'links' => [
                'behance' => $this->behance,
                'github' => $this->github,
                'linkedin' => $this->linkedin,
                'dribbble' => $this->dribbble,
                'website' => $this->website,
            ],
            'skills' => $this->whenLoaded('skills', fn () => $this->skills->pluck('name')),
            'experiences' => $this->whenLoaded('experiences'),
            'leaderboard' => $this->whenLoaded('leaderboard'),
            'unread_inbox_count' => $this->whenCounted('unread_inbox'),
            'created_at' => $this->created_at,
        ];
    }
}
