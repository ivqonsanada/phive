<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        // This app has no session cookie, so channel authorisation has to go through
        // the same bearer token as the rest of the API. The browser never holds that
        // token — the frontend proxies this endpoint server-side.
        attributes: ['middleware' => ['auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Every supported deployment target — Fly, Railway, Render, a Cloudflare or
        // nginx front — puts this app behind a proxy that terminates TLS. Without
        // trusting it, `$request->ip()` is the proxy's address for everyone, so the
        // IP-keyed throttles on register and password reset become one shared global
        // limit, and `isSecure()` reports false behind HTTPS.
        //
        // Trusting `*` is right when the platform assigns proxy addresses you cannot
        // enumerate; set TRUSTED_PROXIES to a specific list if you run your own.
        $middleware->trustProxies(
            at: env('TRUSTED_PROXIES', '*'),
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO
                | Request::HEADER_X_FORWARDED_AWS_ELB,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Everything except the Filament panel is consumed by a machine. Without
        // `broadcasting/*` here an unauthenticated channel request tried to redirect
        // to a `login` route this app does not have, turning a 401 into a 500 — and
        // an HTML error page in place of JSON.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->is('broadcasting/*'),
        );
    })->create();
