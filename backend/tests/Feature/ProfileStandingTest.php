<?php

namespace Tests\Feature;

use App\Enums\Expertise;
use App\Enums\Level;
use App\Models\Leaderboard;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Points and the standing they earn are shown on a student's profile.
 *
 * Points are awarded per expertise, so a student reviewed in different roles holds
 * several rows. "Points collected" has always meant the best of them.
 */
class ProfileStandingTest extends TestCase
{
    use RefreshDatabase;

    private function student(string $tagname): User
    {
        return User::factory()->student()->create(['tagname' => $tagname]);
    }

    #[Test]
    public function a_profile_reports_the_best_board_not_an_arbitrary_one(): void
    {
        // The relation used to be a hasOne, which returned whichever row came back
        // first — here the weaker one, because it is inserted first.
        $user = $this->student('ada');
        Leaderboard::create([
            'user_id' => $user->id,
            'expertise' => Expertise::UiUxDesigner,
            'points' => 400,
        ]);
        Leaderboard::create([
            'user_id' => $user->id,
            'expertise' => Expertise::BackendEngineer,
            'points' => 9_000,
        ]);

        $this->getJson('/api/users/ada')
            ->assertOk()
            ->assertJsonPath('user.points', 9_000)
            ->assertJsonPath('user.level', Level::Superior->value)
            ->assertJsonPath('user.leaderboards.0.points', 9_000)
            ->assertJsonPath('user.leaderboards.1.points', 400)
            ->assertJsonCount(2, 'user.leaderboards');
    }

    #[Test]
    public function a_student_with_no_boards_has_no_points_and_is_a_rookie(): void
    {
        $this->student('newcomer');

        $this->getJson('/api/users/newcomer')
            ->assertOk()
            ->assertJsonPath('user.points', 0)
            ->assertJsonPath('user.level', Level::Rookie->value)
            ->assertJsonCount(0, 'user.leaderboards');
    }

    #[Test]
    public function the_board_rows_never_carry_the_internal_id(): void
    {
        $user = $this->student('grace');
        Leaderboard::create([
            'user_id' => $user->id,
            'expertise' => Expertise::DataExpert,
            'points' => 10,
        ]);

        $board = $this->getJson('/api/users/grace')->json('user.leaderboards.0');

        $this->assertSame(['uuid', 'expertise', 'points'], array_keys($board));
    }

    /**
     * The boundaries are the whole point of the thresholds, so each one is pinned at
     * the value that sits on it and the value just below.
     */
    #[Test]
    #[DataProvider('standings')]
    public function points_map_to_a_standing(int $points, Level $expected): void
    {
        $this->assertSame($expected, Level::forPoints($points));
    }

    /**
     * @return array<string, array{int, Level}>
     */
    public static function standings(): array
    {
        return [
            'nothing yet' => [0, Level::Rookie],
            'just under amateur' => [2_500, Level::Rookie],
            'exactly amateur' => [2_501, Level::Amateur],
            'just under superior' => [7_500, Level::Amateur],
            'exactly superior' => [7_501, Level::Superior],
            'just under expert' => [15_000, Level::Superior],
            'exactly expert' => [15_001, Level::Expert],
            'well past expert' => [999_999, Level::Expert],
        ];
    }
}
