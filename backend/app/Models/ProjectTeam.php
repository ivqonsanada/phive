<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * The team actually hired onto a project, formed once the lecturer starts it.
 */
#[Fillable(['project_id', 'leader_id'])]
class ProjectTeam extends Model
{
    public $timestamps = false;

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** @return BelongsTo<User, $this> */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    /** @return HasMany<ProjectTeamMember, $this> */
    public function members(): HasMany
    {
        return $this->hasMany(ProjectTeamMember::class);
    }
}
