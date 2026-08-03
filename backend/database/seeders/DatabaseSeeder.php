<?php

namespace Database\Seeders;

use App\Enums\Expertise;
use App\Models\Leaderboard;
use App\Models\Project;
use App\Models\ProjectRequirement;
use App\Models\ProjectSkill;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(AdminSeeder::class);

        $lecturer = User::factory()->lecturer()->create([
            'first_name' => 'Test',
            'last_name' => 'Lecturer',
            'tagname' => 'lecturer',
            'email' => 'lecturer@phive.test',
        ]);

        $student = User::factory()->student()->create([
            'first_name' => 'Test',
            'last_name' => 'Student',
            'tagname' => 'student',
            'email' => 'student@phive.test',
            'expertise' => Expertise::FrontendEngineer,
        ]);

        $lecturers = User::factory()->lecturer()->count(4)->create()->push($lecturer);
        $students = User::factory()->student()->count(20)->create()->push($student);

        foreach ($students as $user) {
            foreach (fake()->randomElements(['Vue', 'React', 'Laravel', 'Figma', 'Postgres', 'Python'], 3) as $skill) {
                UserSkill::firstOrCreate(['user_id' => $user->id, 'name' => $skill]);
            }

            Leaderboard::firstOrCreate(
                ['user_id' => $user->id, 'expertise' => $user->expertise],
                ['points' => fake()->numberBetween(0, 500)],
            );
        }

        Project::factory()
            ->count(15)
            ->sequence(fn ($sequence) => ['user_id' => $lecturers->random()->id])
            ->create()
            ->each(function (Project $project) {
                foreach (fake()->randomElements(['Vue', 'React', 'Laravel', 'Figma', 'Postgres'], 3) as $skill) {
                    ProjectSkill::firstOrCreate(['project_id' => $project->id, 'name' => $skill]);
                }

                foreach (range(1, 3) as $ignored) {
                    ProjectRequirement::create([
                        'project_id' => $project->id,
                        'requirement' => Str::ucfirst(fake()->sentence()),
                    ]);
                }
            });
    }
}
