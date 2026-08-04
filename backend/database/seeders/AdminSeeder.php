<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * A single administrator for the Filament panel. Kept out of DatabaseSeeder's
     * demo data so it can be run on its own against a real database:
     *
     *   php artisan db:seed --class=AdminSeeder
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@phive.test')],
            [
                'first_name' => 'PHive',
                'last_name' => 'Admin',
                'tagname' => 'admin',
                'role' => UserRole::Lecturer,
                'password' => env('ADMIN_PASSWORD', 'password'),
                'email_verified_at' => now(),
                'is_admin' => true,
            ],
        );
    }
}
