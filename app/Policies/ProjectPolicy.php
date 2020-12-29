<?php

namespace App\Policies;

use App\Project;
use App\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class ProjectPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    public function update(User $user, Project $project)
    {
        return $user->ownsProject($project) ? Response::allow()
                : Response::deny('You do not own this projects.');;
    }

    public function owner(User $user, Project $project)
    {
        return $user->ownsProject($project) ? Response::allow()
                : Response::deny('You do not own this project.');;
    }
}
