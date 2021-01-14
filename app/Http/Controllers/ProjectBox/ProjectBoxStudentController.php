<?php

namespace App\Http\Controllers\ProjectBox;

use App\Http\Controllers\Controller;
use App\IndividualApplicant;
use App\ProjectBox;
use App\TeamApplicant;
use Illuminate\Http\Request;

class ProjectBoxStudentController extends Controller
{
    public function confirmProject(Request $request)
    {
        $user = $request->user();
        $isAgree = $request->post('isAgree');
        $projectBox = ProjectBox::find($request->post('project_box_id'));
        $message = '';

        if ($user->id === $projectBox->user_id && $projectBox->status === 'Accepted') {
            if ($isAgree) {
                $projectBox->status = 'Waiting to Start';
                $projectBox->save();

                $isTeamApplicant = TeamApplicant::
                    where('project_id', $projectBox->project_id)
                    ->where('from_id', $user->id)
                    ->where('status', 'Waiting')
                    ->update(['status' => 'Fixed']);

                if (!$isTeamApplicant) {
                    IndividualApplicant::
                        where('project_id', $projectBox->project_id)
                        ->where('from_id', $user->id)
                        ->update(['status' => 'Fixed']);
                }

                $message = 'You confirmed to Join the Project';
            } else {
                $projectBox->status = 'Bail Out';
                $projectBox->save();

                IndividualApplicant::
                    where('project_id', $projectBox->project_id)
                    ->where('from_id', $user->id)
                    ->update(['status' => 'Bail Out']);

                $message = 'You chose Bail Out the project';
            }
        } else {
            $message = 'You are no longer allowed doing this process.';

            $projectBox = ProjectBox::with('project.user')->where('user_id', $user->id)->latest()->get();

            return response()->json([
                'message' => $message,
                'project_boxes' => $projectBox,
            ], 400);
        }

        $projectBox = ProjectBox::with('project.user')->where('user_id', $user->id)->latest()->get();

        return response()->json([
            'message' => $message,
            'project_boxes' => $projectBox,
        ]);
    }
}
