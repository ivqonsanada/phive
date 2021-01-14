<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function explore(Request $request)
    {
        $user = $request->user();

        if ($user && $user->role === 'Student') {
            $projects = Project::with(['user:id,tagname,first_name,last_name,photo_url,email', 'is_wished' =>
                function ($q) use ($user) {
                    $q->where('wishlists.user_id', $user->id);
                }])->where('status', '!=', 'Draft')->latest()->simplePaginate(9);
            return response()->json($projects);
        } else {
            $projects = Project::with(['user:id,tagname,first_name,last_name,photo_url,email'])->where('status', '!=', 'Draft')->latest()->simplePaginate(9);
            return response()->json($projects);
        }
    }

    public function search(Request $request)
    {
        $query = $request->get('query');

        $projects = Project::with(['user:id,tagname,first_name,last_name,photo_url,email'])
            ->where('title', 'like', "%{$query}%")
            ->latest()
            ->simplePaginate(9);

        return response()->json($projects);
    }

    public function show(Request $request, Project $project)
    {
        $user = $request->user();
        if ($user) {

            $project = Project::with(['user:id,tagname,first_name,last_name,photo_url,email,expertise,identity_number', 'skills', 'requirements', 'project_team.members.member', 'project_review', 'is_wished' =>
                function ($q) use ($user) {
                    $q->where('wishlists.user_id', $user->id);
                }])->findOrFail($project->id);

            return response()->json($project);
        }

        $project = Project::with(['user:id,tagname,first_name,last_name,photo_url,email,expertise,identity_number', 'skills', 'requirements', 'project_team.members.member'])->findOrFail($project->id);

        return response()->json($project);
    }

    public function similarProjects(Request $request, Project $project)
    {
        $user = $request->user();
        if ($user) {
            $other_projects = null;

            $expertise = $user->expertise;
            if ($expertise === 'UI/UX Designer') {$expertise = 'ui_ux_designer';}
            else if ($expertise === 'Frontend Engineer') {$expertise = 'front_end_engineer';}
            else if ($expertise === 'Backend Engineer') {$expertise = 'back_end_engineer';}
            else if ($expertise === 'Data Expert') {$expertise = 'data_expert';}

            if ($user && $user->role === 'Student') {
                $other_projects = Project::with(['user:id,tagname,first_name,last_name,photo_url,email', 'is_wished' =>
                    function ($q) use ($user) {
                        $q->where('wishlists.user_id', $user->id);
                    }])->where('id', '!=', $project->id)->where($expertise, 1)->inRandomOrder()->take(3)->get();
            } else {
                $other_projects = Project::with(['user:id,tagname,first_name,last_name,photo_url,email'])->where('id', '!=', $project->id)->inRandomOrder()->take(3)->get();
            }

            return response()->json($other_projects);
        }

        $other_projects = Project::with(['user:id,tagname,first_name,last_name,photo_url,email'])->where('id', '!=', $project->id)->inRandomOrder()->take(3)->get();

        return response()->json($other_projects);
    }
}
