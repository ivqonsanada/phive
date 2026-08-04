<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Drop the auth guard's cached user.
     *
     * The whole test runs in one application instance, so a guard that resolved a
     * user on an earlier request keeps returning it — hiding token revocation that
     * a real client, on a fresh process per request, would see immediately.
     */
    protected function forgetAuthState(): static
    {
        $this->app['auth']->forgetGuards();

        return $this;
    }
}
