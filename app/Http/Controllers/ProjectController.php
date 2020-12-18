<?php

namespace App\Http\Controllers;

use App\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function explore() {
        $projects = Project::with('user:id,tagname,first_name,last_name,photo_url,email')->latest()->simplePaginate(8);

        return response()->json($projects);
    }

    public function search(Request $request) {
        $query = $request->get('query');

        $projects = Project::with('user:id,tagname,first_name,last_name,photo_url,email')
            ->where('title', 'like', "%{$query}%")
            ->latest()
            ->simplePaginate(8);

        return response()->json($projects);
    }

    public function filter(Request $request) {
        $query = $request->get('filter');

        $projects = Project::with('user:id,tagname,first_name,last_name,photo_url,email')
            ->where('title', 'like', "%{$query}%")
            ->latest()
            ->simplePaginate(8);

        return response()->json($projects);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $project = Project::with(['user:id,tagname,first_name,last_name,photo_url,email,expertise,identity_number', 'project_requirements', 'project_skills'])->findOrFail($id);

        return response()->json($project);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
