<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_signed_link_verifies_the_address(): void
    {
        $user = User::factory()->unverified()->create();

        $this->getJson($this->verificationUrl($user))->assertOk();

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    #[Test]
    public function an_unsigned_link_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        $this->getJson("/api/email/verify/{$user->id}/".sha1($user->email))
            ->assertForbidden();

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    #[Test]
    public function a_link_for_a_different_address_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addHour(), [
            'id' => $user->id,
            'hash' => sha1('someone-else@example.com'),
        ]);

        $this->getJson($url)->assertForbidden();

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    private function verificationUrl(User $user): string
    {
        return URL::temporarySignedRoute('verification.verify', now()->addHour(), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);
    }
}
