<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create('id_ID');

        $major = [
            'Informatics Engineering',
            'Informaton System',
            'Computer Engineering',
            'Information Technology',
            'Information Technology Education'
        ];

        $university = [

        ];

        $expertise = [
            'Frontend Engineer',
            'Backend Engineer',
            'UI/UX Designer',
            'Data Expert'
        ];

        $student_identity_number = [

        ];

        $lecturer_identity_number = [
            '197298959619021001',
            '197209583657021001',
            '197247598397021001',
            '197126791997011001',
            '197209191997021001',
        ];

        DB::table('users')->insert([
            'first_name' => 'Ivqonnada ',
            'last_name' => 'Al Mufarrih',
            'email' => 'ivqonnada@gmail.com',
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
            'tagname' => 'ivqonsanada',
            'role' => 'Student',
            'expertise' => 'Frontend Engineer',
            'identity_number' => '175150200111042',
            'university' => 'University of Brawijaya',
            'faculty' => 'Faculty of Computer Science',
            'major' => 'Informatics Engineering',
            'location' => 'Malang, Indonesia',
            'biography' => $faker->text(),
            'github' => 'github.com/ivqonsanada',
            'linkedin' => 'linkedin.com/in/ivqonnada',
            'website' => 'ivqonsanada.com'
        ]);

        DB::table('users')->insert([
            'first_name' => 'Stephen ',
            'last_name' => 'R. Covey, Ph.D.',
            'email' => 'lecturer@gmail.com',
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
            'tagname' => 'covey',
            'role' => 'Lecturer',
            'expertise' => 'UI/UX Designer Specialist',
            'identity_number' => '197408232000121002',
            'university' => 'University of Brawijaya',
            'faculty' => 'Faculty of Computer Science',
            'major' => 'Informatics Engineering Lecturer',
            'location' => 'Malang, Indonesia',
            'biography' => $faker->text(),
        ]);

        for($i = 3; $i <= 7; $i++) {
            $firstName = $faker->firstName;
            $lastName = $faker->lastName;
            $fullName = $firstName . ' ' . $lastName;
            $tagname = explode(' ', strtolower($fullName));
            $tagname = implode('-', $tagname);

            DB::table('users')->insert([
                'first_name' => $firstName,
                'last_name' => $lastName . ', Ph.D.',
                'email' => $faker->freeEmail,
                'email_verified_at' => now(),
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'remember_token' => Str::random(10),
                'role' => 'Lecturer',
                'tagname' => $tagname,
                'expertise' => $expertise[array_rand($expertise)] . ' Specialist',
                'identity_number' => $lecturer_identity_number[array_rand($lecturer_identity_number)],
                'university' => 'University of Brawijaya',
                'faculty' => 'Faculty of Computer Science',
                'major' => $major[array_rand($major)] . ' Lecturer',
                'location' => 'Malang, Indonesia',
                'biography' => $faker->text(),
            ]);
        }

        DB::table('users')->insert([
            'first_name' => 'Budi',
            'last_name' => 'Eka',
            'email' => 'student@gmail.com',
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
            'tagname' => 'budieka',
            'role' => 'Student',
            'expertise' => 'Backend Engineer',
            'identity_number' => '175150200111042',
            'university' => 'University of Brawijaya',
            'faculty' => 'Faculty of Computer Science',
            'major' => 'Informatics Engineering',
            'location' => 'Malang, Indonesia',
            'biography' => $faker->text(),
        ]);

        DB::table('users')->insert([
            'first_name' => 'Verrel',
            'last_name' => 'Radiman',
            'email' => 'verrel@gmail.com',
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
            'tagname' => 'verrelradiman',
            'role' => 'Student',
            'expertise' => 'UI/UX Designer',
            'identity_number' => '175150200111051',
            'university' => 'University of Brawijaya',
            'faculty' => 'Faculty of Computer Science',
            'major' => 'Informatics Engineering',
            'location' => 'Malang, Indonesia',
            'biography' => $faker->text(),
        ]);

    }
}
