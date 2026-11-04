<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Administrators manage everything.
     */
    public function before(User $user): ?bool
    {
        return $user->is_admin ? true : null;
    }

    /**
     * Users can access the project-management area.
     */
    public function viewAny(User $user): bool
    {
        return $user->isStudent() || $user->isLecturer();
    }

    /**
     * Users can view their own projects.
     */
    public function view(User $user, Project $project): bool
    {
        return $user->id === $project->user_id;
    }

    /**
     * Students and lecturers can create projects.
     */
    public function create(User $user): bool
    {
        return $user->isStudent() || $user->isLecturer();
    }

    /**
     * Users can update only projects they own.
     */
    public function update(User $user, Project $project): bool
    {
        return ($user->isStudent() || $user->isLecturer())
            && $user->id === $project->user_id;
    }

    /**
     * Users can delete only projects they own.
     */
    public function delete(User $user, Project $project): bool
    {
        return $this->update($user, $project);
    }
}