<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_student_can_toggle_a_project_on_and_off(): void
    {
        $student = User::factory()->student()->create();
        $project = Project::factory()->create();
        $token = $student->createToken('t')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/wishlist")
            ->assertOk()
            ->assertJsonPath('is_wished', true);

        $this->forgetAuthState()->withToken($token)
            ->postJson("/api/projects/{$project->project_url}/wishlist")
            ->assertOk()
            ->assertJsonPath('is_wished', false);

        // Toggling flips a single row rather than inserting a second one.
        $this->assertDatabaseCount('wishlists', 1);
    }

    #[Test]
    public function the_wishlist_lists_only_starred_projects(): void
    {
        $student = User::factory()->student()->create();
        $starred = Project::factory()->create();
        Project::factory()->create();
        $token = $student->createToken('t')->plainTextToken;

        $this->withToken($token)->postJson("/api/projects/{$starred->project_url}/wishlist");

        $this->forgetAuthState()->withToken($token)
            ->getJson('/api/wishlist')
            ->assertOk()
            ->assertJsonCount(1, 'projects')
            ->assertJsonPath('projects.0.id', $starred->id);
    }

    #[Test]
    public function lecturers_do_not_have_a_wishlist(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $project = Project::factory()->create();

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/projects/{$project->project_url}/wishlist")
            ->assertForbidden();
    }

    #[Test]
    public function guests_cannot_toggle(): void
    {
        $project = Project::factory()->create();

        $this->postJson("/api/projects/{$project->project_url}/wishlist")->assertUnauthorized();
    }
}
