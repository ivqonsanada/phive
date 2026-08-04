<?php

namespace Tests\Feature;

use App\Enums\Expertise;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\ProjectReview;
use App\Models\ProjectTeam;
use App\Models\ProjectTeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The detail endpoint only loads a project team once a project has been started, so
 * the team branch of ProjectResource went untested until a real project reached that
 * state — and it was broken.
 */
class ProjectTeamVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private function projectWithTeam(): array
    {
        $project = Project::factory()->create(['status' => ProjectStatus::Ongoing]);
        $member = User::factory()->student()->create();

        $team = ProjectTeam::create(['project_id' => $project->id, 'leader_id' => $member->id]);
        ProjectTeamMember::create([
            'project_team_id' => $team->id,
            'member_id' => $member->id,
            'expertise' => Expertise::BackendEngineer,
            'score' => '4',
            'assessment' => 'Solid.',
        ]);

        return [$project, $member];
    }

    #[Test]
    public function a_guest_can_open_a_project_that_has_a_team(): void
    {
        [$project, $member] = $this->projectWithTeam();

        $this->getJson("/api/projects/{$project->project_url}")
            ->assertOk()
            ->assertJsonPath('team.members.0.user.tagname', $member->tagname)
            ->assertJsonPath('team.members.0.expertise', Expertise::BackendEngineer->value)
            ->assertJsonPath('team.members.0.score', '4');
    }

    #[Test]
    public function a_signed_in_user_sees_the_team_too(): void
    {
        [$project, $member] = $this->projectWithTeam();
        $viewer = User::factory()->student()->create();

        $this->withToken($viewer->createToken('t')->plainTextToken)
            ->getJson("/api/projects/{$project->project_url}")
            ->assertOk()
            ->assertJsonPath('team.members.0.user.name', $member->name);
    }

    #[Test]
    public function a_finished_project_exposes_its_review(): void
    {
        [$project] = $this->projectWithTeam();
        $project->update(['status' => ProjectStatus::Finished]);

        ProjectReview::create([
            'project_id' => $project->id,
            'overall_score' => '5',
            'overall_review' => 'Went well.',
        ]);

        $this->getJson("/api/projects/{$project->project_url}")
            ->assertOk()
            ->assertJsonPath('review.overall_score', '5')
            ->assertJsonPath('review.overall_review', 'Went well.');
    }
}
