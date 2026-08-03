<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function the_panel_redirects_guests_to_its_login(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    #[Test]
    public function an_administrator_reaches_the_dashboard(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin, 'web')->get('/admin')->assertSuccessful();
    }

    #[Test]
    public function a_normal_student_is_refused(): void
    {
        $student = User::factory()->student()->create(['is_admin' => false]);

        $this->actingAs($student, 'web')->get('/admin')->assertForbidden();
    }

    #[Test]
    public function a_lecturer_is_refused_too(): void
    {
        // Being a lecturer is a platform role, not an administrative one.
        $lecturer = User::factory()->lecturer()->create(['is_admin' => false]);

        $this->actingAs($lecturer, 'web')->get('/admin')->assertForbidden();
    }

    #[Test]
    public function an_api_token_does_not_open_the_panel(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        // The panel is session-based; a bearer token must not be a way in.
        $this->withToken($admin->createToken('t')->plainTextToken)
            ->get('/admin')
            ->assertRedirect('/admin/login');
    }

    #[Test]
    public function users_are_not_admins_by_default(): void
    {
        $this->assertFalse(User::factory()->create()->is_admin);
    }
}
