<?php

namespace Tests\Feature;

use App\Enums\InboxCategory;
use App\Enums\InvitationStatus;
use App\Enums\ProjectBoxStatus;
use App\Models\Inbox;
use App\Models\Project;
use App\Models\ProjectBox;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProjectInvitationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_lecturer_can_invite_a_student_to_their_project(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $student = User::factory()->student()->create();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$project->project_url}/invite/{$student->tagname}")
            ->assertOk();

        $this->assertDatabaseHas('project_invitations', [
            'project_id' => $project->id,
            'from_id' => $lecturer->id,
            'to_id' => $student->id,
            'status' => InvitationStatus::Pending->value,
        ]);
        $this->assertDatabaseHas('inboxes', [
            'recipient_id' => $student->id,
            'category' => InboxCategory::ProjectInvitation->value,
        ]);
    }

    #[Test]
    public function accepting_puts_the_student_straight_on_the_project(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $student = User::factory()->student()->create();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$project->project_url}/invite/{$student->tagname}");

        $studentToken = $student->createToken('t')->plainTextToken;
        $inboxId = $this->forgetAuthState()->withToken($studentToken)
            ->getJson('/api/inbox')->json('items.0.id');

        $this->forgetAuthState()->withToken($studentToken)
            ->postJson("/api/inbox/$inboxId/respond", ['accept' => true])
            ->assertOk();

        $this->assertSame(InvitationStatus::Accepted, ProjectInvitation::sole()->status);

        // A direct invitation skips the application queue, so this is already
        // the confirmed state the lecturer can start from.
        $this->assertSame(
            ProjectBoxStatus::WaitingToStart,
            ProjectBox::where('user_id', $student->id)->sole()->status,
        );
    }

    #[Test]
    public function declining_does_not_create_a_project_box(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $student = User::factory()->student()->create();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$project->project_url}/invite/{$student->tagname}");

        $studentToken = $student->createToken('t')->plainTextToken;
        $inboxId = $this->forgetAuthState()->withToken($studentToken)
            ->getJson('/api/inbox')->json('items.0.id');

        $this->forgetAuthState()->withToken($studentToken)
            ->postJson("/api/inbox/$inboxId/respond", ['accept' => false])
            ->assertOk();

        $this->assertSame(InvitationStatus::Rejected, ProjectInvitation::sole()->status);
        $this->assertDatabaseCount('project_boxes', 0);
    }

    #[Test]
    public function a_lecturer_cannot_invite_to_someone_elses_project(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $student = User::factory()->student()->create();
        $theirs = Project::factory()->create();

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$theirs->project_url}/invite/{$student->tagname}")
            ->assertForbidden();
    }

    #[Test]
    public function only_students_can_be_invited(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $other = User::factory()->lecturer()->create();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$project->project_url}/invite/{$other->tagname}")
            ->assertStatus(422);
    }

    #[Test]
    public function inviting_twice_does_not_duplicate_the_invitation(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $student = User::factory()->student()->create();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);
        $token = $lecturer->createToken('t')->plainTextToken;

        foreach (range(1, 2) as $ignored) {
            $this->forgetAuthState()->withToken($token)
                ->postJson("/api/my/projects/{$project->project_url}/invite/{$student->tagname}")
                ->assertOk();
        }

        $this->assertDatabaseCount('project_invitations', 1);
        $this->assertSame(1, Inbox::count());
    }
}
