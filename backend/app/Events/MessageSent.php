<?php

namespace App\Events;

use App\Models\MessageBody;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast on the recipient's private channel.
 *
 * The transport is configuration, not code: with BROADCAST_CONNECTION=log this is a
 * no-op, and pointing it at Reverb (which replaces the legacy Pusher setup) makes
 * messages live without touching this class.
 *
 * Broadcast *now* rather than queued: a chat message that waits for a worker is not
 * realtime, and with the default database queue it would never arrive unless one
 * happened to be running. The payload is a few fields, so there is nothing to defer.
 */
class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public MessageBody $message) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.'.$this->message->recipient_id)];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'message' => $this->message->message,
            'sender_id' => $this->message->sender_id,
            'created_at' => $this->message->created_at?->toIso8601String(),
        ];
    }
}
