<?php

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

use Faker\Factory as Faker;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create('id_ID');

        $projectName = [
            'Redesign FILKOM UB Website',
            'Gapura UB Development',
            'iNews Apps Development',
            'Science-Fiction Story Generator AI',
            'Philosopher AI',
            'Random Project Name'
        ];

        $applicant_type = [
            'Individual & Team',
            'Individual',
            'Team'
        ];

        $skills = [
            'Communication', 'Design Thinking', 'Research', 'Design', 'Figma', 'Adobe XD'
        ];

        $requirements = [
            'Specific technical skills or languages are not required but strong designing skills and hunger to learn are. Out-of-school experiences like winning contests, prior internships, open source contribution etc. will make your application stand out.',
            'You have excellent written and verbal communication skills.',
            'You should have strong decision making skills and use sound reasoning to communicate.',
            'Familiar with Figma, Adobe XD, or Sketch.',
            'Able to use Photoshop or Illustrator for designing purposes.',
            'Eager to learn'
        ];

        $salary = [
            '1000000', '1500000', '5000000', '12000000', '500000', '0'
        ];

        $min_points = [
            '1000', '500', '5000', '2000', '2500', '10000', '7000'
        ];

        $level_applicant = [
            'Rooks',
            'Superior',
            'Fleet',
            'Demigod'
        ];

        // For Mr. Covey
        $randSalary = $salary[array_rand($salary)];
        if ( $randSalary === '0' ) $certificate = 1;
        else $certificate = $faker->boolean;

        DB::table('projects')->insert([
            'user_id' => 2,
            'title' => $projectName[0],
            'description' => $faker->text,
            'salary' => $randSalary,
            'certificate' => $certificate,
            'ui_ux_designer' => true,
            'front_end_engineer' => $faker->boolean,
            'back_end_engineer' => $faker->boolean,
            'data_expert' => $faker->boolean,
            'max_person' => $faker->numberBetween($min = 1, $max = 9),
            'image' => $faker->imageUrl,
            'applicant_type' => 'Individual & Team',
            'min_points' => $min_points[array_rand($min_points)],
            'level_applicant' => $level_applicant[array_rand($level_applicant)],
            'created_at' => now(),
            'updated_at' => now(),
            ]);

            DB::table('project_boxes')->insert([
                'project_id' => 1,
                'user_id' => 2,
                'status' => 'Hiring',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            shuffle($skills);
            shuffle($requirements);

            for($j = 0; $j < 6; $j++) {
                DB::table('project_skills')->insert([
                    'project_id' => 1,
                    'skill' => $skills[$j],
                ]);

                DB::table('project_requirements')->insert([
                    'project_id' => 1,
                    'requirement' => $requirements[$j],
                ]);
            }

        for ($i = 3; $i < 8; $i++) {
            $randSalary = $salary[array_rand($salary)];
            if ( $randSalary === '0' ) $certificate = 1;
            else $certificate = $faker->boolean;
            $month = $faker->numberBetween($min = 8, $max = 9);
            $day = $faker->numberBetween($min = 1, $max = 20);

            DB::table('projects')->insert([
                'user_id' => $i,
                'title' => $projectName[$i-2],
                'description' => $faker->text,
                'salary' => $randSalary,
                'certificate' => $certificate,
                'ui_ux_designer' => true,
                'front_end_engineer' => $faker->boolean,
                'back_end_engineer' => $faker->boolean,
                'data_expert' => $faker->boolean,
                'max_person' => $faker->numberBetween($min = 1, $max = 9),
                'image' => $faker->imageUrl,
                'applicant_type' => $applicant_type[array_rand($applicant_type)],
                'min_points' => $min_points[array_rand($min_points)],
                'level_applicant' => $level_applicant[array_rand($level_applicant)],
                'created_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
                'updated_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
            ]);

            DB::table('project_boxes')->insert([
                'project_id' => $i-1,
                'user_id' => $i,
                'status' => 'Hiring',
                'created_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
                'updated_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
            ]);

            shuffle($skills);
            shuffle($requirements);

            for($j = 0; $j < 6; $j++) {
                DB::table('project_skills')->insert([
                    'project_id' => $i-1,
                    'skill' => $skills[$j],
                ]);

                DB::table('project_requirements')->insert([
                    'project_id' => $i-1,
                    'requirement' => $requirements[$j],
                ]);
            }
        }

        $projectName2 = [
            'Freelancer Apps Development',
            'K-Pay Payments Service',
            'Cloud Monitoring Apps',
            'Redesign SIAM UB Website',
            'SIAM UB Website Development',
            'SIAM UB Data Development',
        ];

        for ($i = 8; $i < 14; $i++) {
            $randSalary = $salary[array_rand($salary)];
            if ( $randSalary === '0' ) $certificate = 1;
            else $certificate = $faker->boolean;
            $month = $faker->numberBetween($min = 8, $max = 9);
            $day = $faker->numberBetween($min = 1, $max = 20);

            DB::table('projects')->insert([
                'user_id' => $i-6,
                'title' => $projectName2[$i-8],
                'description' => $faker->text,
                'salary' => $randSalary,
                'certificate' => $certificate,
                'ui_ux_designer' => true,
                'front_end_engineer' => $faker->boolean,
                'back_end_engineer' => $faker->boolean,
                'data_expert' => $faker->boolean,
                'max_person' => $faker->randomDigit,
                'image' => $faker->imageUrl,
                'applicant_type' => $applicant_type[array_rand($applicant_type)],
                'min_points' => $min_points[array_rand($min_points)],
                'level_applicant' => $level_applicant[array_rand($level_applicant)],
                'created_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
                'updated_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
            ]);

            DB::table('project_boxes')->insert([
                'project_id' => $i-2,
                'user_id' => $i-6,
                'status' => 'Hiring',
                'created_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
                'updated_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
            ]);

            shuffle($skills);
            shuffle($requirements);

            for($j = 0; $j < 6; $j++) {
                DB::table('project_skills')->insert([
                    'project_id' => $i-1,
                    'skill' => $skills[$j],
                ]);

                DB::table('project_requirements')->insert([
                    'project_id' => $i-1,
                    'requirement' => $requirements[$j],
                ]);
            }
        }

    }
}
