<?php

namespace App\Models;

use App\Enums\Expertise;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['team_applicant_id', 'member_id', 'expertise'])]
class ApplicantTeamMember extends Model
{
    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['expertise' => Expertise::class];
    }

    /** @return BelongsTo<TeamApplicant, $this> */
    public function teamApplicant(): BelongsTo
    {
        return $this->belongsTo(TeamApplicant::class);
    }

    /** @return BelongsTo<User, $this> */
    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
