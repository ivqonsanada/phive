<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Only lecturers publish work, and only on their own account.
     */
    public function create(User $user): bool
    {
        return $user->isLecturer();
    }

    public function update(User $user, Project $project): bool
    {
        return $user->isLecturer() && $user->id === $project->user_id;
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->update($user, $project);
    }
}
