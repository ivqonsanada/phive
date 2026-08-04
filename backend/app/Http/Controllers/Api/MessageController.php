<?php

namespace App\Http\Controllers\Api;

use App\Enums\InboxCategory;
use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserSummaryResource;
use App\Models\Inbox;
use App\Models\MessageBody;
use App\Models\MessageHeader;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Every conversation this user is part of, most recently active first.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = MessageHeader::query()
            ->where(fn ($query) => $query->forUser($user->id))
            // `latest()` alone ties when two messages share a timestamp, and the tie
            // breaks differently per database — so the preview could show an older
            // message. Falling back to the id makes "latest" mean one thing.
            ->with([
                'userOne',
                'userTwo',
                'messages' => fn ($q) => $q->latest()->latest('id')->limit(1),
            ])
            ->get()
            ->map(function (MessageHeader $header) use ($user) {
                $other = $header->user_one_id === $user->id ? $header->userTwo : $header->userOne;
                $latest = $header->messages->first();

                return [
                    'with' => new UserSummaryResource($other),
                    'last_message' => $latest?->message,
                    'last_message_at' => $latest?->created_at,
                ];
            })
            ->sortByDesc('last_message_at')
            ->values();

        return response()->json(['conversations' => $conversations]);
    }

    /**
     * The thread with one person. Reading it clears their message notifications.
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $viewer = $request->user();

        abort_if($user->id === $viewer->id, 422, 'You cannot message yourself.');

        $header = MessageHeader::between($viewer->id, $user->id);

        $messages = $header->messages()->with('sender')->oldest()->get();

        Inbox::where([
            'recipient_id' => $viewer->id,
            'sender_id' => $user->id,
            'category' => InboxCategory::Message,
        ])->update(['is_read' => true]);

        return response()->json([
            'with' => new UserSummaryResource($user),
            'messages' => $messages->map(fn (MessageBody $message) => [
                'uuid' => $message->uuid,
                'message' => $message->message,
                'is_mine' => $message->sender_id === $viewer->id,
                'created_at' => $message->created_at,
            ]),
        ]);
    }

    public function store(Request $request, User $user): JsonResponse
    {
        $sender = $request->user();

        abort_if($user->id === $sender->id, 422, 'You cannot message yourself.');

        $data = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $body = DB::transaction(function () use ($sender, $user, $data) {
            $header = MessageHeader::between($sender->id, $user->id);

            $body = MessageBody::create([
                'message_header_id' => $header->id,
                'sender_id' => $sender->id,
                'recipient_id' => $user->id,
                // Stored as plain text. The legacy app ran HTML through Purify; not
                // accepting markup at all removes the class of bug instead.
                'message' => strip_tags($data['message']),
            ]);

            // One unread "message" notification per conversation, not per message.
            Inbox::where([
                'recipient_id' => $user->id,
                'sender_id' => $sender->id,
                'category' => InboxCategory::Message,
            ])->delete();

            Inbox::create([
                'recipient_id' => $user->id,
                'sender_id' => $sender->id,
                'message_body_id' => $body->id,
                'category' => InboxCategory::Message,
            ]);

            return $body;
        });

        broadcast(new MessageSent($body))->toOthers();

        return response()->json([
            'message' => [
                'uuid' => $body->uuid,
                'message' => $body->message,
                'is_mine' => true,
                'created_at' => $body->created_at,
            ],
        ], 201);
    }
}
