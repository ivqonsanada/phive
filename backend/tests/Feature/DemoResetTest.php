<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DemoResetTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_refuses_to_run_when_demo_mode_is_off(): void
    {
        config()->set('phive.demo_mode', false);

        $user = User::factory()->create();

        $this->artisan('phive:demo-reset --force')
            ->expectsOutputToContain('DEMO_MODE is not enabled')
            ->assertExitCode(1);

        // The whole point: nothing was touched.
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    #[Test]
    public function demo_mode_is_off_unless_explicitly_enabled(): void
    {
        // A production instance must never inherit this by accident.
        $this->assertFalse(config('phive.demo_mode'));
    }

    #[Test]
    public function the_nightly_schedule_only_exists_in_demo_mode(): void
    {
        $commands = collect(app(Schedule::class)->events())
            ->map(fn ($event) => $event->command ?? '')
            ->filter(fn (string $command) => str_contains($command, 'demo-reset'));

        $this->assertCount(0, $commands, 'The reset must not be scheduled outside demo mode.');
    }
}
