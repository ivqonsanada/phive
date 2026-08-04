<?php

namespace App\Enums;

/**
 * Difficulty of a project, which sets the pool of leaderboard points it can award.
 */
enum ProjectLevel: string
{
    case Easy = 'Easy';
    case Medium = 'Medium';
    case Hard = 'Hard';
    case Expert = 'Expert';

    public function points(): int
    {
        return match ($this) {
            self::Easy => 2000,
            self::Medium => 2500,
            self::Hard => 4000,
            self::Expert => 5000,
        };
    }

    /**
     * Points a participant earns: the project's pool scaled by how well the project
     * went overall and how well that person did, both out of five.
     */
    public function award(float $overallScore, float $memberScore): int
    {
        return (int) round(($overallScore / 5) * ($memberScore / 5) * $this->points());
    }
}
