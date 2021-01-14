<?php

use App\Project;
use App\ProjectBox;
use App\ProjectRequirement;
use App\ProjectSkill;
use App\User;
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
        $lecturers = User::where('role', 'Lecturer')->get();
        $lecturers_id = $lecturers->pluck('id')->toArray();

        $projectName = [
            '', '',
            'Gapura UB Development',
            'iNews Apps Development',
            'Science-Fiction Story Generator AI',
            'Philosopher AI',
            'Random Project Name',
            'Freelancer Apps Development',
            'K-Pay Payments Service',
            'Cloud Monitoring Apps',
            'Redesign SIAM UB Website',
            'SIAM UB Website Development',
            'SIAM UB Data Development',
        ];

        $projectsDummy = [
            [],[],[],[],[],[],[],[],[],[],[],[],[],
            [
                'title' => 'Financial Calculator',
                'description' => 'I need a group of students to design and implement a financial calculator (web-based) for me that can calculate: 1. Fund requirement 2. Financial Check-up 3. Pension Fund 4. Education Fund 5. Marriage Fund 6. Latte factor for description and reference.'
            ],
            [
                'title' => 'Website for Pet Accessories',
                'description' => 'Hey students, I need someone to make me an e-catalogue for pet accessories products. The pet accessories consists of collars, leash, harness, and pet toys. Product photos will be sent as soon as you are ready, it may need a little editing.'
            ],
            [
                'title' => 'Chatting App using the base64 Method',
                'description' => 'I want someone to make me a chatting app that can send document and image data using the base64 algorithm to secure data when chatting.'
            ],
            [
                'title' => 'Asset Management Website',
                'description' => 'My friend and I need a website to manage assets and its reports. You need to use ReactJS for the front-end and / or Node JS for the back-end. You also need to use the SCRUM methodology. '
            ],
            [
                'title' => 'Company Profile Website',
                'description' => 'Dear students, I want to create a company profile website like https://ottobanindonesia.com/ciputat/. There is a product view, blog and news, and other stuff. You may use CodeIgniter 3 or other frameworks, but CodeIgniter 3 is preferrable. Please apply.'
            ],
            [
                'title' => 'Mobile Phone Store Inventory System',
                'description' => 'Hello, I’m looking for a web developer/programmer to create a store inventory website that has these features: Sales records, purchase records, sales, purchases, stocks of goods, profit, and loss reports. Need this ASAP.'
            ],
            [
                'title' => 'Multi Warehouse App',
                'description' => 'Need a web-based and open source multi warehouse app to manage stocks in warehouses. The key feature is checking goods to minimize twin items. The latest version of the used programming language / CodeIgniter and MySQL, MariaDB is a MUST. '
            ],
            [
                'title' => 'Safety Flight Demonstration Animation',
                'description' => 'Hey students, I need someone to create an animation explaining the safety flight demonstration as an animation. You may use Blender or other software. Need this soon. Please contact me for further information.'
            ],
            [
                'title' => 'Clinic Management App',
                'description' => 'Assalamualaikum Wr. Wb. My friend has a clinic that needs an app to manage it remotely. Starting from incoming patients, adding private data and the patient’s medical records, then the data needs to be sent to the doctor, then the doctor’s note is inputted into a medical record, which then connects with the prescription that will be ordered and placed in the drugs store. Then the output is a receipt for payment at the cashier.'
            ],
            [
                'title' => 'Integrating Gojek Application into My Own App',
                'description' => 'I need someone to integrate the Gojek app into my application. My app needs a ready-made online delivery system. For those who have an online delivery application or have worked on an online delivery application, please apply on this project. '
            ],
            [
                'title' => 'Expert System Android-based',
                'description' => 'I need a group of students to make an Android-based mobile application (expert system) using the Naive Bayes Algorithm to determine the accuracy of Covid symptoms.'
            ],
            [
                'title' => 'UI/UX and Prototyping',
                'description' => 'Need a UI/UX developer for projects that will last for 2-3 months. You need to make UI/UX according to the concept that will be sent. The projects range from creating user flow (web and mobile), creating low-fidelity design and high-fidelity design, to making mockups and prototyping.'
            ],
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
            '150000', '250000', '450000', '725000', '1200000', '0'
        ];

        // $min_points = [
        //     '1000', '500', '5000', '2000', '2500', '10000', '7000'
        // ];

        $level_applicant = [
            'Easy',
            'Medium',
            'Hard',
            'Expert'
        ];

        $payment_type = [
            'person',
            'project'
        ];

/////////////////////////////////////////////////////////////////////////////////
        // For Mr. Covey
        $randSalary = $salary[array_rand($salary)];
        if ( $randSalary === '0' ) {
            $certificate = 1;
            $has_salary = false;
        } else {
            $certificate = $faker->boolean;
            $has_salary = true;
        }
        $salary_amount = $randSalary;

        $projects = [];
        $projectBoxes = [];
        $projectSkills = [];
        $projectRequirements = [];

        $project_title = 'Redesign FILKOM UB Website';
        $projects[] = [
            'user_id' => 2,
            'title' => $project_title,
            'description' => $faker->text,
            'salary' => $has_salary,
            'currency' => 'IDR',
            'salary_amount' => $salary_amount,
            'payment_type' => $payment_type[array_rand($payment_type)],
            'certificate' => $certificate,
            'ui_ux_designer' => true,
            'front_end_engineer' => $faker->boolean,
            'back_end_engineer' => $faker->boolean,
            'data_expert' => $faker->boolean,
            'max_person' => $faker->numberBetween($min = 1, $max = 9),
            'thumbnail' => null,
            'applicant_type' => 'Individual & Team',
            'level_applicant' => $level_applicant[0],
            'project_url' => implode('-', explode(' ', strtolower($project_title))) . '-' . $faker->regexify('[a-z0-9]{8}'),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $projectBoxes[] = [
            'project_id' => 1,
            'user_id' => 2,
            'status' => 'Hiring',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        shuffle($skills);
        shuffle($requirements);

        for($j = 0; $j < 6; $j++) {
            $projectSkills[] = [
                'project_id' => 1,
                'name' => $skills[$j],
            ];

            $projectRequirements[] = [
                'project_id' => 1,
                'requirement' => $requirements[$j],
            ];
        }

///////////////////////////////////////////////////////////////////////////////////////////////

        for ($i = 2; $i <= 24; $i++) {
            $randSalary = $salary[array_rand($salary)];
            if ( $randSalary === '0' ) {
                $certificate = 1;
                $has_salary = false;
            } else {
                $certificate = $faker->boolean;
                $has_salary = true;
            }
            $salary_amount = $randSalary;
            $month = $faker->numberBetween($min = 8, $max = 9);
            $day = $faker->numberBetween($min = 1, $max = 24);

            $lecturer_id = $lecturers_id[array_rand($lecturers_id)];

            $projectTitle = $i <= 12 ? $projectName[$i] : $projectsDummy[$i]['title'];
            $projectUrl = str_replace('/', '-', $projectTitle);
            $projects[] = [
                'user_id' => $lecturer_id,
                'title' => $projectTitle,
                'description' => $i <= 12 ? $faker->text : $projectsDummy[$i]['description'],
                'salary' => $has_salary,
                'currency' => 'IDR',
                'salary_amount' => $salary_amount,
                'payment_type' => $payment_type[array_rand($payment_type)],
                'certificate' => $certificate,
                'ui_ux_designer' => true,
                'front_end_engineer' => $faker->boolean,
                'back_end_engineer' => $faker->boolean,
                'data_expert' => $faker->boolean,
                'max_person' => $faker->numberBetween($min = 1, $max = 9),
                'thumbnail' => null,
                'applicant_type' => $applicant_type[array_rand($applicant_type)],
                'level_applicant' => $level_applicant[array_rand($level_applicant)],
                'project_url' => implode('-', explode(' ', strtolower($projectUrl))) . '-' . $faker->regexify('[a-z0-9]{8}'),
                'created_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
                'updated_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
            ];

            $projectBoxes[] = [
                'project_id' => $i,
                'user_id' => $lecturer_id,
                'status' => 'Hiring',
                'created_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
                'updated_at' => Carbon::createFromDate(2020, $month, $day, 'Asia/Jakarta'),
            ];

            shuffle($skills);
            shuffle($requirements);

            for($j = 0; $j < 6; $j++) {
                $projectSkills[] = [
                    'project_id' => $i,
                    'name' => $skills[$j],
                ];

                $projectRequirements[] = [
                    'project_id' => $i,
                    'requirement' => $requirements[$j],
                ];
            }
        }

        Project::insert($projects);
        ProjectBox::insert($projectBoxes);
        ProjectSkill::insert($projectSkills);
        ProjectRequirement::insert($projectRequirements);
    }
}
