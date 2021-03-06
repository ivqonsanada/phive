<?php

use App\User;
use Faker\Generator as Faker;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| This directory should contain each of the model factory definitions for
| your application. Factories provide a convenient way to generate new
| model instances for testing / seeding your application's database.
|
*/

$factory->define(User::class, function (Faker $faker) {
    $expertises = ['Frontend Engineer','Backend Engineer','UI/UX Designer','Data Expert'];
    $expertise = $expertises[array_rand($expertises)];
    $majors = [
        'Informatics Engineering',
        'Informaton System',
        'Computer Engineering',
        'Information Technology',
        'Information Technology Education'
    ];
    $major = $majors[array_rand($majors)];
    $firstName = $faker->firstName;
    $lastName = $faker->lastName;
    $fullName = $firstName . ' ' . $lastName;
    $tagname = explode(' ', strtolower($fullName));
    $tagname = implode('', $tagname);

    return [
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => $faker->freeEmail,
        'email_verified_at' => now(),
        'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        'remember_token' => Str::random(10),
        'role' => 'Student',
        'tagname' => $tagname,
        'expertise' => $expertise,
        'identity_number' => null,
        'university' => 'University of Brawijaya',
        'faculty' => 'Faculty of Computer Science',
        'major' => $major,
        'location' => 'Malang, Indonesia',
        'biography' => $faker->text(),
        'is_open_hired' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ];
});
