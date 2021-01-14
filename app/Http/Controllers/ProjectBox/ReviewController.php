<?php

namespace App\Http\Controllers\ProjectBox;

use App\Http\Controllers\Controller;
use App\Project;
use App\ProjectBox;
use App\ProjectReview;
use App\ProjectTeam;
use App\ProjectTeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function show(Request $request, Project $project)
    {
        $lecturer = $request->user();

        if ($lecturer->id === $project->user_id) {
            $projectParticipants = ProjectTeam::with('members.member:id,tagname,first_name,last_name,photo_url,email')->where('project_id', $project->id)->firstOrFail();

            return response()->json([
                'project' => $project,
                'participants' => $projectParticipants->members,
            ]);
        }
    }

    public function postReview(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $this->validate($request, [
            'overall_score' => 'required|numeric|min:0|max:5',
        ]);

        $projectTeam = ProjectTeam::where('project_id', $project->id)->firstOrFail();

        Project::where('id', $project->id)->update(['status' => 'Finished', 'finish_time' => now()]);

        ProjectBox::where('project_id', $project->id)->whereIn('status', ['Project Started', 'Ongoing'])->update(['status' => 'Finished']);

        ProjectReview::updateOrCreate(
            [
                'project_id' => $project->id,
            ],
            [
                'overall_score' => $request->post('overall_score'),
                'overall_review' => $request->post('overall_review'),
                'project_result' => $request->post('project_result'),
            ]
        );

        $projectPoints = 0;
        if ($project->level_applicant === 'Easy') $projectPoints = 2000;
        else if ($project->level_applicant === 'Medium') $projectPoints = 2500;
        else if ($project->level_applicant === 'Hard') $projectPoints = 4000;
        else if ($project->level_applicant === 'Expert') $projectPoints = 5000;

        $participants = [];
        for ($i = 0; $i < count($request->post('participants')); $i++) {
            $participants[] = [
                'project_team_id' => $projectTeam->id,
                'member_id' => $request->post('participants')[$i]['member_id'],
                'expertise' => $request->post('participants')[$i]['expertise'],
                'assessment' => $request->post('participants')[$i]['assessment'],
                'score' => $request->post('participants')[$i]['score'],
            ];

            $points = ($request->post('overall_score') / 5) * ($request->post('participants')[$i]['score'] / 5) * $projectPoints;
            DB::table('leaderboards')
                ->where([
                    'user_id' => $request->post('participants')[$i]['member_id'],
                    'expertise' => $request->post('participants')[$i]['expertise'],
                ])
                ->update(['points' => DB::raw("points + $points")]);
        }

        ProjectTeamMember::where('project_team_id', $projectTeam->id)->delete();
        ProjectTeamMember::insert($participants);

        return response()->json([
            'message' => 'Review has been posted',
        ]);

    }
}
