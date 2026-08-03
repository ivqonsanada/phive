<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['project_id', 'from_id', 'to_id', 'status', 'self_describe', 'apply_reason'])]
class TeamApplicant extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['status' => ApplicationStatus::class];
    }

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** The team leader who applied. @return BelongsTo<User, $this> */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_id');
    }

    /** @return BelongsTo<User, $this> */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_id');
    }

    /** @return HasMany<ApplicantTeamMember, $this> */
    public function members(): HasMany
    {
        return $this->hasMany(ApplicantTeamMember::class);
    }
}
