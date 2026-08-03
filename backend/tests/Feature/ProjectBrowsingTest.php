<?php

namespace Tests\Feature;

use App\Enums\Expertise;
use App\Models\Project;
use App\Models\ProjectRequirement;
use App\Models\ProjectSkill;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProjectBrowsingTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function guests_can_browse_published_projects(): void
    {
        Project::factory()->count(3)->create();
        Project::factory()->draft()->create();

        $response = $this->getJson('/api/projects');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data' => [['uuid', 'title', 'project_url', 'user' => ['tagname']]]]);
    }

    #[Test]
    public function drafts_are_not_reachable_by_url(): void
    {
        $draft = Project::factory()->draft()->create(['project_url' => 'secret-draft']);

        $this->getJson("/api/projects/{$draft->project_url}")->assertNotFound();
    }

    #[Test]
    public function it_searches_title_and_description_case_insensitively(): void
    {
        Project::factory()->create(['title' => 'Campus Wayfinding App']);
        Project::factory()->create(['title' => 'Library Kiosk', 'description' => 'A WAYFINDING kiosk.']);
        Project::factory()->create(['title' => 'Unrelated Thing', 'description' => 'Nothing to see.']);

        $this->getJson('/api/projects?query=wayfinding')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function it_filters_by_expertise(): void
    {
        Project::factory()->create(['data_expert' => true, 'ui_ux_designer' => false]);
        Project::factory()->create(['data_expert' => false, 'ui_ux_designer' => true]);

        $this->getJson('/api/projects?expertise='.urlencode(Expertise::DataExpert->value))
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    #[Test]
    public function it_rejects_an_unknown_expertise(): void
    {
        $this->getJson('/api/projects?expertise=Wizard')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('expertise');
    }

    #[Test]
    public function the_detail_endpoint_includes_skills_and_requirements(): void
    {
        $project = Project::factory()->create();
        ProjectSkill::create(['project_id' => $project->id, 'name' => 'Laravel']);
        ProjectRequirement::create(['project_id' => $project->id, 'requirement' => 'Ship weekly']);

        $this->getJson("/api/projects/{$project->project_url}")
            ->assertOk()
            ->assertJsonPath('skills.0', 'Laravel')
            ->assertJsonPath('requirements.0', 'Ship weekly')
            ->assertJsonPath('title', $project->title);
    }

    #[Test]
    public function looking_for_reflects_the_expertise_flags(): void
    {
        $project = Project::factory()->create([
            'ui_ux_designer' => true,
            'front_end_engineer' => false,
            'back_end_engineer' => true,
            'data_expert' => false,
        ]);

        $this->getJson("/api/projects/{$project->project_url}")
            ->assertOk()
            ->assertJsonPath('looking_for', ['UI/UX Designer', 'Backend Engineer']);
    }

    #[Test]
    public function guests_do_not_get_a_wishlist_flag(): void
    {
        $project = Project::factory()->create();

        $this->getJson("/api/projects/{$project->project_url}")
            ->assertOk()
            ->assertJsonMissingPath('is_wished');
    }

    #[Test]
    public function a_signed_in_student_sees_their_own_wishlist_flag(): void
    {
        $project = Project::factory()->create();
        $wisher = User::factory()->student()->create();
        $other = User::factory()->student()->create();

        Wishlist::create(['user_id' => $wisher->id, 'project_id' => $project->id, 'status' => true]);

        $this->withToken($wisher->createToken('t')->plainTextToken)
            ->getJson("/api/projects/{$project->project_url}")
            ->assertOk()
            ->assertJsonPath('is_wished', true);

        $this->forgetAuthState()
            ->withToken($other->createToken('t')->plainTextToken)
            ->getJson("/api/projects/{$project->project_url}")
            ->assertOk()
            ->assertJsonPath('is_wished', false);
    }

    #[Test]
    public function similar_projects_match_the_viewers_expertise(): void
    {
        $project = Project::factory()->create();
        Project::factory()->count(2)->create(['data_expert' => true]);
        Project::factory()->count(2)->create([
            'data_expert' => false,
            'ui_ux_designer' => true,
        ]);

        $student = User::factory()->student()->create(['expertise' => Expertise::DataExpert]);

        $response = $this->withToken($student->createToken('t')->plainTextToken)
            ->getJson("/api/projects/{$project->project_url}/similar")
            ->assertOk();

        // Resource wrapping is off, so a non-paginated collection is a bare array.
        $this->assertNotEmpty($response->json());

        foreach ($response->json() as $similar) {
            $this->assertContains('Data Expert', $similar['looking_for']);
            $this->assertNotSame($project->uuid, $similar['uuid']);
        }
    }
}
