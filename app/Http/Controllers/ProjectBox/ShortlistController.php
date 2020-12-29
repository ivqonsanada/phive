<?php

namespace App\Http\Controllers\ProjectBox;

use App\Http\Controllers\Controller;
use App\IndividualApplicant;
use App\Project;
use App\ProjectBox;
use App\TeamApplicant;
use Illuminate\Http\Request;

class ShortlistController extends Controller
{
    public function index(Request $request, Project $project)
    {
        $this->authorize('owner', $project);

        $shortlistIndividual = IndividualApplicant::with(['from:id,tagname,first_name,last_name,photo_url,email'])
            ->where([
                'project_id' => $project->id,
                'status' => 'Applying',
            ])->get();

        $shortlistTeam = TeamApplicant::with(['applicant_team_members.member:id,tagname,first_name,last_name,photo_url,email'])->where('project_id', $project->id)->get();

        return response()->json([
            'shortlistIndividual' => $shortlistIndividual,
            'shortlistTeam' => $shortlistTeam,
            'project' => $project,
        ]);

    }

    public function proceedShortlist(Request $request, Project $project)
    {
        $this->authorize('owner', $project);

        $lecturer = $request->user();

        $individuals = $request->post('individuals');
        $teams = $request->post('teams');

        $individuals_id = [];
        foreach ($individuals as $i) {
            array_push($individuals_id, $i['user_id']);
        }

        $teams_id = [];
        foreach ($teams as $i) {
            array_push($teams_id, $i['leader_id']);
        }

        TeamApplicant::where('project_id', $project->id)
            ->whereIn('from_id', $teams_id)
            ->update(['status' => 'Waiting']);

        IndividualApplicant::where('project_id', $project->id)
            ->whereIn('from_id', $individuals_id)
            ->update(['status' => 'Waiting']);

        ProjectBox::where('project_id', $project->id)
            ->whereIn('user_id', [...$individuals_id, ...$teams_id])
            ->update(['status' => 'Accepted']);

        ProjectBox::where(['project_id' => $project->id, 'user_id' => $lecturer->id])
            ->update(['status' => 'Confirmation']);

        $projectBoxes = ProjectBox::lecturerProjectBoxes($lecturer);

        return response()->json([
            'message' => 'You accepted these students',
            'project_boxes' => $projectBoxes,
        ]);
    }
}
