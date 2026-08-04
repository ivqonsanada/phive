<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Behind a proxy every request arrives from the proxy's address. If that is not
 * trusted, the IP-keyed rate limits collapse into one global bucket shared by every
 * visitor, and the app thinks HTTPS traffic is plaintext.
 */
class TrustedProxyTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function the_forwarded_client_address_is_used(): void
    {
        $this->get('/up', ['X-Forwarded-For' => '203.0.113.9']);

        $this->assertSame('203.0.113.9', request()->ip());
    }

    #[Test]
    public function two_clients_behind_one_proxy_are_told_apart(): void
    {
        // This is what keeps one visitor's failed logins from throttling everyone.
        $this->get('/up', ['X-Forwarded-For' => '198.51.100.1']);
        $first = request()->ip();

        $this->get('/up', ['X-Forwarded-For' => '198.51.100.2']);
        $second = request()->ip();

        $this->assertNotSame($first, $second);
    }

    #[Test]
    public function a_forwarded_https_request_is_recognised_as_secure(): void
    {
        $this->get('/up', ['X-Forwarded-Proto' => 'https']);

        $this->assertTrue(request()->isSecure());
    }
}
