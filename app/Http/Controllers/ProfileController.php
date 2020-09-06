<?php

namespace App\Http\Controllers;

use App\User;
use App\Project;
use App\Wishlist;

class ProfileController extends Controller
{
    public function getUser(User $user)
    {
        if ($user->role === 'Student') {
            $projects = Project::with('user')->where('user_id', $user->id)->get();
            $wishlists = Wishlist::with('user')->where('user_id', $user->id)->get();

            return response()->json(
                [
                    'user' => $user,
                    'projects' => $projects,
                    'wishlists' => $wishlists
                ]);
        } else {
            $projects = Project::with('user')->where('user_id', $user->id)->get();

            return response()->json(
                [
                    'user' => $user,
                    'projects' => $projects,
                    'wishlists' => null
                ]);
        }
    }
}
