<?php

namespace Tests\Feature;

use App\Enums\InboxCategory;
use App\Events\MessageSent;
use App\Models\Inbox;
use App\Models\MessageBody;
use App\Models\MessageHeader;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MessagingTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_user_can_send_a_message(): void
    {
        Event::fake([MessageSent::class]);

        $sender = User::factory()->student()->create();
        $recipient = User::factory()->student()->create();

        $this->withToken($sender->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$recipient->tagname}", ['message' => 'Want to team up?'])
            ->assertCreated()
            ->assertJsonPath('message.message', 'Want to team up?')
            ->assertJsonPath('message.is_mine', true);

        $this->assertDatabaseHas('message_bodies', [
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'message' => 'Want to team up?',
        ]);

        Event::assertDispatched(MessageSent::class);
    }

    #[Test]
    public function the_conversation_row_is_shared_regardless_of_who_starts_it(): void
    {
        $alice = User::factory()->student()->create();
        $bob = User::factory()->student()->create();

        $this->withToken($alice->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$bob->tagname}", ['message' => 'Hi Bob']);

        $this->forgetAuthState()->withToken($bob->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$alice->tagname}", ['message' => 'Hi Alice']);

        // One header for the pair, not one per direction.
        $this->assertDatabaseCount('message_headers', 1);
        $this->assertDatabaseCount('message_bodies', 2);
    }

    #[Test]
    public function a_thread_reads_oldest_first_and_marks_who_said_what(): void
    {
        $alice = User::factory()->student()->create();
        $bob = User::factory()->student()->create();
        $aliceToken = $alice->createToken('t')->plainTextToken;

        $this->withToken($aliceToken)->postJson("/api/messages/{$bob->tagname}", ['message' => 'First']);
        $this->forgetAuthState()->withToken($bob->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$alice->tagname}", ['message' => 'Second']);

        $response = $this->forgetAuthState()->withToken($aliceToken)
            ->getJson("/api/messages/{$bob->tagname}")
            ->assertOk()
            ->assertJsonPath('with.tagname', $bob->tagname);

        $messages = $response->json('messages');

        $this->assertSame('First', $messages[0]['message']);
        $this->assertTrue($messages[0]['is_mine']);
        $this->assertSame('Second', $messages[1]['message']);
        $this->assertFalse($messages[1]['is_mine']);
    }

    #[Test]
    public function html_is_stripped_from_a_message(): void
    {
        $sender = User::factory()->student()->create();
        $recipient = User::factory()->student()->create();

        $this->withToken($sender->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$recipient->tagname}", [
                'message' => 'hello <script>alert(1)</script> there',
            ])
            ->assertCreated()
            ->assertJsonPath('message.message', 'hello alert(1) there');
    }

    #[Test]
    public function only_one_unread_notification_is_kept_per_conversation(): void
    {
        $sender = User::factory()->student()->create();
        $recipient = User::factory()->student()->create();
        $token = $sender->createToken('t')->plainTextToken;

        foreach (['one', 'two', 'three'] as $text) {
            $this->forgetAuthState()->withToken($token)
                ->postJson("/api/messages/{$recipient->tagname}", ['message' => $text]);
        }

        $this->assertSame(
            1,
            Inbox::where([
                'recipient_id' => $recipient->id,
                'category' => InboxCategory::Message,
            ])->count(),
        );
    }

    #[Test]
    public function reading_a_thread_marks_its_notification_read(): void
    {
        $sender = User::factory()->student()->create();
        $recipient = User::factory()->student()->create();

        $this->withToken($sender->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$recipient->tagname}", ['message' => 'Hello']);

        $this->forgetAuthState()->withToken($recipient->createToken('t')->plainTextToken)
            ->getJson("/api/messages/{$sender->tagname}")
            ->assertOk();

        $this->assertTrue(Inbox::sole()->is_read);
    }

    #[Test]
    public function the_conversation_list_shows_the_latest_message(): void
    {
        $alice = User::factory()->student()->create();
        $bob = User::factory()->student()->create();
        $token = $alice->createToken('t')->plainTextToken;

        $this->withToken($token)->postJson("/api/messages/{$bob->tagname}", ['message' => 'First']);
        $this->forgetAuthState()->withToken($token)
            ->postJson("/api/messages/{$bob->tagname}", ['message' => 'Most recent']);

        $this->forgetAuthState()->withToken($token)
            ->getJson('/api/messages')
            ->assertOk()
            ->assertJsonCount(1, 'conversations')
            ->assertJsonPath('conversations.0.with.tagname', $bob->tagname)
            ->assertJsonPath('conversations.0.last_message', 'Most recent');
    }

    #[Test]
    public function you_cannot_message_yourself(): void
    {
        $user = User::factory()->student()->create();

        $this->withToken($user->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$user->tagname}", ['message' => 'Hello me'])
            ->assertStatus(422);
    }

    #[Test]
    public function a_thread_is_not_readable_by_anyone_else(): void
    {
        $alice = User::factory()->student()->create();
        $bob = User::factory()->student()->create();
        $nosy = User::factory()->student()->create();

        $this->withToken($alice->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$bob->tagname}", ['message' => 'Private']);

        // The nosy user asking for Bob's thread gets their own empty one, never Alice's.
        $response = $this->forgetAuthState()->withToken($nosy->createToken('t')->plainTextToken)
            ->getJson("/api/messages/{$bob->tagname}")
            ->assertOk();

        $this->assertSame([], $response->json('messages'));
        $this->assertSame(2, MessageHeader::count());
        $this->assertSame(1, MessageBody::count());
    }

    #[Test]
    public function guests_cannot_message(): void
    {
        $user = User::factory()->student()->create();

        $this->postJson("/api/messages/{$user->tagname}", ['message' => 'Hi'])
            ->assertUnauthorized();
    }
}
