<?php

namespace Tests\Feature\Settings;

use App\Enums\Expertise;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_user_can_update_their_profile(): void
    {
        $user = User::factory()->student()->create(['biography' => 'Old bio']);

        $this->withToken($user->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', [
                'biography' => 'New bio',
                'location' => 'Bandung',
                'expertise' => Expertise::DataExpert->value,
                'github' => 'https://github.com/example',
            ])
            ->assertOk()
            ->assertJsonPath('user.biography', 'New bio')
            ->assertJsonPath('user.links.github', 'https://github.com/example');

        $this->assertSame('Bandung', $user->fresh()->location);
    }

    #[Test]
    public function omitted_fields_are_left_alone(): void
    {
        $user = User::factory()->student()->create([
            'biography' => 'Keep me',
            'location' => 'Keep me too',
        ]);

        $this->withToken($user->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', ['location' => 'Jakarta'])
            ->assertOk();

        $fresh = $user->fresh();
        $this->assertSame('Keep me', $fresh->biography);
        $this->assertSame('Jakarta', $fresh->location);
    }

    #[Test]
    public function skills_are_replaced_as_a_whole_list(): void
    {
        $user = User::factory()->student()->create();
        UserSkill::create(['user_id' => $user->id, 'name' => 'Vue']);

        $this->withToken($user->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', ['skills' => ['React', 'Postgres']])
            ->assertOk()
            ->assertJsonPath('user.skills', ['React', 'Postgres']);

        $this->assertSame(2, UserSkill::where('user_id', $user->id)->count());
    }

    #[Test]
    public function a_handle_must_be_unique_and_url_safe(): void
    {
        User::factory()->create(['tagname' => 'taken']);
        $user = User::factory()->create();
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)
            ->patchJson('/api/settings/profile', ['tagname' => 'taken'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('tagname');

        $this->forgetAuthState()->withToken($token)
            ->patchJson('/api/settings/profile', ['tagname' => 'Not Valid!'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('tagname');
    }

    #[Test]
    public function keeping_your_own_handle_is_not_a_conflict(): void
    {
        $user = User::factory()->create(['tagname' => 'mine']);

        $this->withToken($user->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', ['tagname' => 'mine', 'location' => 'Bogor'])
            ->assertOk();
    }

    #[Test]
    public function links_must_be_urls(): void
    {
        $user = User::factory()->create();

        $this->withToken($user->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', ['website' => 'not a url'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('website');
    }

    #[Test]
    public function guests_cannot_update_a_profile(): void
    {
        $this->patchJson('/api/settings/profile', ['location' => 'Nowhere'])
            ->assertUnauthorized();
    }
}
