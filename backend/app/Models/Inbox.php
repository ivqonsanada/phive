<?php

namespace App\Models;

use App\Enums\InboxCategory;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'recipient_id', 'sender_id', 'team_invitation_id', 'project_invitation_id',
    'message_body_id', 'category', 'is_read',
])]
class Inbox extends Model
{
    use HasUuid;

    protected $table = 'inboxes';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => InboxCategory::class,
            'is_read' => 'boolean',
        ];
    }

    /** @param Builder<$this> $query */
    public function scopeUnread(Builder $query): void
    {
        $query->where('is_read', false);
    }

    /** @return BelongsTo<User, $this> */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /** @return BelongsTo<User, $this> */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /** @return BelongsTo<TeamInvitation, $this> */
    public function teamInvitation(): BelongsTo
    {
        return $this->belongsTo(TeamInvitation::class);
    }

    /** @return BelongsTo<ProjectInvitation, $this> */
    public function projectInvitation(): BelongsTo
    {
        return $this->belongsTo(ProjectInvitation::class);
    }

    /** @return BelongsTo<MessageBody, $this> */
    public function messageBody(): BelongsTo
    {
        return $this->belongsTo(MessageBody::class);
    }
}
