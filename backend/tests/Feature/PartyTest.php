<?php

namespace Tests\Feature;

use App\Enums\InboxCategory;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PartyTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function inviting_creates_the_party_with_the_leader_in_it(): void
    {
        $leader = User::factory()->student()->create();
        $invitee = User::factory()->student()->create();

        $this->withToken($leader->createToken('t')->plainTextToken)
            ->postJson("/api/users/{$invitee->tagname}/invite/party")
            ->assertOk();

        $team = Team::sole();

        $this->assertSame($leader->id, $team->leader_id);
        $this->assertDatabaseHas('team_members', [
            'team_id' => $team->id,
            'member_id' => $leader->id,
        ]);
        // The invitee is not a member until they accept.
        $this->assertDatabaseMissing('team_members', [
            'team_id' => $team->id,
            'member_id' => $invitee->id,
        ]);
        $this->assertDatabaseHas('inboxes', [
            'recipient_id' => $invitee->id,
            'category' => InboxCategory::TeamInvitation->value,
        ]);
    }

    #[Test]
    public function accepting_an_invitation_joins_the_party(): void
    {
        $leader = User::factory()->student()->create();
        $invitee = User::factory()->student()->create();

        $this->withToken($leader->createToken('t')->plainTextToken)
            ->postJson("/api/users/{$invitee->tagname}/invite/party");

        $inviteeToken = $invitee->createToken('t')->plainTextToken;

        $inboxId = $this->forgetAuthState()->withToken($inviteeToken)
            ->getJson('/api/inbox')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->json('items.0.id');

        $this->forgetAuthState()->withToken($inviteeToken)
            ->postJson("/api/inbox/$inboxId/respond", ['accept' => true])
            ->assertOk();

        $this->assertDatabaseHas('team_members', [
            'team_id' => Team::sole()->id,
            'member_id' => $invitee->id,
        ]);
    }

    #[Test]
    public function declining_leaves_the_party_unchanged(): void
    {
        $leader = User::factory()->student()->create();
        $invitee = User::factory()->student()->create();

        $this->withToken($leader->createToken('t')->plainTextToken)
            ->postJson("/api/users/{$invitee->tagname}/invite/party");

        $token = $invitee->createToken('t')->plainTextToken;
        $inboxId = $this->forgetAuthState()->withToken($token)->getJson('/api/inbox')->json('items.0.id');

        $this->forgetAuthState()->withToken($token)
            ->postJson("/api/inbox/$inboxId/respond", ['accept' => false])
            ->assertOk();

        $this->assertDatabaseMissing('team_members', ['member_id' => $invitee->id]);
    }

    #[Test]
    public function you_cannot_respond_to_someone_elses_invitation(): void
    {
        $leader = User::factory()->student()->create();
        $invitee = User::factory()->student()->create();
        $stranger = User::factory()->student()->create();

        $this->withToken($leader->createToken('t')->plainTextToken)
            ->postJson("/api/users/{$invitee->tagname}/invite/party");

        $inboxId = $this->forgetAuthState()
            ->withToken($invitee->createToken('t')->plainTextToken)
            ->getJson('/api/inbox')->json('items.0.id');

        $this->forgetAuthState()->withToken($stranger->createToken('t')->plainTextToken)
            ->postJson("/api/inbox/$inboxId/respond", ['accept' => true])
            ->assertForbidden();
    }

    #[Test]
    public function you_cannot_invite_yourself(): void
    {
        $leader = User::factory()->student()->create();

        $this->withToken($leader->createToken('t')->plainTextToken)
            ->postJson("/api/users/{$leader->tagname}/invite/party")
            ->assertStatus(422);
    }

    #[Test]
    public function lecturers_do_not_form_parties(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $student = User::factory()->student()->create();

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/users/{$student->tagname}/invite/party")
            ->assertForbidden();
    }

    #[Test]
    public function a_leader_can_kick_a_member(): void
    {
        $leader = User::factory()->student()->create();
        $member = User::factory()->student()->create();

        $team = Team::create(['leader_id' => $leader->id]);
        TeamMember::create(['team_id' => $team->id, 'member_id' => $leader->id]);
        TeamMember::create(['team_id' => $team->id, 'member_id' => $member->id]);

        $this->withToken($leader->createToken('t')->plainTextToken)
            ->deleteJson("/api/party/members/{$member->tagname}")
            ->assertOk();

        $this->assertDatabaseMissing('team_members', [
            'team_id' => $team->id,
            'member_id' => $member->id,
        ]);
    }

    #[Test]
    public function the_party_endpoint_separates_led_from_member_of(): void
    {
        $user = User::factory()->student()->create();
        $other = User::factory()->student()->create();

        $own = Team::create(['leader_id' => $user->id]);
        TeamMember::create(['team_id' => $own->id, 'member_id' => $user->id]);

        $theirs = Team::create(['leader_id' => $other->id]);
        TeamMember::create(['team_id' => $theirs->id, 'member_id' => $other->id]);
        TeamMember::create(['team_id' => $theirs->id, 'member_id' => $user->id]);

        $this->withToken($user->createToken('t')->plainTextToken)
            ->getJson('/api/party')
            ->assertOk()
            ->assertJsonPath('led.id', $own->id)
            ->assertJsonCount(1, 'member_of')
            ->assertJsonPath('member_of.0.id', $theirs->id);
    }
}
