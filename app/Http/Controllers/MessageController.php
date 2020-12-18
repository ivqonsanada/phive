<?php

namespace App\Http\Controllers;

use App\Inbox;
use App\MessageBody;
use App\MessageHeader;
use App\User;
use Illuminate\Http\Request;
use Stevebauman\Purify\Facades\Purify;

class MessageController extends Controller
{
    public function index(Request $request, User $user)
    {
        $user_one_id = $request->user()->id;
        $user_two_id = $user->id;

        $messageHeader = MessageHeader::with('message_bodies.sender:id,tagname,first_name,last_name,photo_url,email')
            ->where([
                ['user_one_id', $user_one_id],
                ['user_two_id', $user_two_id],
            ])->orWhere([
            ['user_one_id', $user_two_id],
            ['user_two_id', $user_one_id],
        ])->first();

        if (is_null($messageHeader)) {
            $messageHeader = new MessageHeader;
            $messageHeader->user_one_id = $user_one_id;
            $messageHeader->user_two_id = $user_two_id;
            $messageHeader->save();

            $messageHeader = [
                'message' => 'oke',
            ];
        }

        return response()->json([
            'messages' => $messageHeader,
            'user' => $user,
        ]);
    }

    public function sendMessage(Request $request, User $user)
    {
        $sender_id = $request->user()->id;
        $recipient_id = $user->id;

        $messageHeader = MessageHeader::with('message_bodies.sender:id,tagname,first_name,last_name,photo_url,email')
            ->where([
                ['user_one_id', $sender_id],
                ['user_two_id', $recipient_id],
            ])->orWhere([
            ['user_one_id', $recipient_id],
            ['user_two_id', $sender_id],
        ])->first();

        $messageBody = MessageBody::firstOrCreate(
            [
                'message_header_id' => $messageHeader->id,
                'sender_id' => $sender_id,
                'recipient_id' => $recipient_id,
                'message' => Purify::clean($request->post('message')),
            ]
        );

        $messages = MessageHeader::with('message_bodies.sender:id,tagname,first_name,last_name,photo_url,email')
            ->where([
                ['user_one_id', $sender_id],
                ['user_two_id', $recipient_id],
            ])->orWhere([
            ['user_one_id', $recipient_id],
            ['user_two_id', $sender_id],
        ])->first();

        if ($sender_id !== $recipient_id) {
            Inbox::where([
                'sender_id' => $sender_id,
                'recipient_id' => $recipient_id,
                'category' => 'Message',
            ])->delete();

            Inbox::firstOrCreate(
                ['message_body_id' => $messageBody->id],
                [
                    'sender_id' => $sender_id,
                    'recipient_id' => $recipient_id,
                    'category' => 'Message',
                ],
            );
        }

        return response()->json([
            'messages' => $messages,
        ]);
    }
}
