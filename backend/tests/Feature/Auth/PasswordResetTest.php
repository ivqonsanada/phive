<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_emails_a_reset_link_pointing_at_the_frontend(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/password/email', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $url = $notification->toMail($user)->actionUrl;

            return str_starts_with($url, config('phive.frontend_url').'/password/reset?');
        });
    }

    #[Test]
    public function it_does_not_reveal_whether_an_address_exists(): void
    {
        Notification::fake();

        $this->postJson('/api/password/email', ['email' => 'nobody@example.com'])
            ->assertOk()
            ->assertJsonPath('message', 'If that address belongs to an account, a reset link is on its way.');
    }

    #[Test]
    public function it_resets_the_password_and_revokes_existing_tokens(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $staleToken = $user->createToken('old-device')->plainTextToken;

        $this->postJson('/api/password/email', ['email' => $user->email]);

        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use (&$token) {
            $token = $notification->token;

            return true;
        });

        $this->postJson('/api/password/reset', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'a-brand-new-password',
            'password_confirmation' => 'a-brand-new-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('a-brand-new-password', $user->fresh()->password));
        $this->forgetAuthState()->withToken($staleToken)->getJson('/api/user')->assertUnauthorized();
    }

    #[Test]
    public function changing_the_password_keeps_the_current_device_signed_in(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password')]);
        $other = $user->createToken('other-device')->plainTextToken;
        $current = $user->createToken('this-device')->plainTextToken;

        $this->withToken($current)->patchJson('/api/settings/password', [
            'current_password' => 'old-password',
            'password' => 'a-brand-new-password',
            'password_confirmation' => 'a-brand-new-password',
        ])->assertOk();

        $this->forgetAuthState()->withToken($current)->getJson('/api/user')->assertOk();
        $this->forgetAuthState()->withToken($other)->getJson('/api/user')->assertUnauthorized();
    }
}
