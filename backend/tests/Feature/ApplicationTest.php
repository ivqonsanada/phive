<?php

namespace Tests\Feature;

use App\Enums\ApplicantType;
use App\Enums\Expertise;
use App\Enums\ProjectBoxStatus;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    private function student(): array
    {
        $student = User::factory()->student()->create(['expertise' => Expertise::FrontendEngineer]);

        return [$student, $student->createToken('t')->plainTextToken];
    }

    #[Test]
    public function a_student_can_apply_individually(): void
    {
        [$student, $token] = $this->student();
        $project = Project::factory()->create();

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/individual", [
                'expertise' => Expertise::FrontendEngineer->value,
                'apply_reason' => 'I want to build it.',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('individual_applicants', [
            'project_id' => $project->id,
            'from_id' => $student->id,
            'to_id' => $project->user_id,
        ]);
        $this->assertDatabaseHas('project_boxes', [
            'project_id' => $project->id,
            'user_id' => $student->id,
            'status' => ProjectBoxStatus::Waiting->value,
        ]);
    }

    #[Test]
    public function applying_twice_is_a_conflict(): void
    {
        [, $token] = $this->student();
        $project = Project::factory()->create();
        $payload = ['expertise' => Expertise::FrontendEngineer->value];

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/individual", $payload)
            ->assertCreated();

        $this->forgetAuthState()->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/individual", $payload)
            ->assertStatus(409);
    }

    #[Test]
    public function a_closed_project_rejects_applications(): void
    {
        [, $token] = $this->student();
        $project = Project::factory()->create(['is_open_hiring' => false]);

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/individual", [
                'expertise' => Expertise::FrontendEngineer->value,
            ])
            ->assertStatus(422);
    }

    #[Test]
    public function a_finished_project_rejects_applications(): void
    {
        [, $token] = $this->student();
        $project = Project::factory()->create(['status' => ProjectStatus::Finished]);

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/individual", [
                'expertise' => Expertise::FrontendEngineer->value,
            ])
            ->assertStatus(422);
    }

    #[Test]
    public function a_team_only_project_rejects_individual_applications(): void
    {
        [, $token] = $this->student();
        $project = Project::factory()->create(['applicant_type' => ApplicantType::Team]);

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/individual", [
                'expertise' => Expertise::FrontendEngineer->value,
            ])
            ->assertStatus(422);
    }

    #[Test]
    public function lecturers_cannot_apply(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $project = Project::factory()->create();

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/projects/{$project->project_url}/apply/individual", [
                'expertise' => Expertise::FrontendEngineer->value,
            ])
            ->assertForbidden();
    }

    #[Test]
    public function a_leader_can_apply_with_their_party(): void
    {
        [$leader, $token] = $this->student();
        $member = User::factory()->student()->create();
        $project = Project::factory()->create();

        $team = Team::create(['leader_id' => $leader->id]);
        TeamMember::create(['team_id' => $team->id, 'member_id' => $leader->id]);
        TeamMember::create(['team_id' => $team->id, 'member_id' => $member->id]);

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/team", [
                'members' => [
                    ['member_id' => $leader->id, 'expertise' => Expertise::FrontendEngineer->value],
                    ['member_id' => $member->id, 'expertise' => Expertise::DataExpert->value],
                ],
            ])
            ->assertCreated();

        $this->assertDatabaseHas('team_applicants', [
            'project_id' => $project->id,
            'from_id' => $leader->id,
        ]);
        // Every listed member gets their own box row.
        $this->assertDatabaseCount('project_boxes', 2);
    }

    #[Test]
    public function you_cannot_list_someone_outside_your_party(): void
    {
        [$leader, $token] = $this->student();
        $outsider = User::factory()->student()->create();
        $project = Project::factory()->create();

        $team = Team::create(['leader_id' => $leader->id]);
        TeamMember::create(['team_id' => $team->id, 'member_id' => $leader->id]);

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/team", [
                'members' => [
                    ['member_id' => $outsider->id, 'expertise' => Expertise::DataExpert->value],
                ],
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('team_applicants', 0);
    }

    #[Test]
    public function applying_as_a_team_needs_a_party(): void
    {
        [, $token] = $this->student();
        $project = Project::factory()->create();

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/team", [
                'members' => [['member_id' => 1, 'expertise' => Expertise::DataExpert->value]],
            ])
            ->assertStatus(422);
    }

    #[Test]
    public function a_lecturer_cannot_apply_to_their_own_project(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/projects/{$project->project_url}/apply/individual", [
                'expertise' => Expertise::FrontendEngineer->value,
            ])
            ->assertForbidden();
    }

    #[Test]
    public function an_application_can_be_withdrawn(): void
    {
        [$student, $token] = $this->student();
        $project = Project::factory()->create();

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/apply/individual", [
                'expertise' => Expertise::FrontendEngineer->value,
            ])
            ->assertCreated();

        $this->forgetAuthState()->withToken($token)
            ->deleteJson("/api/projects/{$project->project_url}/apply")
            ->assertOk();

        $this->assertDatabaseCount('individual_applicants', 0);
        $this->assertDatabaseCount('project_boxes', 0);
    }

    #[Test]
    public function withdrawing_without_applying_is_a_404(): void
    {
        [, $token] = $this->student();
        $project = Project::factory()->create();

        $this->withToken($token)
            ->deleteJson("/api/projects/{$project->project_url}/apply")
            ->assertNotFound();
    }
}
