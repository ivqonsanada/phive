<?php

namespace App\Http\Controllers\Api\Auth;

use App\Enums\SocialProvider;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\SocialAccount;
use App\Models\User;
use App\Support\SocialLoginCode;
use App\Support\Tagname;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

class SocialAuthController extends Controller
{
    /**
     * Send the browser to the provider.
     *
     * The role the visitor picked on the sign-up page is remembered in the session for
     * the length of the round trip — the provider will not tell us whether someone
     * meant to join as a student or a lecturer.
     */
    public function redirect(Request $request, string $provider): RedirectResponse
    {
        $social = $this->provider($provider);

        $role = UserRole::tryFrom((string) $request->query('role')) ?? UserRole::Student;
        $request->session()->put('social_role', $role->value);

        return Socialite::driver($social->value)->redirect();
    }

    /**
     * Handle the provider's callback, then bounce back to the frontend with a
     * single-use code rather than the token itself.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        $social = $this->provider($provider);
        $frontend = config('phive.frontend_url');

        try {
            /** @var SocialiteUser $account */
            $account = Socialite::driver($social->value)->user();
        } catch (\Throwable) {
            return redirect()->away($frontend.'/login?error=social');
        }

        if (blank($account->getEmail())) {
            // Apple lets people hide their address; without one we cannot match or
            // create an account, so say so rather than failing obscurely.
            return redirect()->away($frontend.'/login?error=social_no_email');
        }

        $intendedRole = UserRole::tryFrom((string) $request->session()->pull('social_role'))
            ?? UserRole::Student;

        $user = $this->resolveUser($social, $account, $intendedRole);

        $token = $user->createToken('phive-web-'.$social->value)->plainTextToken;
        $code = SocialLoginCode::issue($user, $token);

        return redirect()->away($frontend.'/auth/callback?code='.$code);
    }

    /**
     * Swap the one-time code for the API token. Called by the frontend's server, not
     * by the browser.
     */
    public function exchange(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        $payload = SocialLoginCode::redeem($request->string('code')->toString());

        if (! $payload) {
            return response()->json(['message' => 'That sign-in link has expired.'], 422);
        }

        $user = User::find($payload['user_id']);

        if (! $user) {
            return response()->json(['message' => 'That account no longer exists.'], 422);
        }

        return response()->json([
            'user' => new UserResource($user),
            'token' => $payload['token'],
        ]);
    }

    /**
     * Find the account this provider identity belongs to, linking or creating one.
     */
    private function resolveUser(
        SocialProvider $provider,
        SocialiteUser $account,
        UserRole $intendedRole,
    ): User {
        $existingLink = SocialAccount::where([
            'provider' => $provider->value,
            'provider_id' => $account->getId(),
        ])->first();

        if ($existingLink) {
            return $existingLink->user;
        }

        return DB::transaction(function () use ($provider, $account, $intendedRole) {
            // Matching on a verified provider email links to the existing account
            // rather than creating a duplicate one.
            $user = User::firstWhere('email', $account->getEmail());

            if (! $user) {
                $name = trim((string) $account->getName());
                [$first, $last] = $this->splitName($name, $account->getNickname());

                $user = User::create([
                    'first_name' => $first,
                    'last_name' => $last,
                    'email' => $account->getEmail(),
                    'role' => $this->allowedRole($intendedRole, $account->getEmail()),
                    'tagname' => Tagname::generate($name ?: $account->getEmail()),
                    // No password: this account signs in through the provider. A
                    // password can be set later through the reset flow.
                    'password' => null,
                ]);

                // The provider already proved they control the address. Set outside
                // the create() call deliberately — `email_verified_at` is not mass
                // assignable, and it should stay that way.
                $user->markEmailAsVerified();
            }

            SocialAccount::create([
                'user_id' => $user->id,
                'provider' => $provider->value,
                'provider_id' => $account->getId(),
                'avatar' => $account->getAvatar(),
            ]);

            return $user;
        });
    }

    /**
     * The lecturer email rule still applies to social sign-ups — otherwise it would be
     * trivial to sidestep by choosing "lecturer" and signing in with a personal Gmail.
     */
    private function allowedRole(UserRole $intended, string $email): UserRole
    {
        if ($intended !== UserRole::Lecturer) {
            return UserRole::Student;
        }

        $pattern = config('phive.lecturer_email_pattern');

        return ! $pattern || preg_match($pattern, $email)
            ? UserRole::Lecturer
            : UserRole::Student;
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function splitName(string $name, ?string $nickname): array
    {
        if ($name === '') {
            return [$nickname ?: 'New', 'User'];
        }

        $parts = preg_split('/\s+/', $name) ?: [$name];
        $first = array_shift($parts);

        return [$first, implode(' ', $parts)];
    }

    private function provider(string $provider): SocialProvider
    {
        $social = SocialProvider::tryFrom($provider);

        abort_unless($social, 404);
        abort_unless($social->isConfigured(), 503, "{$social->label()} sign-in is not configured.");

        return $social;
    }
}
