<?php

namespace App\Models;

use App\Enums\InvitationStatus;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['team_id', 'from_id', 'to_id', 'status'])]
class TeamInvitation extends Model
{
    use HasUuid;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['status' => InvitationStatus::class];
    }

    /** @return BelongsTo<Team, $this> */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /** @return BelongsTo<User, $this> */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_id');
    }

    /** @return BelongsTo<User, $this> */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_id');
    }
}
