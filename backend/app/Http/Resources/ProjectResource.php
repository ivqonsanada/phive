<?php

namespace App\Http\Resources;

use App\Models\Project;
use App\Support\StoredFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serves both the explore grid and the detail page. Anything expensive is behind
 * `whenLoaded`, so the list query stays cheap.
 *
 * @mixin Project
 */
class ProjectResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'project_url' => $this->project_url,
            'status' => $this->status,
            'thumbnail' => StoredFile::url($this->thumbnail),

            'applicant_type' => $this->applicant_type,
            'max_person' => $this->max_person,
            'level_applicant' => $this->level_applicant,

            'looking_for' => array_values(array_filter([
                $this->ui_ux_designer ? 'UI/UX Designer' : null,
                $this->front_end_engineer ? 'Frontend Engineer' : null,
                $this->back_end_engineer ? 'Backend Engineer' : null,
                $this->data_expert ? 'Data Expert' : null,
            ])),

            'reward' => [
                'certificate' => $this->certificate,
                'salary' => $this->salary,
                'currency' => $this->currency,
                'amount' => $this->salary_amount,
                'payment_type' => $this->payment_type,
            ],

            'is_open_hiring' => $this->is_open_hiring,
            // Only selected when the request carried a token; omitted for guests.
            'is_wished' => $this->whenHas('is_wished', fn () => (bool) $this->is_wished),

            'start_time' => $this->start_time,
            'finish_time' => $this->finish_time,
            'created_at' => $this->created_at,

            'user' => new UserSummaryResource($this->whenLoaded('user')),
            'skills' => $this->whenLoaded('skills', fn () => $this->skills->pluck('name')),
            'requirements' => $this->whenLoaded(
                'requirements',
                fn () => $this->requirements->pluck('requirement'),
            ),
            'team' => new ProjectTeamResource($this->whenLoaded('projectTeam')),
            'review' => $this->whenLoaded('review'),
        ];
    }
}
