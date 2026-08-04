<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Private channels carry direct messages. The channel callback and the frontend's
 * auth proxy were written separately, so this pins the thing that matters: the
 * channel you get is decided by your token, never by what you ask for.
 */
class BroadcastAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        // phpunit.xml runs with the null broadcaster, which does not check channels at
        // all. This has to be set *before* the app boots: channels are registered onto
        // whichever broadcaster is resolved at boot, so flipping the config afterwards
        // gives a driver with no channels and everything 403s — which looks like the
        // authorization working when it is really measuring nothing.
        putenv('BROADCAST_CONNECTION=reverb');
        $_ENV['BROADCAST_CONNECTION'] = 'reverb';
        $_SERVER['BROADCAST_CONNECTION'] = 'reverb';
        putenv('REVERB_APP_KEY=test-key');
        $_ENV['REVERB_APP_KEY'] = 'test-key';
        putenv('REVERB_APP_SECRET=test-secret');
        $_ENV['REVERB_APP_SECRET'] = 'test-secret';
        putenv('REVERB_APP_ID=test-app');
        $_ENV['REVERB_APP_ID'] = 'test-app';

        parent::setUp();
    }

    protected function tearDown(): void
    {
        foreach (['BROADCAST_CONNECTION', 'REVERB_APP_KEY', 'REVERB_APP_SECRET', 'REVERB_APP_ID'] as $key) {
            putenv($key);
            unset($_ENV[$key], $_SERVER[$key]);
        }

        parent::tearDown();
    }

    private function authorize(string $token, string $channel)
    {
        return $this->withToken($token)->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => $channel,
        ]);
    }

    #[Test]
    public function a_user_can_subscribe_to_their_own_channel(): void
    {
        $user = User::factory()->create();

        $this->authorize($user->createToken('t')->plainTextToken, "private-user.{$user->uuid}")
            ->assertOk()
            ->assertJsonStructure(['auth']);
    }

    #[Test]
    public function a_user_cannot_subscribe_to_someone_elses_channel(): void
    {
        // This is the whole game: subscribing to another person's channel would
        // stream their direct messages.
        $eavesdropper = User::factory()->create();
        $victim = User::factory()->create();

        $this->authorize(
            $eavesdropper->createToken('t')->plainTextToken,
            "private-user.{$victim->uuid}",
        )->assertForbidden();
    }

    #[Test]
    public function a_guest_cannot_subscribe_to_anything(): void
    {
        $user = User::factory()->create();

        $this->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => "private-user.{$user->uuid}",
        ])->assertUnauthorized();
    }

    #[Test]
    public function an_unknown_channel_is_refused(): void
    {
        $user = User::factory()->create();

        $this->authorize($user->createToken('t')->plainTextToken, 'private-user.not-a-real-uuid')
            ->assertForbidden();
    }

    #[Test]
    public function the_internal_id_is_not_a_valid_channel_key(): void
    {
        // The channel is keyed on the public UUID; guessing a row number must not work.
        $user = User::factory()->create();

        $this->authorize($user->createToken('t')->plainTextToken, "private-user.{$user->id}")
            ->assertForbidden();
    }
}
