<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The policy is consulted by both the API and the Filament panel, so it has to answer
 * sensibly for an administrator as well as for the lecturer who owns the project.
 */
class ProjectPolicyTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function an_administrator_can_manage_any_project(): void
    {
        $admin = User::factory()->lecturer()->create(['is_admin' => true]);
        $theirs = Project::factory()->create();

        $this->assertTrue($admin->can('viewAny', Project::class));
        $this->assertTrue($admin->can('view', $theirs));
        $this->assertTrue($admin->can('update', $theirs));
        $this->assertTrue($admin->can('delete', $theirs));
    }

    #[Test]
    public function a_lecturer_manages_only_their_own(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $mine = Project::factory()->create(['user_id' => $lecturer->id]);
        $theirs = Project::factory()->create();

        $this->assertTrue($lecturer->can('update', $mine));
        $this->assertFalse($lecturer->can('update', $theirs));
        $this->assertFalse($lecturer->can('delete', $theirs));
    }

    #[Test]
    public function a_student_manages_nothing(): void
    {
        $student = User::factory()->student()->create();
        $project = Project::factory()->create();

        $this->assertFalse($student->can('create', Project::class));
        $this->assertFalse($student->can('update', $project));
        $this->assertFalse($student->can('viewAny', Project::class));
    }

    #[Test]
    public function the_admin_flag_and_not_the_role_is_what_grants_it(): void
    {
        // A lecturer is not an administrator, and an administrator need not be a
        // lecturer — the two are deliberately separate.
        $plainLecturer = User::factory()->lecturer()->create(['is_admin' => false]);
        $adminStudent = User::factory()->student()->create(['is_admin' => true]);
        $theirs = Project::factory()->create();

        $this->assertFalse($plainLecturer->can('update', $theirs));
        $this->assertTrue($adminStudent->can('update', $theirs));
    }

    #[Test]
    public function an_administrator_can_edit_another_lecturers_project_through_the_api(): void
    {
        $admin = User::factory()->lecturer()->create(['is_admin' => true]);
        $theirs = Project::factory()->create(['title' => 'Original']);

        $this->withToken($admin->createToken('t')->plainTextToken)
            ->patchJson("/api/my/projects/{$theirs->project_url}", [
                'publish' => true,
                'title' => 'Corrected by an admin',
                'description' => 'Moderation happens.',
                'front_end_engineer' => true,
            ])
            ->assertOk();

        $this->assertSame('Corrected by an admin', $theirs->fresh()->title);
    }
}
