<?php

namespace App\Http\Controllers;

use App\Leaderboard;

class LeaderboardController extends Controller
{
    public function index()
    {
        $topDesigner = Leaderboard::with(['user:id,tagname,first_name,last_name,photo_url,email', 'user.finished_project:id,user_id,project_id'])->orderBy('points', 'desc')->where('expertise', 'UI/UX Designer')->simplePaginate(10);
        $topFrontend = Leaderboard::with(['user:id,tagname,first_name,last_name,photo_url,email', 'user.finished_project:id,user_id,project_id'])->orderBy('points', 'desc')->where('expertise', 'Frontend Engineer')->simplePaginate(10);
        $topBackend = Leaderboard::with(['user:id,tagname,first_name,last_name,photo_url,email', 'user.finished_project:id,user_id,project_id'])->orderBy('points', 'desc')->where('expertise', 'Backend Engineer')->simplePaginate(10);
        $topData = Leaderboard::with(['user:id,tagname,first_name,last_name,photo_url,email', 'user.finished_project:id,user_id,project_id'])->orderBy('points', 'desc')->where('expertise', 'Data Expert')->simplePaginate(10);

        return response()->json([
            'top_boards' => [
                'ui_ux_designer' => $topDesigner,
                'frontend_engineer' => $topFrontend,
                'backend_engineer' => $topBackend,
                'data_expert' => $topData,
            ],
        ]);
    }
}
