<?php

namespace App\Support;

use App\Models\Project;
use Illuminate\Support\Str;

class ProjectUrl
{
    /**
     * Build the public slug for a project.
     *
     * A random suffix is always appended rather than only on collision: two lecturers
     * naming a project "Final Year Website" should not be able to probe whether the
     * other exists, and the slug stays stable if the title is later edited.
     */
    public static function generate(?string $title): string
    {
        $base = Str::limit(Str::slug($title ?? '') ?: 'project', 60, '');

        do {
            $slug = $base.'-'.Str::lower(Str::random(8));
        } while (Project::where('project_url', $slug)->exists());

        return $slug;
    }
}
