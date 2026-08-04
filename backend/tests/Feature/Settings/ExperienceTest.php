<?php

namespace Tests\Feature\Settings;

use App\Models\Experience;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ExperienceTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_user_can_add_edit_and_remove_an_experience(): void
    {
        $user = User::factory()->student()->create();
        $token = $user->createToken('t')->plainTextToken;

        $uuid = $this->withToken($token)
            ->postJson('/api/settings/experiences', [
                'project_name' => 'Campus App',
                'project_role' => 'Frontend Engineer',
                'start_date' => '2025-01-01',
            ])
            ->assertCreated()
            ->json('experience.uuid');

        $this->forgetAuthState()->withToken($token)
            ->patchJson("/api/settings/experiences/$uuid", [
                'project_name' => 'Campus App v2',
                'project_role' => 'Lead',
                'start_date' => '2025-01-01',
                'end_date' => '2025-06-01',
            ])
            ->assertOk()
            ->assertJsonPath('experience.project_name', 'Campus App v2');

        $this->forgetAuthState()->withToken($token)
            ->deleteJson("/api/settings/experiences/$uuid")
            ->assertOk();

        $this->assertDatabaseMissing('experiences', ['uuid' => $uuid]);
    }

    #[Test]
    public function an_end_date_cannot_precede_the_start(): void
    {
        $user = User::factory()->student()->create();

        $this->withToken($user->createToken('t')->plainTextToken)
            ->postJson('/api/settings/experiences', [
                'project_name' => 'Backwards',
                'project_role' => 'Time traveller',
                'start_date' => '2025-06-01',
                'end_date' => '2025-01-01',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('end_date');
    }

    #[Test]
    public function you_cannot_touch_someone_elses_experience(): void
    {
        $owner = User::factory()->student()->create();
        $intruder = User::factory()->student()->create();

        $experience = Experience::create([
            'user_id' => $owner->id,
            'project_name' => 'Private',
            'project_role' => 'Owner',
            'start_date' => '2025-01-01',
        ]);

        $token = $intruder->createToken('t')->plainTextToken;

        $this->withToken($token)
            ->patchJson("/api/settings/experiences/{$experience->uuid}", [
                'project_name' => 'Stolen',
                'project_role' => 'Thief',
                'start_date' => '2025-01-01',
            ])
            ->assertForbidden();

        $this->forgetAuthState()->withToken($token)
            ->deleteJson("/api/settings/experiences/{$experience->uuid}")
            ->assertForbidden();

        $this->assertDatabaseHas('experiences', ['id' => $experience->id, 'project_name' => 'Private']);
    }
}
