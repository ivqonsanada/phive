<?php

namespace App\Http\Controllers;

use App\ProjectBox;
use Illuminate\Http\Request;

class ProjectBoxController extends Controller
{
    public function getAll(Request $request) {
        $user = $request->user();
        $projectBox = ProjectBox::with('project.user')->where('user_id', $user->id)->latest()->get();

        return response()->json($projectBox);
    }

    public function confirmProject(Request $request) {
        $user = $request->user();
        $projectBox = ProjectBox::find($request->post('project_box_id'));

        if ( $user->id === $projectBox->user_id ) {
            $projectBox->status = 'Waiting to Start';
            $projectBox->save();
        }

        $projectBox = ProjectBox::with('project.user')->where('user_id', $user->id)->get();

        return response()->json([
            'status' => 'success',
            'message' => 'You are confirmed to Join the Project',
            'projectbox' => $projectBox
        ]);
    }
}
