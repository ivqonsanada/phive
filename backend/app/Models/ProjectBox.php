<?php

namespace App\Models;

use App\Enums\ProjectBoxStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row per (project, participant). Drives both the lecturer's and the student's
 * "Project Box" dashboards.
 */
#[Fillable(['project_id', 'user_id', 'status'])]
class ProjectBox extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['status' => ProjectBoxStatus::class];
    }

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
