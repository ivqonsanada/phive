<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * The signed-in user, as the frontend's session bootstrap.
     */
    public function current(Request $request): UserResource
    {
        $user = $request->user()
            ->loadMissing(['skills', 'experiences', 'leaderboards'])
            // whenCounted('unread_inbox') in UserResource reads the "_count" suffix.
            ->loadCount(['inboxes as unread_inbox_count' => fn ($query) => $query->where('is_read', false)]);

        return new UserResource($user);
    }
}
