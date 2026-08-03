<?php

namespace Database\Factories;

use App\Enums\ApplicantType;
use App\Enums\ProjectLevel;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::title(fake()->words(4, true));

        return [
            'user_id' => User::factory()->lecturer(),
            'title' => $title,
            'description' => fake()->paragraphs(3, true),
            'status' => ProjectStatus::Hiring,
            'applicant_type' => ApplicantType::IndividualAndTeam,
            'max_person' => (string) fake()->numberBetween(2, 6),
            'level_applicant' => fake()->randomElement(ProjectLevel::cases())->value,
            'ui_ux_designer' => fake()->boolean(),
            'front_end_engineer' => fake()->boolean(),
            'back_end_engineer' => fake()->boolean(),
            'data_expert' => fake()->boolean(),
            'certificate' => true,
            'salary' => fake()->boolean(),
            'is_open_hiring' => true,
            'currency' => 'IDR',
            'salary_amount' => (string) fake()->numberBetween(500_000, 5_000_000),
            'payment_type' => 'person',
            'project_url' => Str::slug($title).'-'.Str::lower(Str::random(8)),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::Draft,
            'project_url' => null,
        ]);
    }

    public function finished(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::Finished,
            'is_open_hiring' => false,
            'start_time' => now()->subMonths(3),
            'finish_time' => now()->subMonth(),
        ]);
    }
}
