<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Inbox;
use App\Project;
use App\ProjectBox;
use App\ProjectInvitation;
use App\ProjectRequirement;
use App\ProjectSkill;
use App\ProjectTeam;
use App\ProjectTeamMember;
use App\User;
use Faker\Factory as Faker;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class ProjectLecturerController extends Controller
{
    public function inviteToProject(Request $request, User $user)
    {
        $project = Project::find($request->post('project_id'));
        $this->authorize('owner', $project);

        $sender = $request->user();
        $recipient = $user;

        if ($sender->id !== $recipient->id) {
            $projectTeam = ProjectTeam::firstOrCreate([
                'project_id' => $project->id,
            ]);

            $isUserAlreadyJoined = ProjectTeamMember::where([
                'member_id' => $recipient->id,
                'project_team_id' => $projectTeam->id,
            ])->first();

            if (!$isUserAlreadyJoined) {
                $projectInvitation = ProjectInvitation::firstOrCreate(
                    [
                        'project_id' => $project->id,
                        'from_id' => $sender->id,
                        'to_id' => $recipient->id,
                    ],
                );

                Inbox::firstOrCreate(
                    ['project_invitation_id' => $projectInvitation->id],
                    [
                        'recipient_id' => $recipient->id,
                        'sender_id' => $sender->id,
                        'category' => 'Project Invitation',
                    ],
                );

                return response()->json([
                    'message' => "Project Invitation to $recipient->first_name $recipient->last_name delivered",
                ]);
            } else {
                return response()->json([
                    'message' => "The student is already in the project team members",
                ], 400);
            }
        }
    }

    public function postProject(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'Lecturer') {
            $faker = Faker::create('id_ID');
            $projectUrl = str_replace('/', '-', $request->post('title'));
            $projectStatus = $request->post('status') === 'Publish' ? 'Hiring' : 'Draft';

            if ($projectStatus === 'Hiring') {
                $this->validate($request,
                    ['title' => 'required', 'salary_amount' => 'numeric|min:0|nullable'],
                    ['title.required' => 'Project Title is required']);
            }

            $thumbnail_url = null;

            if (preg_match("/storage\/images\/project\/temp/", $request->post('thumbnail'))) {
                $thumbnail_url = explode('/storage/images/project/temp/', $request->post('thumbnail'))[1];
                $thumbnailOldPath = storage_path() . '/app/public/images/project/temp/' . $thumbnail_url;
                $thumbnailNewPath = storage_path() . '/app/public/images/project/' . $thumbnail_url;

                if (file_exists($thumbnailOldPath)) {
                    File::move($thumbnailOldPath, $thumbnailNewPath);
                }
            }

            $project = Project::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'title' => $request->post('title'),
                ],
                [
                    'description' => $request->post('description'),
                    'status' => $projectStatus,
                    'applicant_type' => $request->post('applicant_type'),
                    'max_person' => $request->post('max_person'),
                    'ui_ux_designer' => $request->post('ui_ux_designer'),
                    'front_end_engineer' => $request->post('front_end_engineer'),
                    'back_end_engineer' => $request->post('back_end_engineer'),
                    'data_expert' => $request->post('data_expert'),
                    'level_applicant' => $request->post('level_applicant'),
                    'certificate' => $request->post('certificate'),
                    'salary' => $request->post('salary'),
                    'currency' => $request->post('currency'),
                    'thumbnail' => $thumbnail_url,
                    'salary_amount' => $request->post('salary_amount') ? $request->post('salary_amount') : '0',
                    'payment_type' => $request->post('payment_type'),
                    'project_url' => implode('-', explode(' ', strtolower($projectUrl))) . '-' . $faker->regexify('[a-z0-9]{8}'),
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
                    'status' => $projectStatus,
                ]
            );

            if ($projectStatus === 'Draft') {
                return response()->json([
                    'message' => 'Project has been drafted',
                ]);
            } else {
                return response()->json([
                    'message' => 'Project has been posted',
                ]);
            }
        }
    }

    public function updateProject(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $user = $request->user();

        $projectStatus = $request->post('status') === 'Publish' || $request->post('status') === 'Save Changes' ? 'Hiring' : 'Draft';

        if ($projectStatus === 'Hiring') {
            $this->validate($request,
                ['title' => 'required', 'salary_amount' => 'numeric|min:50000|nullable'],
                ['title.required' => 'Project Title is required']
            );
        }

        $thumbnail_url = null;
        if (preg_match("/storage\/images\/project/", $request->post('thumbnail'))) {
            $thumbnail_url = explode('/storage/images/project/', $request->post('thumbnail'))[1];
        }

        $project->title = $request->post('title');
        $project->description = $request->post('description');
        $project->certificate = $request->post('certificate');
        $project->max_person = $request->post('max_person');
        $project->ui_ux_designer = $request->post('ui_ux_designer');
        $project->front_end_engineer = $request->post('front_end_engineer');
        $project->back_end_engineer = $request->post('back_end_engineer');
        $project->data_expert = $request->post('data_expert');
        $project->level_applicant = $request->post('level_applicant');
        $project->status = $projectStatus;
        $project->applicant_type = $request->post('applicant_type');
        $project->salary = $request->post('salary');
        $project->salary_amount = $request->post('salary_amount');
        $project->currency = $request->post('currency');
        $project->payment_type = $request->post('payment_type');
        $project->thumbnail = $thumbnail_url;
        $project->save();

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

        ProjectBox::updateOrCreate(
            ['project_id' => $project->id, 'user_id' => $user->id],
            ['status' => $projectStatus]
        );

        if ($request->post('status') === 'Publish') {
            return response()->json([
                'message' => 'Project has been posted',
            ]);
        }

        return response()->json([
            'message' => 'Project has been saved',
        ]);
    }

    public function uploadTempThumbnail(Request $request)
    {
        $userAuth = $request->user();

        $this->validate($request, [
            'file' => 'required|image|mimes:jpeg,png,jpg|max:516',
        ]);

        if ($userAuth->role === 'Lecturer' && $request->hasFile('file')) {
            $file = new Filesystem;
            $file->cleanDirectory("storage/images/project/temp/{$userAuth->id}");

            $image = $request->file('file');
            $extension = $image->extension();
            $imgName = $this->generateRandomString(25) . '.' . $extension;
            $destinationPath = storage_path('app/public/images/project/temp/' . $userAuth->id);
            $image->move($destinationPath, $imgName);

            return response()->json([
                'message' => 'Project Thumbnail has been uploaded',
                'thumbnail' => "/storage/images/project/temp/{$userAuth->id}/{$imgName}",
            ]);
        }
    }

    public function deleteTempThumbnail(Request $request)
    {
        $userAuth = $request->user();

        $file = new Filesystem;
        $file->cleanDirectory("storage/images/project/temp/{$userAuth->id}");

        return response()->json([
            'message' => 'Project Thumbnail has been deleted',
        ]);
    }

    public function uploadThumbnail(Request $request, Project $project)
    {
        $this->authorize('update', $project);
        $userAuth = $request->user();

        $this->validate($request, [
            'file' => 'required|image|mimes:jpeg,png,jpg|max:516',
        ]);

        if ($userAuth->role === 'Lecturer' && $request->hasFile('file')) {
            $image = $request->file('file');
            $extension = $image->extension();
            $imgName = $this->generateRandomString(25) . '.' . $extension;
            $destinationPath = storage_path('app/public/images/project/' . $userAuth->id);
            $image->move($destinationPath, $imgName);

            if ($project->thumbnail) {
                $path = storage_path() . '/app/public/images/project/' . $project->thumbnail;
                if (file_exists($path)) {
                    unlink($path);
                }

            }

            $project->thumbnail = "{$userAuth->id}/{$imgName}";
            $project->save();

            return response()->json([
                'message' => 'Project Thumbnail has been uploaded',
                'thumbnail' => "/storage/images/project/{$userAuth->id}/{$imgName}",
            ]);
        }
    }

    public function deleteThumbnail(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $path = storage_path() . '/app/public/images/project/' . $project->thumbnail;

        if (file_exists($path)) {
            unlink($path);
        }

        return response()->json([
            'message' => 'Project Thumbnail has been deleted',
        ]);
    }

    private function generateRandomString($length = 10)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }
}
