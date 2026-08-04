<?php

namespace Tests\Feature\Settings;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The profile endpoint takes a partial update of whatever the form sends, which makes
 * it the natural place to try to grant yourself something. These are the fields that
 * must never be settable by their owner, pinned so a later edit to the form request
 * cannot quietly open one up.
 */
class PrivilegeEscalationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_user_cannot_make_themselves_an_administrator(): void
    {
        $user = User::factory()->student()->create(['is_admin' => false]);

        $this->withToken($user->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', [
                'location' => 'Bandung',
                'is_admin' => true,
            ])
            ->assertOk();

        $this->assertFalse($user->fresh()->is_admin, 'A user granted themselves the admin panel.');
    }

    #[Test]
    public function a_student_cannot_promote_themselves_to_lecturer(): void
    {
        // Lecturers publish projects and hire students, so this is a real boundary
        // and not just a label.
        $student = User::factory()->student()->create();

        $this->withToken($student->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', [
                'location' => 'Malang',
                'role' => UserRole::Lecturer->value,
            ])
            ->assertOk();

        $this->assertSame(UserRole::Student, $student->fresh()->role);
    }

    #[Test]
    public function a_user_cannot_change_their_email_through_the_profile(): void
    {
        // Changing it here would sidestep verification and could take over an
        // address someone else is waiting to register.
        $user = User::factory()->create(['email' => 'original@example.com']);

        $this->withToken($user->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', ['email' => 'attacker@example.com'])
            ->assertOk();

        $this->assertSame('original@example.com', $user->fresh()->email);
    }

    #[Test]
    public function a_user_cannot_set_their_password_through_the_profile(): void
    {
        $user = User::factory()->create();
        $original = $user->password;

        $this->withToken($user->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', ['password' => 'not-my-password'])
            ->assertOk();

        $this->assertSame($original, $user->fresh()->password);
    }

    #[Test]
    public function a_user_cannot_mark_their_own_email_verified(): void
    {
        $user = User::factory()->unverified()->create();

        $this->withToken($user->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', ['email_verified_at' => now()->toDateTimeString()])
            ->assertOk();

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    #[Test]
    public function a_user_cannot_award_themselves_leaderboard_points(): void
    {
        $student = User::factory()->student()->create();

        $this->withToken($student->createToken('t')->plainTextToken)
            ->patchJson('/api/settings/profile', ['points' => 99999])
            ->assertOk();

        $this->assertDatabaseCount('leaderboards', 0);
    }

    #[Test]
    public function registering_cannot_grant_the_admin_flag(): void
    {
        // The register endpoint builds the user from validated input too.
        $this->postJson('/api/register', [
            'first_name' => 'Sneaky',
            'last_name' => 'Signup',
            'role' => UserRole::Student->value,
            'email' => 'sneaky@example.com',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
            'is_admin' => true,
        ])->assertCreated();

        $this->assertFalse(User::firstWhere('email', 'sneaky@example.com')->is_admin);
    }
}
