<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CurrentUserTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_returns_the_user_unwrapped(): void
    {
        $user = User::factory()->create(['first_name' => 'Ada', 'last_name' => 'Lovelace']);
        UserSkill::create(['user_id' => $user->id, 'name' => 'Laravel']);

        $response = $this->withToken($user->createToken('test')->plainTextToken)
            ->getJson('/api/user');

        // Not nested under "data" — the frontend's typed client reads these at the top level.
        $response->assertOk()
            ->assertJsonPath('tagname', $user->tagname)
            ->assertJsonPath('name', 'Ada Lovelace')
            ->assertJsonPath('skills.0', 'Laravel')
            ->assertJsonMissingPath('data');
    }

    #[Test]
    public function it_counts_only_unread_inbox_items(): void
    {
        $user = User::factory()->create();

        $this->withToken($user->createToken('test')->plainTextToken)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('unread_inbox_count', 0);
    }

    #[Test]
    public function it_never_exposes_the_password_hash(): void
    {
        $user = User::factory()->create();

        $this->withToken($user->createToken('test')->plainTextToken)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonMissingPath('password')
            ->assertJsonMissingPath('remember_token');
    }
}
