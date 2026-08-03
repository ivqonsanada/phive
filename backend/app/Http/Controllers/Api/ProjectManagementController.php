<?php

namespace App\Http\Controllers\Api;

use App\Enums\ProjectBoxStatus;
use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\SaveProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\ProjectBox;
use App\Models\ProjectRequirement;
use App\Models\ProjectSkill;
use App\Support\ProjectUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/**
 * The lecturer's side of a project: drafting, editing, publishing and withdrawing.
 * Public reads live in ProjectController.
 */
class ProjectManagementController extends Controller
{
    /**
     * Everything this lecturer owns, drafts included.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $projects = Project::query()
            ->where('user_id', $request->user()->id)
            ->with(['user', 'skills', 'requirements'])
            ->latest()
            ->get();

        return ProjectResource::collection($projects);
    }

    public function store(SaveProjectRequest $request): JsonResponse
    {
        $this->authorize('create', Project::class);

        $project = DB::transaction(function () use ($request) {
            $project = Project::create([
                ...$this->attributes($request),
                'user_id' => $request->user()->id,
                'project_url' => ProjectUrl::generate($request->input('title')),
            ]);

            $this->syncDetails($project, $request);
            $this->syncLecturerBox($project);

            return $project;
        });

        return response()->json([
            'message' => $request->publishing()
                ? 'Project published.'
                : 'Draft saved.',
            'project' => new ProjectResource($project->load(['user', 'skills', 'requirements'])),
        ], 201);
    }

    public function update(SaveProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        DB::transaction(function () use ($request, $project) {
            $project->update($this->attributes($request));

            $this->syncDetails($project, $request);
            $this->syncLecturerBox($project);
        });

        return response()->json([
            'message' => $request->publishing() ? 'Project published.' : 'Changes saved.',
            'project' => new ProjectResource(
                $project->fresh()->load(['user', 'skills', 'requirements']),
            ),
        ]);
    }

    /**
     * Publish without touching any other field — the "post it now" button on a draft.
     */
    public function publish(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        abort_if(
            $project->status !== ProjectStatus::Draft,
            409,
            'Only a draft can be published.',
        );

        abort_if(
            blank($project->title) || blank($project->description),
            422,
            'Give the project a title and description before publishing it.',
        );

        DB::transaction(function () use ($project) {
            $project->update(['status' => ProjectStatus::Hiring, 'is_open_hiring' => true]);
            $this->syncLecturerBox($project);
        });

        return response()->json([
            'message' => 'Project published.',
            'project' => new ProjectResource($project->fresh()->load(['user', 'skills', 'requirements'])),
        ]);
    }

    /**
     * Stop accepting applications while keeping the project itself visible.
     */
    public function closeApplications(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project->update(['is_open_hiring' => false]);

        ProjectBox::where('project_id', $project->id)
            ->where('user_id', $project->user_id)
            ->update(['status' => ProjectBoxStatus::Confirmation]);

        return response()->json(['message' => 'Applications closed.']);
    }

    /**
     * Withdraw a project. Cascades remove the boxes, applications and invitations.
     */
    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        abort_if(
            $project->status === ProjectStatus::Ongoing,
            409,
            'An ongoing project cannot be deleted — terminate it from the project box instead.',
        );

        $project->delete();

        return response()->json(['message' => 'Project withdrawn.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function attributes(SaveProjectRequest $request): array
    {
        $validated = $request->safe()->except(['publish', 'skills', 'requirements']);

        return [
            ...$validated,
            'status' => $request->publishing() ? ProjectStatus::Hiring : ProjectStatus::Draft,
        ];
    }

    /**
     * Skills and requirements are edited as whole lists, so replace rather than diff.
     */
    private function syncDetails(Project $project, SaveProjectRequest $request): void
    {
        if ($request->has('skills')) {
            ProjectSkill::where('project_id', $project->id)->delete();

            foreach (array_unique($request->input('skills', [])) as $name) {
                ProjectSkill::create(['project_id' => $project->id, 'name' => $name]);
            }
        }

        if ($request->has('requirements')) {
            ProjectRequirement::where('project_id', $project->id)->delete();

            foreach ($request->input('requirements', []) as $requirement) {
                ProjectRequirement::create([
                    'project_id' => $project->id,
                    'requirement' => $requirement,
                ]);
            }
        }
    }

    /**
     * The lecturer's own row in the project box mirrors the project's status.
     */
    private function syncLecturerBox(Project $project): void
    {
        ProjectBox::updateOrCreate(
            ['project_id' => $project->id, 'user_id' => $project->user_id],
            [
                'status' => $project->status === ProjectStatus::Draft
                    ? ProjectBoxStatus::Draft
                    : ProjectBoxStatus::Hiring,
            ],
        );
    }
}
