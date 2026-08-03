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

class ProjectWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $lecturer;

    private User $student;

    private Project $project;

    private string $lecturerToken;

    private string $studentToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->lecturer = User::factory()->lecturer()->create();
        $this->student = User::factory()->student()->create(['expertise' => Expertise::FrontendEngineer]);

        $this->project = Project::factory()->create([
            'user_id' => $this->lecturer->id,
            'level_applicant' => ProjectLevel::Hard->value,
        ]);

        $this->lecturerToken = $this->lecturer->createToken('t')->plainTextToken;
        $this->studentToken = $this->student->createToken('t')->plainTextToken;

        ProjectBox::create([
            'project_id' => $this->project->id,
            'user_id' => $this->lecturer->id,
            'status' => ProjectBoxStatus::Hiring,
        ]);
    }

    private function apply(): void
    {
        $this->forgetAuthState()->withToken($this->studentToken)
            ->postJson("/api/projects/{$this->project->project_url}/apply/individual", [
                'expertise' => Expertise::FrontendEngineer->value,
            ])->assertCreated();
    }

    private function shortlist(): void
    {
        $applicant = IndividualApplicant::sole();

        $this->forgetAuthState()->withToken($this->lecturerToken)
            ->postJson("/api/my/projects/{$this->project->project_url}/shortlist", [
                'individual_uuids' => [$applicant->uuid],
            ])->assertOk();
    }

    private function confirm(bool $accept = true): void
    {
        $box = ProjectBox::where('user_id', $this->student->id)->sole();

        $this->forgetAuthState()->withToken($this->studentToken)
            ->postJson("/api/project-box/{$box->uuid}/confirm", ['accept' => $accept])
            ->assertOk();
    }

    private function start(): void
    {
        $this->forgetAuthState()->withToken($this->lecturerToken)
            ->postJson("/api/my/projects/{$this->project->project_url}/start")
            ->assertOk();
    }

    #[Test]
    public function the_lecturer_sees_who_applied(): void
    {
        $this->apply();

        $this->forgetAuthState()->withToken($this->lecturerToken)
            ->getJson("/api/my/projects/{$this->project->project_url}/shortlist")
            ->assertOk()
            ->assertJsonCount(1, 'individuals')
            ->assertJsonPath('individuals.0.user.tagname', $this->student->tagname);
    }

    #[Test]
    public function another_lecturer_cannot_see_the_shortlist(): void
    {
        $this->apply();
        $stranger = User::factory()->lecturer()->create();

        $this->forgetAuthState()->withToken($stranger->createToken('t')->plainTextToken)
            ->getJson("/api/my/projects/{$this->project->project_url}/shortlist")
            ->assertForbidden();
    }

    #[Test]
    public function shortlisting_moves_the_applicant_and_the_project_forward(): void
    {
        $this->apply();
        $this->shortlist();

        $this->assertSame(
            ApplicationStatus::Waiting,
            IndividualApplicant::sole()->status,
        );
        $this->assertSame(
            ProjectBoxStatus::Accepted,
            ProjectBox::where('user_id', $this->student->id)->sole()->status,
        );
        $this->assertSame(
            ProjectBoxStatus::Confirmation,
            ProjectBox::where('user_id', $this->lecturer->id)->sole()->status,
        );
    }

    #[Test]
    public function shortlisting_nobody_is_rejected(): void
    {
        $this->apply();

        $this->forgetAuthState()->withToken($this->lecturerToken)
            ->postJson("/api/my/projects/{$this->project->project_url}/shortlist", [
                'individual_uuids' => [],
            ])
            ->assertStatus(422);
    }

    #[Test]
    public function a_student_confirms_their_seat(): void
    {
        $this->apply();
        $this->shortlist();
        $this->confirm();

        $this->assertSame(
            ProjectBoxStatus::WaitingToStart,
            ProjectBox::where('user_id', $this->student->id)->sole()->status,
        );
    }

    #[Test]
    public function a_student_can_bail_out_instead(): void
    {
        $this->apply();
        $this->shortlist();
        $this->confirm(accept: false);

        $this->assertSame(
            ProjectBoxStatus::BailOut,
            ProjectBox::where('user_id', $this->student->id)->sole()->status,
        );
    }

    #[Test]
    public function you_cannot_confirm_someone_elses_seat(): void
    {
        $this->apply();
        $this->shortlist();

        $box = ProjectBox::where('user_id', $this->student->id)->sole();
        $stranger = User::factory()->student()->create();

        $this->forgetAuthState()->withToken($stranger->createToken('t')->plainTextToken)
            ->postJson("/api/project-box/{$box->uuid}/confirm", ['accept' => true])
            ->assertForbidden();
    }

    #[Test]
    public function confirming_before_being_shortlisted_is_a_conflict(): void
    {
        $this->apply();

        $box = ProjectBox::where('user_id', $this->student->id)->sole();

        $this->forgetAuthState()->withToken($this->studentToken)
            ->postJson("/api/project-box/{$box->uuid}/confirm", ['accept' => true])
            ->assertStatus(409);
    }

    #[Test]
    public function starting_forms_the_team_and_closes_hiring(): void
    {
        $this->apply();
        $this->shortlist();
        $this->confirm();
        $this->start();

        $project = $this->project->fresh();

        $this->assertSame(ProjectStatus::Ongoing, $project->status);
        $this->assertFalse($project->is_open_hiring);
        $this->assertNotNull($project->start_time);

        $team = ProjectTeam::sole();
        $this->assertDatabaseHas('project_team_members', [
            'project_team_id' => $team->id,
            'member_id' => $this->student->id,
            'expertise' => Expertise::FrontendEngineer->value,
        ]);
        $this->assertSame(ApplicationStatus::Fixed, IndividualApplicant::sole()->status);
    }

    #[Test]
    public function starting_without_anyone_confirmed_is_rejected(): void
    {
        $this->apply();
        $this->shortlist();

        $this->forgetAuthState()->withToken($this->lecturerToken)
            ->postJson("/api/my/projects/{$this->project->project_url}/start")
            ->assertStatus(422);
    }

    #[Test]
    public function unconfirmed_applicants_are_released_when_the_project_starts(): void
    {
        $this->apply();

        $passedOver = User::factory()->student()->create();
        ProjectBox::create([
            'project_id' => $this->project->id,
            'user_id' => $passedOver->id,
            'status' => ProjectBoxStatus::Waiting,
        ]);

        $this->shortlist();
        $this->confirm();
        $this->start();

        $this->assertSame(
            ProjectBoxStatus::Rejected,
            ProjectBox::where('user_id', $passedOver->id)->sole()->status,
        );
    }

    #[Test]
    public function reviewing_finishes_the_project_and_awards_points(): void
    {
        $this->apply();
        $this->shortlist();
        $this->confirm();
        $this->start();

        $this->forgetAuthState()->withToken($this->lecturerToken)
            ->postJson("/api/my/projects/{$this->project->project_url}/review", [
                'overall_score' => 5,
                'overall_review' => 'Shipped on time.',
                'participants' => [[
                    'member_uuid' => $this->student->uuid,
                    'expertise' => Expertise::FrontendEngineer->value,
                    'score' => 4,
                    'assessment' => 'Strong work.',
                ]],
            ])
            ->assertOk();

        $project = $this->project->fresh();
        $this->assertSame(ProjectStatus::Finished, $project->status);
        $this->assertNotNull($project->finish_time);

        $this->assertSame(
            ProjectBoxStatus::Finished,
            ProjectBox::where('user_id', $this->student->id)->sole()->status,
        );

        // Hard = 4000 pts, (5/5) * (4/5) * 4000 = 3200
        $this->assertSame(
            3200,
            Leaderboard::where('user_id', $this->student->id)->sole()->points,
        );

        $this->assertSame('4', ProjectTeamMember::sole()->score);
    }

    #[Test]
    public function points_are_created_for_a_student_with_no_board_row_yet(): void
    {
        $this->apply();
        $this->shortlist();
        $this->confirm();
        $this->start();

        $this->assertDatabaseCount('leaderboards', 0);

        $this->forgetAuthState()->withToken($this->lecturerToken)
            ->postJson("/api/my/projects/{$this->project->project_url}/review", [
                'overall_score' => 5,
                'participants' => [[
                    'member_uuid' => $this->student->uuid,
                    'expertise' => Expertise::FrontendEngineer->value,
                    'score' => 5,
                ]],
            ])
            ->assertOk();

        // The legacy code issued a bare UPDATE here, so this student earned nothing.
        $this->assertSame(4000, Leaderboard::sole()->points);
    }

    #[Test]
    public function a_project_that_has_not_started_cannot_be_reviewed(): void
    {
        $this->forgetAuthState()->withToken($this->lecturerToken)
            ->postJson("/api/my/projects/{$this->project->project_url}/review", [
                'overall_score' => 5,
                'participants' => [[
                    'member_uuid' => $this->student->uuid,
                    'expertise' => Expertise::FrontendEngineer->value,
                    'score' => 5,
                ]],
            ])
            ->assertStatus(409);
    }

    #[Test]
    public function the_project_box_lists_what_you_are_involved_in(): void
    {
        $this->apply();

        $this->forgetAuthState()->withToken($this->studentToken)
            ->getJson('/api/project-box')
            ->assertOk()
            ->assertJsonCount(1, 'boxes')
            ->assertJsonPath('boxes.0.status', ProjectBoxStatus::Waiting->value)
            ->assertJsonPath('boxes.0.can_confirm', false);
    }
}
