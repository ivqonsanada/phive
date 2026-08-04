<?php

namespace Database\Factories;

use App\Enums\Expertise;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $lastName = fake()->lastName();

        return [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => UserRole::Student,
            'tagname' => Str::lower(Str::slug($firstName.$lastName, '')).fake()->unique()->numberBetween(1, 99999),
            'identity_number' => fake()->numerify('##########'),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'expertise' => fake()->randomElement(Expertise::cases()),
            'university' => fake()->company().' University',
            'faculty' => 'Computer Science',
            'major' => 'Informatics',
            'location' => fake()->city(),
            'biography' => fake()->paragraph(),
            // Explicit rather than leaning on the column default, so a freshly built
            // model reports the same thing as one read back from the database.
            'is_admin' => false,
            'remember_token' => Str::random(10),
        ];
    }

    public function lecturer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Lecturer,
            'expertise' => null,
            'email' => fake()->unique()->userName().'@'.fake()->domainWord().'.ac.id',
        ]);
    }

    public function student(): static
    {
        return $this->state(fn (array $attributes) => ['role' => UserRole::Student]);
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => ['email_verified_at' => null]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => ['is_admin' => true]);
    }
}
