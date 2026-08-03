<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * A one-time code handed back after an OAuth round trip.
 *
 * The API token is deliberately never put in the redirect URL: URLs end up in browser
 * history, server logs and `Referer` headers. Instead the callback stores the token
 * against a short-lived random code, and the frontend exchanges that code for it over
 * a POST from its own server.
 */
class SocialLoginCode
{
    private const PREFIX = 'social-login:';

    private const TTL_SECONDS = 120;

    public static function issue(User $user, string $token): string
    {
        $code = Str::random(64);

        Cache::put(self::PREFIX.hash('sha256', $code), [
            'user_id' => $user->id,
            'token' => $token,
        ], self::TTL_SECONDS);

        return $code;
    }

    /**
     * Redeem a code. Returns null if it is unknown, expired or already used.
     *
     * @return array{user_id: int, token: string}|null
     */
    public static function redeem(string $code): ?array
    {
        $key = self::PREFIX.hash('sha256', $code);
        $payload = Cache::get($key);

        // Single use: pull it before returning so a leaked code cannot be replayed.
        Cache::forget($key);

        return $payload;
    }
}
