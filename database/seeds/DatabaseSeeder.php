<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {

        // DB::table('users')->insert([
        //     'name' => 'Ivqonnada Al Mufarrih',
        //     'email' => 'ivqonnada@gmail.com',
        //     'email_verified_at' => now(),
        //     'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        //     'remember_token' => Str::random(10),
        //     ]);

        $this->call(UserSeeder::class);
        $this->call(ProjectSeeder::class);
        $this->call(MessageSeeder::class);


        $this->call(KelasDSeeder::class);
    }
}
