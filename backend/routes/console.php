<?php

use Illuminate\Support\Facades\Schedule;

// Put the demo site back to a known state every night. The command itself refuses to
// run unless DEMO_MODE is on, so this schedule is inert everywhere else — but it is
// also only registered when the flag is set, which keeps `schedule:list` honest.
if (config('phive.demo_mode')) {
    Schedule::command('phive:demo-reset --force')
        ->dailyAt(config('phive.demo_reset_at'))
        ->timezone(config('app.timezone'))
        ->withoutOverlapping()
        ->onOneServer();
}
