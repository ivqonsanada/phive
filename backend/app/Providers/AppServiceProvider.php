<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Apple\AppleExtendSocialite;
use SocialiteProviders\Manager\SocialiteWasCalled;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Model::shouldBeStrict(! $this->app->isProduction());

        // A resource returned directly would otherwise be nested under "data" while the
        // same resource embedded in a response array would not. The frontend's typed
        // client expects one shape, so drop the wrapper everywhere.
        JsonResource::withoutWrapping();

        // Apple is a community Socialite provider and has to register itself.
        Event::listen(SocialiteWasCalled::class, [AppleExtendSocialite::class, 'handle']);

        $this->configureNotificationLinks();
    }

    /**
     * Emails are read by humans, who should land in the Next.js app — not on a JSON
     * endpoint. Both links carry the API payload the frontend needs to replay.
     */
    private function configureNotificationLinks(): void
    {
        $frontend = config('phive.frontend_url');

        VerifyEmail::createUrlUsing(function (User $user) use ($frontend): string {
            $signedApiUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(config('auth.verification.expire', 60)),
                [
                    'id' => $user->getKey(),
                    'hash' => sha1($user->getEmailForVerification()),
                ],
            );

            return $frontend.'/email/verify?'.http_build_query(['url' => $signedApiUrl]);
        });

        ResetPassword::createUrlUsing(fn (User $user, string $token): string => $frontend.'/password/reset?'.http_build_query([
            'token' => $token,
            'email' => $user->getEmailForPasswordReset(),
        ]));
    }
}
