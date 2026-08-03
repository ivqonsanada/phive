<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A conversation between exactly two users. `user_one_id` is always the lower id so the
 * pair has a single canonical row.
 */
#[Fillable(['user_one_id', 'user_two_id'])]
class MessageHeader extends Model
{
    public $timestamps = false;

    /**
     * Find or start the conversation between two users, normalising the id order.
     */
    public static function between(int $userId, int $otherUserId): self
    {
        return static::firstOrCreate([
            'user_one_id' => min($userId, $otherUserId),
            'user_two_id' => max($userId, $otherUserId),
        ]);
    }

    /** @param Builder<$this> $query */
    public function scopeForUser(Builder $query, int $userId): void
    {
        $query->where('user_one_id', $userId)->orWhere('user_two_id', $userId);
    }

    /** @return BelongsTo<User, $this> */
    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    /** @return BelongsTo<User, $this> */
    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    /** @return HasMany<MessageBody, $this> */
    public function messages(): HasMany
    {
        return $this->hasMany(MessageBody::class);
    }
}
