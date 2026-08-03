<?php

namespace Tests\Feature;

use App\Enums\Expertise;
use App\Enums\ProjectStatus;
use App\Models\Leaderboard;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class HomeAndLeaderboardTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function home_counts_projects_by_status(): void
    {
        Project::factory()->count(2)->create(['status' => ProjectStatus::Hiring]);
        Project::factory()->create(['status' => ProjectStatus::Ongoing]);
        Project::factory()->finished()->count(3)->create();
        Project::factory()->draft()->create();

        $this->getJson('/api/home')
            ->assertOk()
            ->assertJsonPath('stats.hiring', 2)
            ->assertJsonPath('stats.ongoing', 1)
            ->assertJsonPath('stats.finished', 3);
    }

    #[Test]
    public function home_exposes_a_top_scorer_per_expertise(): void
    {
        $top = User::factory()->student()->create(['expertise' => Expertise::DataExpert]);
        $runnerUp = User::factory()->student()->create(['expertise' => Expertise::DataExpert]);

        Leaderboard::create(['user_id' => $top->id, 'expertise' => Expertise::DataExpert, 'points' => 500]);
        Leaderboard::create(['user_id' => $runnerUp->id, 'expertise' => Expertise::DataExpert, 'points' => 10]);

        $this->getJson('/api/home')
            ->assertOk()
            ->assertJsonPath('top_boards.data_expert.user.tagname', $top->tagname)
            ->assertJsonPath('top_boards.ui_ux_designer', null);
    }

    #[Test]
    public function the_leaderboard_is_ordered_by_points(): void
    {
        $expertise = Expertise::FrontendEngineer;

        foreach ([30, 90, 60] as $points) {
            $user = User::factory()->student()->create(['expertise' => $expertise]);
            Leaderboard::create([
                'user_id' => $user->id,
                'expertise' => $expertise,
                'points' => $points,
            ]);
        }

        $board = $this->getJson('/api/leaderboards')
            ->assertOk()
            ->json('boards.front_end_engineer');

        $this->assertSame([90, 60, 30], array_column($board, 'points'));
    }

    #[Test]
    public function every_expertise_gets_a_board_even_when_empty(): void
    {
        $this->getJson('/api/leaderboards')
            ->assertOk()
            ->assertJsonStructure([
                'boards' => ['ui_ux_designer', 'front_end_engineer', 'back_end_engineer', 'data_expert'],
            ]);
    }
}
