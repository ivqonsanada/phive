<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('message_headers')->insert([
            'user_one_id' => 1,
            'user_two_id' => 2,
        ]);

        DB::table('message_bodies')->insert([
            'message_header_id' => 1,
            'sender_id' => 2,
            'recipient_id' => 1,
            'message' => 'Good afternoon Rupert Henderson,<br />Hope you see my offer about the latest project which appear on your inbox. You can see the details about the project first before you decide to accept the offer or not.<br />I’m waiting for the good news ahead from you.<br />Best Regards, <strong>Prof. Dr. Alexander Hoffman</strong>',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('message_bodies')->insert([
            'message_header_id' => 1,
            'sender_id' => 1,
            'recipient_id' => 2,
            'message' => 'Good afternoon Prof,<br />I hope we can discuss this project first before we jump into agreement on both sides, I’m here to negotiate the offers.<br />Thank you!',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('inboxes')->insert([
            'message_body_id' => 1,
            'sender_id' => 2,
            'recipient_id' => 1,
            'category' => 'Message',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('inboxes')->insert([
            'message_body_id' => 2,
            'sender_id' => 1,
            'recipient_id' => 2,
            'category' => 'Message',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
