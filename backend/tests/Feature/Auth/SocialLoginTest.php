<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\SocialAccount;
use App\Models\User;
use App\Support\SocialLoginCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SocialLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.google.client_id', 'test-client-id');
        config()->set('services.google.client_secret', 'test-secret');
    }

    private function fakeProviderUser(string $email, string $id = 'provider-123', string $name = 'Ada Lovelace'): void
    {
        $account = (new SocialiteUser)->map([
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'avatar' => 'https://example.com/a.jpg',
        ]);

        // Mock the driver explicitly rather than a `driver->user` chain: the chain
        // form does not match the argument the controller passes, and the resulting
        // exception is swallowed by the controller's catch.
        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->andReturn($account);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    #[Test]
    public function an_unconfigured_provider_is_unavailable(): void
    {
        config()->set('services.apple.client_id', null);

        $this->get('/auth/apple/redirect')->assertStatus(503);
    }

    #[Test]
    public function an_unknown_provider_is_a_404(): void
    {
        $this->get('/auth/myspace/redirect')->assertNotFound();
    }

    #[Test]
    public function a_first_time_sign_in_creates_a_verified_account(): void
    {
        $this->fakeProviderUser('ada@example.com');

        $response = $this->get('/auth/google/callback');

        $user = User::sole();

        $this->assertSame('Ada', $user->first_name);
        $this->assertSame('Lovelace', $user->last_name);
        $this->assertSame(UserRole::Student, $user->role);
        // The provider already proved control of the address.
        $this->assertTrue($user->hasVerifiedEmail());
        // No password: this account signs in through the provider.
        $this->assertNull($user->password);
        $this->assertNotNull($user->tagname);

        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => 'provider-123',
        ]);

        $response->assertRedirectContains(config('phive.frontend_url').'/auth/callback?code=');
    }

    #[Test]
    public function the_token_never_appears_in_the_redirect_url(): void
    {
        $this->fakeProviderUser('ada@example.com');

        $location = (string) $this->get('/auth/google/callback')->headers->get('Location');

        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);

        // URLs leak through history, logs and Referer headers, so the only thing that
        // may travel in one is the single-use code.
        $this->assertSame(['code'], array_keys($query));

        // And that code must not be the token itself.
        $token = SocialLoginCode::redeem($query['code'])['token'];
        $this->assertStringNotContainsString($token, $location);
    }

    #[Test]
    public function signing_in_again_reuses_the_same_account(): void
    {
        // One mock, two round trips — the second must find the existing link rather
        // than create a second account.
        $this->fakeProviderUser('ada@example.com');

        $this->get('/auth/google/callback')->assertRedirect();
        $this->forgetAuthState()->get('/auth/google/callback')->assertRedirect();

        $this->assertSame(1, User::count());
        $this->assertSame(1, SocialAccount::count());
    }

    #[Test]
    public function it_links_to_an_existing_account_with_the_same_email(): void
    {
        $existing = User::factory()->student()->create(['email' => 'ada@example.com']);
        $this->fakeProviderUser('ada@example.com');

        $this->get('/auth/google/callback');

        $this->assertSame(1, User::count());
        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $existing->id,
            'provider' => 'google',
        ]);
    }

    #[Test]
    public function a_provider_without_an_email_is_refused(): void
    {
        // Apple lets people hide their address.
        $this->fakeProviderUser('');

        $this->get('/auth/google/callback')
            ->assertRedirectContains('/login?error=social_no_email');

        $this->assertSame(0, User::count());
    }

    #[Test]
    public function the_code_exchanges_for_a_token_exactly_once(): void
    {
        $this->fakeProviderUser('ada@example.com');

        $location = $this->get('/auth/google/callback')->headers->get('Location');
        parse_str((string) parse_url((string) $location, PHP_URL_QUERY), $query);

        $this->postJson('/api/auth/exchange', ['code' => $query['code']])
            ->assertOk()
            ->assertJsonPath('user.email', 'ada@example.com')
            ->assertJsonStructure(['token']);

        // Replaying a leaked code must not work.
        $this->postJson('/api/auth/exchange', ['code' => $query['code']])
            ->assertStatus(422);
    }

    #[Test]
    public function an_unknown_code_is_refused(): void
    {
        $this->postJson('/api/auth/exchange', ['code' => str_repeat('a', 64)])
            ->assertStatus(422);
    }

    #[Test]
    public function the_exchanged_token_actually_authenticates(): void
    {
        $this->fakeProviderUser('ada@example.com');

        $location = $this->get('/auth/google/callback')->headers->get('Location');
        parse_str((string) parse_url((string) $location, PHP_URL_QUERY), $query);

        $token = $this->postJson('/api/auth/exchange', ['code' => $query['code']])->json('token');

        $this->forgetAuthState()->withToken($token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'ada@example.com');
    }

    #[Test]
    public function choosing_lecturer_with_a_personal_address_falls_back_to_student(): void
    {
        // Otherwise the academic-email rule could be sidestepped entirely by signing
        // up through a provider instead of the registration form.
        $this->withSession(['social_role' => UserRole::Lecturer->value]);
        $this->fakeProviderUser('someone@gmail.com');

        $this->get('/auth/google/callback');

        $this->assertSame(UserRole::Student, User::sole()->role);
    }

    #[Test]
    public function choosing_lecturer_with_an_academic_address_is_honoured(): void
    {
        $this->withSession(['social_role' => UserRole::Lecturer->value]);
        $this->fakeProviderUser('prof@example.ac.id');

        $this->get('/auth/google/callback');

        $this->assertSame(UserRole::Lecturer, User::sole()->role);
    }

    #[Test]
    public function a_code_cannot_be_redeemed_after_the_user_is_gone(): void
    {
        $user = User::factory()->create();
        $code = SocialLoginCode::issue($user, 'some-token');
        $user->delete();

        $this->postJson('/api/auth/exchange', ['code' => $code])->assertStatus(422);
    }

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }
}
