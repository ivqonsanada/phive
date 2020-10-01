<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Project;
use App\Wishlist;
use Illuminate\Http\Request;

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
}
