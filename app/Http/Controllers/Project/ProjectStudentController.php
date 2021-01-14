<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Project;
use App\Wishlist;
use Illuminate\Http\Request;

class ProjectStudentController extends Controller
{
    public function addToWishlist(Request $request, Project $project)
    {
        $user_id = $request->user()->id;

        Wishlist::updateOrCreate([
            'project_id' => $project->id,
            'user_id' => $user_id,
        ], ['status' => $request->post('status')]);

        $wishlists = Wishlist::with('project.user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user_id)->where('status', true)->get();

        if ($request->post('status') === true) {
            return response()->json([
                'message' => 'Project has been added to your Wishlist',
                'wishlists' => $wishlists,
            ]);
        }

        return response()->json([
            'message' => 'Project has been removed from your Wishlist',
            'wishlists' => $wishlists,
        ]);
    }
}
