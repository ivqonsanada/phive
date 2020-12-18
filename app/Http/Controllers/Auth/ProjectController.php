<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Project;
use App\ProjectBox;
use App\ProjectRequirement;
use App\ProjectSkill;
use App\Wishlist;
use Illuminate\Http\Request;

use function PHPSTORM_META\map;

class ProjectController extends Controller
{
    public function index () {

    }

    public function addWishlist (Request $request, Project $project) {
        $user_id = $request->user()->id;

        Wishlist::firstOrCreate([
            'project_id' => $project->id,
            'user_id' => $user_id
        ]);

        $wishlists = Wishlist::with('project.user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user_id);

        return response()->json([
            'status' => 'success',
            'message' => 'Project has been added to your Wishlist',
            'wishlists' => $wishlists
        ]);
    }

    public function postProject (Request $request) {
        $user = $request->user();

        if ($user->role === 'Lecturer') {
            $project = Project::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'title' => $request->post('title')
                ],
                [
                    'certificate' => $request->post('certificate'),
                    'description' => $request->post('description'),
                    'max_person' => $request->post('max_person'),
                    'ui_ux_designer' => $request->post('ui_ux_designer'),
                    'front_end_engineer' => $request->post('front_end_engineer'),
                    'back_end_engineer' => $request->post('back_end_engineer'),
                    'data_expert' => $request->post('data_expert'),
                    'min_points' => $request->post('min_points'),
                    'level_applicant' =>  $request->post('level_applicant'),
                    'status' => $request->post('status'),
                    'applicant_type' => $request->post('applicant_type'),
                    'salary' => '100000',
                    'image' => ''
                ]
            );

            $skills = $request->post('skills');
            $requirements = $request->post('requirements');

            for ($i = 0; $i < count($skills); $i++) {
                $skills[$i]['project_id'] = $project->id;
            }

            for ($i = 0; $i < count($requirements); $i++) {
                $requirements[$i]['project_id'] = $project->id;
            }

            ProjectSkill::where('project_id', $project->id)->delete();
            ProjectSkill::insert($skills);

            ProjectRequirement::where('project_id', $project->id)->delete();
            ProjectRequirement::insert($requirements);

            ProjectBox::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'user_id' => $user->id,
                ],
                [
                    'status' => 'Draft'
                ]
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Project has been saved as draft',
            ]);
        }
    }
}
