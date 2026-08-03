<?php

namespace Tests\Feature;

use App\Enums\ProjectBoxStatus;
use App\Models\Project;
use App\Models\ProjectBox;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_lecturer_profile_lists_the_projects_they_published(): void
    {
        $lecturer = User::factory()->lecturer()->create(['tagname' => 'prof']);
        Project::factory()->count(2)->create(['user_id' => $lecturer->id]);
        Project::factory()->create();

        $this->getJson('/api/users/prof')
            ->assertOk()
            ->assertJsonPath('user.tagname', 'prof')
            ->assertJsonCount(2, 'projects');
    }

    #[Test]
    public function a_student_profile_lists_only_finished_work(): void
    {
        $student = User::factory()->student()->create(['tagname' => 'ada']);
        $finished = Project::factory()->create();
        $ongoing = Project::factory()->create();

        ProjectBox::create([
            'project_id' => $finished->id,
            'user_id' => $student->id,
            'status' => ProjectBoxStatus::Finished,
        ]);
        ProjectBox::create([
            'project_id' => $ongoing->id,
            'user_id' => $student->id,
            'status' => ProjectBoxStatus::Ongoing,
        ]);

        $this->getJson('/api/users/ada')
            ->assertOk()
            ->assertJsonCount(1, 'projects')
            ->assertJsonPath('projects.0.id', $finished->id);
    }

    #[Test]
    public function it_includes_skills_and_hides_the_password(): void
    {
        $user = User::factory()->create(['tagname' => 'grace']);
        UserSkill::create(['user_id' => $user->id, 'name' => 'Postgres']);

        $this->getJson('/api/users/grace')
            ->assertOk()
            ->assertJsonPath('user.skills.0', 'Postgres')
            ->assertJsonMissingPath('user.password');
    }

    #[Test]
    public function an_unknown_tagname_is_a_404(): void
    {
        $this->getJson('/api/users/nobody')->assertNotFound();
    }
}
