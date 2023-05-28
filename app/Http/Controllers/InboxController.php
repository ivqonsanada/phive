<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInboxRequest;
use App\Http\Requests\UpdateInboxRequest;
use App\Models\Inbox;

class InboxController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInboxRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Inbox $inbox)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inbox $inbox)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInboxRequest $request, Inbox $inbox)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inbox $inbox)
    {
        //
    }
}
