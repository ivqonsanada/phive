<?php

namespace App\Http\Controllers\Api;

use App\Enums\Expertise;
use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    private const PER_PAGE = 9;

    /**
     * Explore and search share one endpoint: search is just `?query=`.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'query' => ['nullable', 'string', 'max:255'],
            'expertise' => ['nullable', Rule::enum(Expertise::class)],
            'status' => ['nullable', Rule::enum(ProjectStatus::class)],
            'open_only' => ['nullable', 'boolean'],
        ]);

        $projects = $this->baseQuery($request->user())
            ->when(
                $filters['query'] ?? null,
                // lower() rather than ILIKE so the same query works on SQLite in tests.
                fn (Builder $query, string $term) => $query->where(function (Builder $inner) use ($term) {
                    $pattern = '%'.mb_strtolower($term).'%';

                    $inner->whereRaw('lower(title) like ?', [$pattern])
                        ->orWhereRaw('lower(description) like ?', [$pattern]);
                }),
            )
            ->when(
                $filters['expertise'] ?? null,
                fn (Builder $query, string $expertise) => $query->where(
                    Expertise::from($expertise)->projectColumn(),
                    true,
                ),
            )
            ->when(
                $filters['status'] ?? null,
                fn (Builder $query, string $status) => $query->where('status', $status),
            )
            ->when(
                filter_var($filters['open_only'] ?? false, FILTER_VALIDATE_BOOL),
                fn (Builder $query) => $query->where('is_open_hiring', true),
            )
            ->latest()
            ->simplePaginate(self::PER_PAGE)
            ->withQueryString();

        return ProjectResource::collection($projects);
    }

    public function show(Request $request, Project $project): ProjectResource
    {
        // baseQuery() is scoped to published projects, so a draft 404s here.
        $project = $this->baseQuery($request->user())
            ->with([
                'skills',
                'requirements',
                'review',
                'projectTeam.leader',
                'projectTeam.members.member',
            ])
            ->findOrFail($project->id);

        return new ProjectResource($project);
    }

    /**
     * Three other projects to look at next — matched to the viewer's expertise when
     * we know it, random otherwise.
     */
    public function similar(Request $request, Project $project): AnonymousResourceCollection
    {
        $user = $request->user();

        $projects = $this->baseQuery($user)
            ->whereKeyNot($project->id)
            ->when(
                $user?->expertise,
                fn (Builder $query, Expertise $expertise) => $query->where(
                    $expertise->projectColumn(),
                    true,
                ),
            )
            ->inRandomOrder()
            ->take(3)
            ->get();

        return ProjectResource::collection($projects);
    }

    /**
     * Published projects with their author, plus the viewer's wishlist flag when the
     * request carried a token.
     *
     * @return Builder<Project>
     */
    private function baseQuery(?User $user): Builder
    {
        return Project::query()
            ->published()
            ->with('user')
            ->when($user, fn (Builder $query, User $viewer) => $query->withExists([
                'wishlists as is_wished' => fn (Builder $wishlist) => $wishlist
                    ->where('user_id', $viewer->id)
                    ->where('status', true),
            ]));
    }
}
