<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_registers_a_student_and_returns_an_api_token(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/register', [
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'role' => 'Student',
            'email' => 'ada@student.example.ac.id',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'ada@student.example.ac.id')
            ->assertJsonPath('user.role', 'Student')
            ->assertJsonStructure(['token', 'user' => ['id', 'tagname', 'name']]);

        $user = User::firstWhere('email', 'ada@student.example.ac.id');

        $this->assertNotNull($user->tagname);
        $this->assertSame(1, $user->tokens()->count());
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    #[Test]
    public function it_rejects_a_lecturer_signing_up_with_a_student_address(): void
    {
        $this->postJson('/api/register', [
            'first_name' => 'Grace',
            'last_name' => 'Hopper',
            'role' => 'Lecturer',
            'email' => 'grace@student.example.ac.id',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    #[Test]
    public function it_accepts_a_lecturer_with_a_staff_academic_address(): void
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'first_name' => 'Grace',
            'last_name' => 'Hopper',
            'role' => 'Lecturer',
            'email' => 'grace@example.ac.id',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
        ])->assertCreated()->assertJsonPath('user.role', 'Lecturer');
    }

    #[Test]
    public function it_gives_colliding_names_distinct_tagnames(): void
    {
        Notification::fake();

        foreach (range(1, 2) as $i) {
            $this->postJson('/api/register', [
                'first_name' => 'Ada',
                'last_name' => 'Lovelace',
                'role' => 'Student',
                'email' => "ada$i@example.com",
                'password' => 'correct-horse-battery',
                'password_confirmation' => 'correct-horse-battery',
            ])->assertCreated();
        }

        $this->assertSame(2, User::distinct()->count('tagname'));
    }
}
