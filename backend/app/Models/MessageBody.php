<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['message_header_id', 'sender_id', 'recipient_id', 'message'])]
class MessageBody extends Model
{
    use HasUuid;

    /** @return BelongsTo<MessageHeader, $this> */
    public function header(): BelongsTo
    {
        return $this->belongsTo(MessageHeader::class, 'message_header_id');
    }

    /** @return BelongsTo<User, $this> */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /** @return BelongsTo<User, $this> */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
