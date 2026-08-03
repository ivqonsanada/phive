<?php

namespace App\Models;

use App\Enums\Expertise;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'expertise', 'points'])]
class Leaderboard extends Model
{
    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expertise' => Expertise::class,
            'points' => 'integer',
        ];
    }

    /** @param Builder<$this> $query */
    public function scopeForExpertise(Builder $query, Expertise $expertise): void
    {
        $query->where('expertise', $expertise)->orderByDesc('points');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
