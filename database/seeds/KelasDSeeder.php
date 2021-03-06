<?php

use App\IndividualApplicant;
use App\Leaderboard;
use App\ProjectBox;
use App\User;
use App\UserSkill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

use Faker\Factory as Faker;

class KelasDSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create('id_ID');
        $expertises = [
            'Frontend Engineer',
            'Backend Engineer',
            'UI/UX Designer',
            'Data Expert'
        ];

        $skills = [
            'Frontend Engineer' => [
                 'HTML', 'HTML5', 'Cascading Style Sheets (CSS)', 'JavaScript', 'JSON', 'XML', 'Front-end Development', 'Front-end Coding', 'Front-end Design', 'Front-end Engineering', 'Bootstrap', 'React', 'Vue.js', 'Semantic UI', 'Angular', 'Foundation',
            ],
            'Backend Engineer' => [
                'PHP', 'SQL', 'Microsoft SQL Server', 'MySQL', 'Java', 'C++', 'C', 'Node.js', 'Back-end Web Development', 'C#', 'MongoDB', 'Laravel', 'Django', 'Ruby on Rails', 'CakePHP', 'Express.Js', 'Spring Boot',
            ],
            'UI/UX Designer' => [
                'User Experience (UX)', 'User Interface Design', 'Graphic Design', 'User Experience Design (UED)', 'User Interface Prototyping', 'User Interface Programming', 'User Experience Testing', 'UX Research',
            ],
            'Data Expert' => [
                'Machine Learning', 'Requirements Analysis', 'Data Analysis', 'Data Mining', 'Data Modeling', 'Big Data', 'Data Visualization', 'Data Science', 'Data Warehousing', 'Python', 'Matlab', 'Data Classification', 'Exploratory Data Analysis', 'Data Engineering', 'SPARQL', 'Web Crawling', 'Protege'
            ]
        ];

        $biographies = [
            'Frontend Engineer' => [
                'An experienced Front-end Web Developer with an experience in collaborating with creative and development teams on the execution of ideas and projects. Experienced with efficient coding websites and applications using modern HTML, CSS, and JavaScript. Building state-of-the-art, easy to use, user-friendly websites and applications is truly a passion of mine.',
                'Innovative Front-end Developer with an experience building and maintaining responsive websites. Proficient in HTML, CSS, JavaScript, plus modern libraries and frameworks. Passionate about usability and possess working knowledge of Adobe Photoshop.',
            ],
            'Backend Engineer' => [
                'Experienced and results-oriented Back-end Developer with a deep passion for software engineering. Offering a strong attention to detail and accuracy, excellent problem-solving skills, and the important ability to work in fast-paced team environments, I am a reliable individual with determination to meet and exceed all assigned results.',
                'Results-driven and award-winning Back-end Developer with comprehensive mastery of multiple web design and development software languages, such as Java, Java Script, PHP, Eclipse, JUnit, C++, and HTML. Detail-oriented Oracle Certified Professional and Microsoft Certified Developer accustomed to working in fast paced/multitasking environments within very tight deadlines.',
            ],
            'UI/UX Designer' => [
                'Detail-oriented and motivated UI/UX Designer with a comprehensive background and extensive experience in participating in all aspects of mobile software application development. Skilled in creating comprehensive user inteface, managing documents and records, and coordinating team members. Creative professional with great communication skills and important ability to work and perform well in a team.',
                'I am a computer engineering student with passion in the areas of User Experience Design. I have a diverse experience investigating user goals and workflows through usability testing and user research processes, including: use cases, surveys, heuristic evaluations, workshops and contextual inquiry. This has gained me a solid knowledge of user interface and user experience design.',
            ],
            'Data Expert' => [
                'Hello! I am a software engineering student working on web applications and web infrastructure. I have been tinkering since I was a kid.  I have had experiences in help desk, graphic/web design, data analysis, data science and sysadmin/devops. I can help everywhere in the Although, I do think my strongest skills are in data engineering and server administration.',
                'Motivated Data Scientist and Analyst with a demonstrated experience in improving software performance, buidling a predictive model using machine learning, and developing new software functionalities. Offers proven track record of extraordinary achievements, strong attention to detail, and ability to finish projects on schedule and within budget.',
            ]
            ];

        $list_kelas_d = [
            [ 'first_name' => 'Rizal', 'last_name' => 'Bayu A. P.', 'tagname' => 'bayu'],
            [ 'first_name' => 'Tania', 'last_name' => 'Malik I.', 'tagname' => 'tania'],
            [ 'first_name' => 'Riefqi', 'last_name' => 'Ardhya B.', 'tagname' => 'bimbim'],
            [ 'first_name' => 'Jeowandha', 'last_name' => 'Ria W.', 'tagname' => 'jeo'],

            [ 'first_name' => 'Dimas', 'last_name' => 'Bagus W.', 'tagname' => 'beck'],
            [ 'first_name' => 'Robertus', 'last_name' => 'Dwi A. U.', 'tagname' => 'ari'],
            [ 'first_name' => 'Natanniel', 'last_name' => 'Eka C.', 'tagname' => 'natan'],
            [ 'first_name' => 'Irfan', 'last_name' => 'Maulana A.', 'tagname' => 'ipun'],
            [ 'first_name' => 'Asrina', 'last_name' => 'Fitri', 'tagname' => 'aci'],

            [ 'first_name' => 'I Kadek', 'last_name' => 'Yoga D. P.', 'tagname' => 'yoga'],
            [ 'first_name' => 'Gusti', 'last_name' => 'Rahman P. A.', 'tagname' => 'ajit'],
            [ 'first_name' => 'Rangga', 'last_name' => 'Baghas N.', 'tagname' => 'rangga'],
            [ 'first_name' => 'Rizky', 'last_name' => 'Maulana I.', 'tagname' => 'iqbal'],
            [ 'first_name' => 'Raditya', 'last_name' => 'Rin', 'tagname' => 'radit'],
            [ 'first_name' => 'Fadil', 'last_name' => 'Ghulam P.', 'tagname' => 'fadil'],
            [ 'first_name' => 'Gerald', 'last_name' => 'Marihot H.', 'tagname' => 'gerald'],

            [ 'first_name' => 'M. Dandi', 'last_name' => 'Darojat', 'tagname' => 'dandi'],
            [ 'first_name' => 'M. Roshandi', 'last_name' => 'Naufal', 'tagname' => 'obe'],
            [ 'first_name' => 'Valen', 'last_name' => 'Novandi K.', 'tagname' => 'valen'],
            [ 'first_name' => 'M. Isfa', 'last_name' => 'Hany', 'tagname' => 'isfa'],
            [ 'first_name' => 'Hanif', 'last_name' => 'Aliffudin', 'tagname' => 'hanip'],
            [ 'first_name' => 'Bagoes', 'last_name' => 'Shandy W.', 'tagname' => 'bagoes'],
            [ 'first_name' => 'Farassulthana', 'last_name' => 'A. W. Y.', 'tagname' => 'fara'],

            [ 'first_name' => 'Rizky', 'last_name' => 'Adytia I. R.', 'tagname' => 'iki'],
            [ 'first_name' => 'Niluh', 'last_name' => 'Putu V. D. S.', 'tagname' => 'putu'],
            [ 'first_name' => 'M. Haekal', 'last_name' => 'Fajry', 'tagname' => 'haekal'],
            [ 'first_name' => 'Mutia', 'last_name' => 'Ayu S.', 'tagname' => 'mutia'],
            [ 'first_name' => 'Afgani', 'last_name' => 'Fajar R.', 'tagname' => 'afgani'],
            [ 'first_name' => 'Inosensius', 'last_name' => 'K. Hesay', 'tagname' => 'hesay'],
            [ 'first_name' => 'M. Yusuf', 'last_name' => 'Azari', 'tagname' => 'azari'],

            [ 'first_name' => 'Gustavo', 'last_name' => 'Thiodorus', 'tagname' => 'gustavo'],
            [ 'first_name' => 'Ikhwan', 'last_name' => 'Shafa A.', 'tagname' => 'ikhwan'],
            [ 'first_name' => 'Restu', 'last_name' => 'Amara', 'tagname' => 'restu'],
            [ 'first_name' => 'Reinhard', 'last_name' => 'Jonathan S.', 'tagname' => 'reinhard'],
            [ 'first_name' => 'Naufal', 'last_name' => 'Hilmi J.', 'tagname' => 'hilmi'],
            [ 'first_name' => 'Alvina', 'last_name' => 'Eka D.', 'tagname' => 'alvina'],
            [ 'first_name' => 'M. Faishal', 'last_name' => 'Dhiya\'', 'tagname' => 'dhiya\''],
            [ 'first_name' => 'Erlina', 'last_name' => 'Rohmawati', 'tagname' => 'erlina'],

            [ 'first_name' => 'Bayu', 'last_name' => 'Reza G.', 'tagname' => 'bazu'],
        ];

        $users = [];
        $userSkills = [];
        $projectBoxes = [];
        $individualApplicants = [];
        $leaderboards = [];

        for ($i = 10; $i < count($list_kelas_d) + 10; $i++) {
            $expertise = $expertises[array_rand($expertises)];
            shuffle($skills[$expertise]);
            shuffle($biographies[$expertise]);

            $users[] = [
                'first_name' => $list_kelas_d[$i-10]['first_name'],
                'last_name' => $list_kelas_d[$i-10]['last_name'],
                'email' => $list_kelas_d[$i-10]['tagname'] . '@example.com',
                'email_verified_at' => now(),
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'remember_token' => Str::random(10),
                'tagname' => $list_kelas_d[$i-10]['tagname'],
                'role' => 'Student',
                'expertise' => $expertise,
                'identity_number' => '1751502001110' . $i,
                'university' => 'University of Brawijaya',
                'faculty' => 'Faculty of Computer Science',
                'major' => 'Informatics Engineering',
                'location' => 'Malang, Indonesia',
                'biography' => $biographies[$expertise][0],
                'is_open_hired' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            for ($j = 0; $j < 6; $j++) {
                $userSkills[] = [
                    'user_id' => $i,
                    'name' => $skills[$expertise][$j]
                ];
            }

            $projectBoxes[] = [
                'project_id' => 1,
                'user_id' => $i,
                'status' => 'Waiting',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $individualApplicants[] = [
                'project_id' => 1,
                'from_id' => $i,
                'to_id' => 2,
                'expertise' => $expertise,
                'status' => 'Applying',
                'self_describe' => $faker->text(),
                'apply_reason' => $faker->text(),
            ];

            $leaderboards[] = [
                'user_id' => $i,
                'expertise' => $expertise,
                'points' => $faker->numberBetween($min = 1000, $max = 7500),
            ];
        }

        User::insert($users);
        UserSkill::insert($userSkills);
        ProjectBox::insert($projectBoxes);
        IndividualApplicant::insert($individualApplicants);
        Leaderboard::insert($leaderboards);
    }
}
