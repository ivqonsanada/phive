<?php

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
            'Redesign SIAM UB Website',
            'SIAM UB Website Development',
            'SIAM UB Data Development',
            'Redesign FILKOM UB Website',
            'Gapura UB Development',
            'iNews Apps Development'
        ];

        $applicant_type = [
            'Individual & Team',
            'Individual',
            'Team'
        ];

        $skill = [
            'Communication', 'Design Thinking', 'Research', 'Design', 'Figma', 'Adobe XD'
        ];

        $requirement = [
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

        for ($i = 2; $i < 8; $i++) {
            DB::table('projects')->insert([
                'user_id' => $i,
                'name' => $projectName[$i-2],
                'description' => $faker->text,
                'salary' => $salary[$i-2],
                'certificate' => $faker->boolean,
                'ui_ux_designer' => true,
                'front_end_engineer' => $faker->boolean,
                'back_end_engineer' => $faker->boolean,
                'data_expert' => $faker->boolean,
                'max_person' => $faker->randomDigit,
                'image' => $faker->imageUrl,
                'applicant_type' => $applicant_type[array_rand($applicant_type)],
                'min_points' => $min_points[array_rand($min_points)],
                'level_applicant' => $level_applicant[array_rand($level_applicant)],
                'created_at' => now(),
                'updated_at' => now()
            ]);

            for($j = 0; $j < 6; $j++) {
                DB::table('skills')->insert([
                    'project_id' => $i-1,
                    'skill' => $skill[$j],
                ]);

                DB::table('requirements')->insert([
                    'project_id' => $i-1,
                    'requirement' => $requirement[$j],
                ]);
            }
        }

        $projectName2 = [
            'Freelancer Apps Development',
            'K-Pay Payments Service',
            'Cloud Monitoring Apps',
            'Science-Fiction Story Generator AI',
            'Philosopher AI',
            'Random Project Name'
        ];

        for ($i = 8; $i < 14; $i++) {
            DB::table('projects')->insert([
                'user_id' => $i-6,
                'name' => $projectName2[$i-8],
                'description' => $faker->text,
                'salary' => $salary[$i-8],
                'certificate' => $faker->boolean,
                'ui_ux_designer' => true,
                'front_end_engineer' => $faker->boolean,
                'back_end_engineer' => $faker->boolean,
                'data_expert' => $faker->boolean,
                'max_person' => $faker->randomDigit,
                'image' => $faker->imageUrl,
                'applicant_type' => $applicant_type[array_rand($applicant_type)],
                'min_points' => $min_points[array_rand($min_points)],
                'level_applicant' => $level_applicant[array_rand($level_applicant)],
                'created_at' => now(),
                'updated_at' => now()
            ]);

            for($j = 0; $j < 6; $j++) {
                DB::table('skills')->insert([
                    'project_id' => $i-1,
                    'skill' => $skill[$j],
                ]);

                DB::table('requirements')->insert([
                    'project_id' => $i-1,
                    'requirement' => $requirement[$j],
                ]);
            }
        }

    }
}
