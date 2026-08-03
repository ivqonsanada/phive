<?php

namespace Tests\Feature;

use App\Enums\ProjectBoxStatus;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\ProjectSkill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProjectPublishingTest extends TestCase
{
    use RefreshDatabase;

    private function lecturer(): array
    {
        $lecturer = User::factory()->lecturer()->create();

        return [$lecturer, $lecturer->createToken('t')->plainTextToken];
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'publish' => true,
            'title' => 'Campus Wayfinding App',
            'description' => 'Build the indoor navigation app for the new library.',
            'applicant_type' => 'Individual & Team',
            'max_person' => '4',
            'front_end_engineer' => true,
            'certificate' => true,
            'salary' => true,
            'salary_amount' => 1500000,
            'currency' => 'IDR',
            'payment_type' => 'person',
            'skills' => ['React', 'Figma'],
            'requirements' => ['Weekly standup'],
            ...$overrides,
        ];
    }

    #[Test]
    public function a_lecturer_can_publish_a_project(): void
    {
        [$lecturer, $token] = $this->lecturer();

        $response = $this->withToken($token)
            ->postJson('/api/my/projects', $this->validPayload());

        $response->assertCreated()
            ->assertJsonPath('project.status', ProjectStatus::Hiring->value)
            ->assertJsonPath('project.skills', ['React', 'Figma'])
            ->assertJsonPath('project.requirements', ['Weekly standup']);

        $project = Project::sole();

        $this->assertSame($lecturer->id, $project->user_id);
        $this->assertStringStartsWith('campus-wayfinding-app-', $project->project_url);
        $this->assertDatabaseHas('project_boxes', [
            'project_id' => $project->id,
            'user_id' => $lecturer->id,
            'status' => ProjectBoxStatus::Hiring->value,
        ]);
    }

    #[Test]
    public function a_draft_may_be_incomplete(): void
    {
        [, $token] = $this->lecturer();

        $this->withToken($token)
            ->postJson('/api/my/projects', ['publish' => false, 'title' => 'Half an idea'])
            ->assertCreated()
            ->assertJsonPath('project.status', ProjectStatus::Draft->value);
    }

    #[Test]
    public function publishing_requires_a_title_and_description(): void
    {
        [, $token] = $this->lecturer();

        $this->withToken($token)
            ->postJson('/api/my/projects', $this->validPayload(['title' => '', 'description' => '']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'description']);
    }

    #[Test]
    public function publishing_requires_at_least_one_expertise(): void
    {
        [, $token] = $this->lecturer();

        $this->withToken($token)
            ->postJson('/api/my/projects', $this->validPayload(['front_end_engineer' => false]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ui_ux_designer');
    }

    #[Test]
    public function a_paid_project_needs_an_amount(): void
    {
        [, $token] = $this->lecturer();

        $this->withToken($token)
            ->postJson('/api/my/projects', $this->validPayload(['salary' => true, 'salary_amount' => 0]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('salary_amount');
    }

    #[Test]
    public function students_cannot_publish(): void
    {
        $student = User::factory()->student()->create();

        $this->withToken($student->createToken('t')->plainTextToken)
            ->postJson('/api/my/projects', $this->validPayload())
            ->assertForbidden();
    }

    #[Test]
    public function a_lecturer_cannot_edit_someone_elses_project(): void
    {
        [, $token] = $this->lecturer();
        $theirs = Project::factory()->create();

        $this->withToken($token)
            ->patchJson("/api/my/projects/{$theirs->project_url}", ['title' => 'Hijacked'])
            ->assertForbidden();

        $this->assertNotSame('Hijacked', $theirs->fresh()->title);
    }

    #[Test]
    public function editing_replaces_the_skill_list_rather_than_appending(): void
    {
        [$lecturer, $token] = $this->lecturer();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);
        ProjectSkill::create(['project_id' => $project->id, 'name' => 'Vue']);

        $this->withToken($token)
            ->patchJson("/api/my/projects/{$project->project_url}", [
                'publish' => true,
                'title' => $project->title,
                'description' => 'Updated brief.',
                'front_end_engineer' => true,
                'skills' => ['React'],
            ])
            ->assertOk()
            ->assertJsonPath('project.skills', ['React']);

        $this->assertSame(1, ProjectSkill::where('project_id', $project->id)->count());
    }

    #[Test]
    public function omitting_skills_leaves_them_untouched(): void
    {
        [$lecturer, $token] = $this->lecturer();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);
        ProjectSkill::create(['project_id' => $project->id, 'name' => 'Vue']);

        $this->withToken($token)
            ->patchJson("/api/my/projects/{$project->project_url}", [
                'publish' => true,
                'title' => $project->title,
                'description' => 'Updated brief.',
                'front_end_engineer' => true,
            ])
            ->assertOk();

        $this->assertSame(1, ProjectSkill::where('project_id', $project->id)->count());
    }

    #[Test]
    public function a_draft_can_be_published_in_one_call(): void
    {
        [$lecturer, $token] = $this->lecturer();
        $draft = Project::factory()->draft()->create([
            'user_id' => $lecturer->id,
            'project_url' => 'a-draft-abcd1234',
            'description' => 'Ready to go.',
        ]);

        $this->withToken($token)
            ->postJson("/api/my/projects/{$draft->project_url}/publish")
            ->assertOk()
            ->assertJsonPath('project.status', ProjectStatus::Hiring->value);

        $this->assertTrue($draft->fresh()->is_open_hiring);
    }

    #[Test]
    public function an_empty_draft_cannot_be_published(): void
    {
        [$lecturer, $token] = $this->lecturer();
        $draft = Project::factory()->draft()->create([
            'user_id' => $lecturer->id,
            'project_url' => 'empty-draft-abcd1234',
            'title' => null,
            'description' => null,
        ]);

        $this->withToken($token)
            ->postJson("/api/my/projects/{$draft->project_url}/publish")
            ->assertStatus(422);
    }

    #[Test]
    public function republishing_a_live_project_is_a_conflict(): void
    {
        [$lecturer, $token] = $this->lecturer();
        $live = Project::factory()->create(['user_id' => $lecturer->id]);

        $this->withToken($token)
            ->postJson("/api/my/projects/{$live->project_url}/publish")
            ->assertStatus(409);
    }

    #[Test]
    public function closing_applications_keeps_the_project_visible(): void
    {
        [$lecturer, $token] = $this->lecturer();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);

        $this->withToken($token)
            ->postJson("/api/my/projects/{$project->project_url}/close")
            ->assertOk();

        $this->assertFalse($project->fresh()->is_open_hiring);

        $this->forgetAuthState()
            ->getJson("/api/projects/{$project->project_url}")
            ->assertOk()
            ->assertJsonPath('is_open_hiring', false);
    }

    #[Test]
    public function a_project_can_be_withdrawn_unless_it_is_ongoing(): void
    {
        [$lecturer, $token] = $this->lecturer();
        $draft = Project::factory()->draft()->create([
            'user_id' => $lecturer->id,
            'project_url' => 'withdraw-me-abcd1234',
        ]);
        $ongoing = Project::factory()->create([
            'user_id' => $lecturer->id,
            'status' => ProjectStatus::Ongoing,
        ]);

        $this->withToken($token)
            ->deleteJson("/api/my/projects/{$draft->project_url}")
            ->assertOk();

        $this->assertDatabaseMissing('projects', ['id' => $draft->id]);

        $this->forgetAuthState()->withToken($token)
            ->deleteJson("/api/my/projects/{$ongoing->project_url}")
            ->assertStatus(409);
    }

    #[Test]
    public function the_lecturers_own_list_includes_drafts(): void
    {
        [$lecturer, $token] = $this->lecturer();
        Project::factory()->create(['user_id' => $lecturer->id]);
        Project::factory()->draft()->create([
            'user_id' => $lecturer->id,
            'project_url' => 'my-draft-abcd1234',
        ]);
        Project::factory()->create();

        $this->withToken($token)
            ->getJson('/api/my/projects')
            ->assertOk()
            ->assertJsonCount(2);
    }
}
