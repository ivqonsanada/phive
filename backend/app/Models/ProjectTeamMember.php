<?php

namespace App\Models;

use App\Enums\Expertise;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['project_team_id', 'member_id', 'expertise', 'assessment', 'score'])]
class ProjectTeamMember extends Model
{
    use HasUuid;

    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['expertise' => Expertise::class];
    }

    /** @return BelongsTo<ProjectTeam, $this> */
    public function projectTeam(): BelongsTo
    {
        return $this->belongsTo(ProjectTeam::class);
    }

    /** @return BelongsTo<User, $this> */
    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
