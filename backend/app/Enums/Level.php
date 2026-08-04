<?php

namespace App\Enums;

/**
 * A student's standing, derived from the best of their leaderboard scores.
 *
 * The thresholds are carried over from the original PHive, which computed them in the
 * profile component. They live here instead so the API, the admin panel and any future
 * client all read the same boundaries.
 */
enum Level: string
{
    case Rookie = 'Rookie';
    case Amateur = 'Amateur';
    case Superior = 'Superior';
    case Expert = 'Expert';

    public static function forPoints(int $points): self
    {
        return match (true) {
            $points < 2_501 => self::Rookie,
            $points < 7_501 => self::Amateur,
            $points < 15_001 => self::Superior,
            default => self::Expert,
        };
    }
}
