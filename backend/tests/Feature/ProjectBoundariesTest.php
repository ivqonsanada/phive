<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\Expertise;
use App\Enums\ProjectBoxStatus;
use App\Enums\ProjectLevel;
use App\Enums\ProjectStatus;
use App\Models\IndividualApplicant;
use App\Models\Leaderboard;
use App\Models\Project;
use App\Models\ProjectBox;
use App\Models\ProjectTeam;
use App\Models\ProjectTeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Guards that exist in the controllers but had no coverage. An unexercised guard is
 * one refactor away from being dropped without anything noticing.
 */
class ProjectBoundariesTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_lecturer_cannot_assign_a_project_to_someone_else(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $victim = User::factory()->lecturer()->create();

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson('/api/my/projects', [
                'publish' => false,
                'title' => 'Whose project is this',
                'user_id' => $victim->id,
            ])
            ->assertCreated();

        // Ownership comes from the token, never from the payload.
        $this->assertSame($lecturer->id, Project::sole()->user_id);
    }

    #[Test]
    public function a_lecturer_cannot_jump_a_project_straight_to_finished(): void
    {
        // Status is driven by the workflow — publish, start, review — so setting it
        // directly would skip hiring entirely and award nothing.
        $lecturer = User::factory()->lecturer()->create();

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson('/api/my/projects', [
                'publish' => false,
                'title' => 'Straight to done',
                'status' => ProjectStatus::Finished->value,
            ])
            ->assertCreated();

        $this->assertSame(ProjectStatus::Draft, Project::sole()->status);
    }

    #[Test]
    public function a_lecturer_cannot_choose_their_own_project_url(): void
    {
        // The slug carries a random suffix precisely so titles cannot be probed;
        // letting it be set by hand would undo that and could collide.
        $lecturer = User::factory()->lecturer()->create();

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson('/api/my/projects', [
                'publish' => false,
                'title' => 'Pick me',
                'project_url' => 'chosen-slug',
            ])
            ->assertCreated();

        $this->assertNotSame('chosen-slug', Project::sole()->project_url);
    }

    #[Test]
    public function a_lecturer_cannot_shortlist_an_applicant_from_another_project(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $mine = Project::factory()->create(['user_id' => $lecturer->id]);
        $theirs = Project::factory()->create();

        $student = User::factory()->student()->create();
        $foreign = IndividualApplicant::create([
            'project_id' => $theirs->id,
            'from_id' => $student->id,
            'to_id' => $theirs->user_id,
            'expertise' => Expertise::DataExpert,
        ]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$mine->project_url}/shortlist", [
                'individual_uuids' => [$foreign->uuid],
            ])
            ->assertOk();

        // The query is scoped to the lecturer's own project, so nothing happened.
        $this->assertSame(ApplicationStatus::Applying, $foreign->fresh()->status);
    }

    #[Test]
    public function a_lecturer_cannot_score_someone_who_is_not_on_the_team(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $project = Project::factory()->create([
            'user_id' => $lecturer->id,
            'status' => ProjectStatus::Ongoing,
            'level_applicant' => ProjectLevel::Hard->value,
        ]);

        $member = User::factory()->student()->create();
        $outsider = User::factory()->student()->create();

        $team = ProjectTeam::create(['project_id' => $project->id]);
        ProjectTeamMember::create([
            'project_team_id' => $team->id,
            'member_id' => $member->id,
            'expertise' => Expertise::DataExpert,
        ]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$project->project_url}/review", [
                'overall_score' => 5,
                'participants' => [[
                    'member_uuid' => $outsider->uuid,
                    'expertise' => Expertise::DataExpert->value,
                    'score' => 5,
                ]],
            ])
            ->assertStatus(422);

        // No points invented for a stranger, and the project stays open.
        $this->assertDatabaseCount('leaderboards', 0);
        $this->assertSame(ProjectStatus::Ongoing, $project->fresh()->status);
    }

    #[Test]
    public function reviewing_cannot_award_more_than_the_level_allows(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $project = Project::factory()->create([
            'user_id' => $lecturer->id,
            'status' => ProjectStatus::Ongoing,
            'level_applicant' => ProjectLevel::Easy->value,
        ]);
        $member = User::factory()->student()->create();

        $team = ProjectTeam::create(['project_id' => $project->id]);
        ProjectTeamMember::create([
            'project_team_id' => $team->id,
            'member_id' => $member->id,
            'expertise' => Expertise::DataExpert,
        ]);
        ProjectBox::create([
            'project_id' => $project->id,
            'user_id' => $member->id,
            'status' => ProjectBoxStatus::ProjectStarted,
        ]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$project->project_url}/review", [
                'overall_score' => 5,
                'participants' => [[
                    'member_uuid' => $member->uuid,
                    'expertise' => Expertise::DataExpert->value,
                    'score' => 5,
                ]],
            ])
            ->assertOk();

        // Easy caps at 2000, however perfect the scores.
        $this->assertSame(2000, Leaderboard::sole()->points);
    }

    #[Test]
    public function a_score_above_five_is_rejected(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $project = Project::factory()->create([
            'user_id' => $lecturer->id,
            'status' => ProjectStatus::Ongoing,
        ]);
        $member = User::factory()->student()->create();

        $team = ProjectTeam::create(['project_id' => $project->id]);
        ProjectTeamMember::create([
            'project_team_id' => $team->id,
            'member_id' => $member->id,
            'expertise' => Expertise::DataExpert,
        ]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$project->project_url}/review", [
                'overall_score' => 50,
                'participants' => [[
                    'member_uuid' => $member->uuid,
                    'expertise' => Expertise::DataExpert->value,
                    'score' => 99,
                ]],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['overall_score', 'participants.0.score']);
    }
}
