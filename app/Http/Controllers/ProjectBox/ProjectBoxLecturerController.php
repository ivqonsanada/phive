<?php

namespace App\Http\Controllers\ProjectBox;

use App\Http\Controllers\Controller;
use App\IndividualApplicant;
use App\Project;
use App\ProjectBox;
use App\ProjectTeam;
use App\ProjectTeamMember;
use App\TeamApplicant;
use Faker\Factory as Faker;
use Illuminate\Http\Request;

class ProjectBoxLecturerController extends Controller
{
    public function cancelProjectInvitation(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'Lecturer') {
            if ($request->post('individual_applicant_id')) {
                IndividualApplicant::where('id', $request->post('individual_applicant_id'))->update(['status' => 'Applying']);
                $individualApplicant = IndividualApplicant::where('id', $request->post('individual_applicant_id'))->first();

                ProjectBox::
                    where(['user_id' => $individualApplicant->from_id, 'project_id' => $individualApplicant->project_id])
                    ->update(['status' => 'Waiting']);

                return response()->json([
                    'message' => 'You canceled this person invitation.',
                ]);
            } else {
                TeamApplicant::where('id', $request->post('team_applicant_id'))->update(['status' => 'Applying']);
                $teamApplicant = TeamApplicant::where('id', $request->post('team_applicant_id'))->first();

                ProjectBox::
                    where(['user_id' => $teamApplicant->from_id, 'project_id' => $teamApplicant->project_id])
                    ->update(['status' => 'Waiting']);

                return response()->json([
                    'message' => 'You canceled this team invitation.',
                ]);
            }
        }
    }

    public function startProject(Request $request)
    {
        $lecturer = $request->user();

        if ($lecturer->role === 'Lecturer') {
            $project = Project::findOrFail($request->post('project_id'));
            $this->authorize('update', $project);

            $project->update(['status' => 'Ongoing', 'start_time' => now()]);
            ProjectBox::where('project_id', $project->id)->where('user_id', $lecturer->id)->update(['status' => 'Ongoing']);
            ProjectBox::where(['project_id' => $project->id, 'status' => 'Waiting to Start'])->update(['status' => 'Project Started']);
            ProjectBox::where(['project_id' => $project->id])->whereNotIn('status', ['Project Started', 'Ongoing'])->update(['status' => 'Rejected']);

            $projectTeam = ProjectTeam::firstOrCreate(['project_id' => $project->id]);

            $willBeProjectTeamMembers = ProjectBox::select('user_id')->where('status', 'Project Started')->where('project_id', $project->id)->get();
            $willBeProjectTeamMembers_id = $willBeProjectTeamMembers->pluck('user_id')->toArray();

            $individualApplicants = IndividualApplicant::select('from_id', 'expertise')->whereIn('from_id', $willBeProjectTeamMembers_id)->get();

            $projectTeamMembers = [];

            if ($individualApplicants) {
                $individualApplicants = $individualApplicants->toArray();

                for ($i = 0; $i < count($individualApplicants); $i++) {
                    $projectTeamMembers[] = [
                        'project_team_id' => $projectTeam->id,
                        'member_id' => $individualApplicants[$i]['from_id'],
                        'expertise' => $individualApplicants[$i]['expertise'],
                    ];
                }
            }

            $teamApplicants = TeamApplicant::with('applicant_team_members.member')->whereIn('from_id', $willBeProjectTeamMembers_id)->first();

            if ($teamApplicants) {
                $teamApplicants = $teamApplicants->toArray();

                for ($i = 0; $i < $teamApplicants['applicant_team_members_count']; $i++) {
                    $projectTeamMembers[] = [
                        'project_team_id' => $projectTeam->id,
                        'member_id' => $teamApplicants['applicant_team_members'][$i]['member_id'],
                        'expertise' => $teamApplicants['applicant_team_members'][$i]['expertise'],
                    ];
                }
            }

            // return print_r($teamApplicants['applicant_team_members_count']);

            // ProjectTeamMember::where('project_team_id', $projectTeam->id)->delete();
            // $uniqueProjectTeamMembers = array_unique($projectTeamMembers);
            ProjectTeamMember::insert($projectTeamMembers);

            $projectBoxes = ProjectBox::with('project.user')->where('user_id', $lecturer->id)->get();

            return response()->json([
                'message' => 'Project Started',
                'project_boxes' => $projectBoxes,
            ]);
        }
    }



    public function publishProject(Request $request, Project $project)
    {
        $this->authorize('update', $project);
        $user = $request->user();
        $faker = Faker::create('id_ID');

        $projectUrl = str_replace('/', '-', $project->title);

        ProjectBox::where([
            'project_id' => $project->id,
            'user_id' => $user->id,
        ])->update([
            'status' => 'Hiring',
        ]);
        $project->update([
            'status' => 'Hiring',
            'project_url' => implode('-', explode(' ', strtolower($projectUrl))) . '-' . $faker->regexify('[a-z0-9]{8}'),
        ]);

        $projectBoxes = ProjectBox::lecturerProjectBoxes($user);

        return response()->json([
            'message' => "$project->title has been published.",
            'project_boxes' => $projectBoxes,
        ]);
    }

    public function cancelProject(Request $request, Project $project) {
        $this->authorize('update', $project);
        $user = $request->user();

        ProjectBox::where('project_id', $project->id)->delete();
        $project->delete();

        $projectBoxes = ProjectBox::lecturerProjectBoxes($user);

        return response()->json([
            'message' => "$project->title has been cancelled.",
            'project_boxes' => $projectBoxes,
        ]);
    }

    public function terminateProject(Request $request, Project $project)
    {
        $this->authorize('update', $project);
        $user = $request->user();

        ProjectBox::where('project_id', $project->id)->delete();
        $project->delete();

        $projectBoxes = ProjectBox::lecturerProjectBoxes($user);

        return response()->json([
            'message' => "$project->title has been cancelled.",
            'project_boxes' => $projectBoxes,
        ]);
    }

    public function endApplication(Request $request, Project $project)
    {
        $this->authorize('update', $project);
        $user = $request->user();

        $project->update(['is_open_hiring' => false,]);
        ProjectBox::find($project->id)->update(['status' => 'Confirmation']);

        $projectBoxes = ProjectBox::lecturerProjectBoxes($user);

        return response()->json([
            'message' => "$project->title hiring has been closed",
            'project_boxes' => $projectBoxes,
        ]);
    }
}
