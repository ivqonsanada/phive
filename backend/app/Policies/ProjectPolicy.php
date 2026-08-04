<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Administrators manage everything — that is what the admin panel is for.
     *
     * Without this the policy answers "no" to viewAny, view, update and delete for an
     * administrator looking at somebody else's project, because every other check
     * here is scoped to the owning lecturer. The panel does not enforce the policy
     * today, so the two quietly disagreed; this makes them agree.
     *
     * Returning null rather than false lets the specific checks below decide for
     * everyone who is not an administrator.
     */
    public function before(User $user): ?bool
    {
        return $user->is_admin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isLecturer();
    }

    public function view(User $user, Project $project): bool
    {
        return $user->id === $project->user_id;
    }

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
