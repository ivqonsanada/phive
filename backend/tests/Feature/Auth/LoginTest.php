<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_issues_a_token_for_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret-password')]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'secret-password',
            'device_name' => 'integration-test',
        ])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonStructure(['token']);

        $this->assertSame('integration-test', $user->tokens()->sole()->name);
    }

    #[Test]
    public function it_rejects_a_wrong_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret-password')]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'not-the-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertSame(0, $user->tokens()->count());
    }

    #[Test]
    public function it_throttles_repeated_failures(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret-password')]);

        foreach (range(1, 5) as $ignored) {
            $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong']);
        }

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertStatus(429);
    }

    #[Test]
    public function logging_out_revokes_only_the_current_token(): void
    {
        $user = User::factory()->create();
        $keep = $user->createToken('other-device')->plainTextToken;
        $current = $user->createToken('this-device')->plainTextToken;

        $this->withToken($current)->postJson('/api/logout')->assertOk();

        $this->assertSame(1, $user->tokens()->count());
        $this->forgetAuthState()->withToken($current)->getJson('/api/user')->assertUnauthorized();
        $this->forgetAuthState()->withToken($keep)->getJson('/api/user')->assertOk();
    }

    #[Test]
    public function the_user_endpoint_requires_a_token(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }
}
