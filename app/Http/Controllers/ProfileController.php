<?php

namespace App\Http\Controllers;

use App\User;
use App\Project;
use App\ProjectBox;
use App\Wishlist;

class ProfileController extends Controller
{
    public function getUser($tagname)
    {
        $user = User::with(['skills', 'experiences', 'leaderboards'])->where('tagname', $tagname)->firstOrFail();

        if ($user->role === 'Student') {
            $projects = ProjectBox::with('project.user:id,tagname,first_name,last_name,photo_url,email')->where([
                'user_id' => $user->id,
                'status' => 'Finished'
            ])->latest()->get();
            $wishlists = Wishlist::with('project.user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user->id)->where('status', true)->latest()->get();

            return response()->json(
                [
                    'user' => $user,
                    'projects' => $projects,
                    'wishlists' => $wishlists
                ]);
        } else {
            $projects = Project::with('user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user->id)->latest()->get();

            return response()->json(
                [
                    'user' => $user,
                    'projects' => $projects,
                    'wishlists' => []
                ]);
        }
    }
}
