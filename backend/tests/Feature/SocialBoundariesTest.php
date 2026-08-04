<?php

namespace Tests\Feature;

use App\Models\MessageBody;
use App\Models\Project;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Boundaries around messaging, parties and the wishlist — the guards with the
 * thinnest coverage.
 */
class SocialBoundariesTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function the_sender_comes_from_the_token_not_the_payload(): void
    {
        $sender = User::factory()->student()->create();
        $recipient = User::factory()->student()->create();
        $impersonated = User::factory()->student()->create();

        $this->withToken($sender->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$recipient->tagname}", [
                'message' => 'Not from who it says',
                'sender_id' => $impersonated->id,
                'recipient_id' => $impersonated->id,
            ])
            ->assertCreated();

        $body = MessageBody::sole();

        $this->assertSame($sender->id, $body->sender_id);
        $this->assertSame($recipient->id, $body->recipient_id);
    }

    #[Test]
    public function a_blank_message_is_rejected(): void
    {
        $sender = User::factory()->student()->create();
        $recipient = User::factory()->student()->create();

        // Laravel trims input, so whitespace collapses to empty and fails `required`.
        $this->withToken($sender->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$recipient->tagname}", ['message' => '     '])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('message');
    }

    #[Test]
    public function an_overlong_message_is_rejected(): void
    {
        $sender = User::factory()->student()->create();
        $recipient = User::factory()->student()->create();

        $this->withToken($sender->createToken('t')->plainTextToken)
            ->postJson("/api/messages/{$recipient->tagname}", [
                'message' => str_repeat('a', 5001),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('message');
    }

    #[Test]
    public function only_a_leader_can_remove_someone_from_a_party(): void
    {
        $leader = User::factory()->student()->create();
        $member = User::factory()->student()->create();
        $bystander = User::factory()->student()->create();

        $team = Team::create(['leader_id' => $leader->id]);
        TeamMember::create(['team_id' => $team->id, 'member_id' => $leader->id]);
        TeamMember::create(['team_id' => $team->id, 'member_id' => $member->id]);

        // A member of the party is still not its leader.
        $this->withToken($member->createToken('t')->plainTextToken)
            ->deleteJson("/api/party/members/{$bystander->tagname}")
            ->assertNotFound();

        $this->forgetAuthState()
            ->withToken($bystander->createToken('t')->plainTextToken)
            ->deleteJson("/api/party/members/{$member->tagname}")
            ->assertNotFound();

        // The party is untouched.
        $this->assertSame(2, TeamMember::where('team_id', $team->id)->count());
    }

    #[Test]
    public function a_leader_cannot_leave_their_own_party(): void
    {
        $leader = User::factory()->student()->create();
        $team = Team::create(['leader_id' => $leader->id]);
        TeamMember::create(['team_id' => $team->id, 'member_id' => $leader->id]);

        $this->withToken($leader->createToken('t')->plainTextToken)
            ->deleteJson("/api/party/{$team->uuid}/leave")
            ->assertStatus(422);

        $this->assertSame(1, TeamMember::where('team_id', $team->id)->count());
    }

    #[Test]
    public function a_draft_project_cannot_be_wishlisted(): void
    {
        // The public detail endpoint 404s on a draft; this route must agree, or it
        // confirms that an unpublished project exists.
        $student = User::factory()->student()->create();
        $draft = Project::factory()->draft()->create(['project_url' => 'hidden-draft-abcd1234']);

        $this->withToken($student->createToken('t')->plainTextToken)
            ->postJson("/api/projects/{$draft->project_url}/wishlist")
            ->assertNotFound();

        $this->assertDatabaseCount('wishlists', 0);
    }

    #[Test]
    public function a_published_project_can_still_be_wishlisted(): void
    {
        $student = User::factory()->student()->create();
        $project = Project::factory()->create();

        $this->withToken($student->createToken('t')->plainTextToken)
            ->postJson("/api/projects/{$project->project_url}/wishlist")
            ->assertOk()
            ->assertJsonPath('is_wished', true);

        $this->assertSame(1, Wishlist::count());
    }
}
