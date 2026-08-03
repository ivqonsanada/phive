<?php

namespace App\Http\Controllers\Api;

use App\Enums\ApplicationStatus;
use App\Enums\ProjectBoxStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserSummaryResource;
use App\Models\ApplicantTeamMember;
use App\Models\IndividualApplicant;
use App\Models\Project;
use App\Models\ProjectBox;
use App\Models\TeamApplicant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * The lecturer's hiring screen: who applied, and who gets through.
 */
class ShortlistController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $individuals = IndividualApplicant::query()
            ->where('project_id', $project->id)
            ->with('applicant')
            ->get();

        $teams = TeamApplicant::query()
            ->where('project_id', $project->id)
            ->with(['leader', 'members.member'])
            ->get();

        return response()->json([
            'individuals' => $individuals->map(fn (IndividualApplicant $applicant) => [
                'id' => $applicant->id,
                'status' => $applicant->status,
                'expertise' => $applicant->expertise,
                'self_describe' => $applicant->self_describe,
                'apply_reason' => $applicant->apply_reason,
                'user' => new UserSummaryResource($applicant->applicant),
            ]),
            'teams' => $teams->map(fn (TeamApplicant $applicant) => [
                'id' => $applicant->id,
                'status' => $applicant->status,
                'self_describe' => $applicant->self_describe,
                'apply_reason' => $applicant->apply_reason,
                'leader' => new UserSummaryResource($applicant->leader),
                'members' => $applicant->members->map(fn (ApplicantTeamMember $member) => [
                    'expertise' => $member->expertise,
                    'user' => new UserSummaryResource($member->member),
                ]),
            ]),
        ]);
    }

    /**
     * Shortlist the chosen applicants. Everyone picked moves to "Accepted" and has to
     * confirm; the project itself moves to "Confirmation" while it waits for them.
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $data = $request->validate([
            'individual_ids' => ['array'],
            'individual_ids.*' => ['integer'],
            'team_ids' => ['array'],
            'team_ids.*' => ['integer'],
        ]);

        $individualIds = $data['individual_ids'] ?? [];
        $teamIds = $data['team_ids'] ?? [];

        abort_if(
            $individualIds === [] && $teamIds === [],
            422,
            'Pick at least one applicant to shortlist.',
        );

        DB::transaction(function () use ($project, $individualIds, $teamIds) {
            $chosen = collect();

            if ($individualIds !== []) {
                $applicants = IndividualApplicant::where('project_id', $project->id)
                    ->whereKey($individualIds)
                    ->get();

                IndividualApplicant::whereKey($applicants->modelKeys())
                    ->update(['status' => ApplicationStatus::Waiting]);

                $chosen = $chosen->merge($applicants->pluck('from_id'));
            }

            if ($teamIds !== []) {
                $applicants = TeamApplicant::where('project_id', $project->id)
                    ->whereKey($teamIds)
                    ->with('members')
                    ->get();

                TeamApplicant::whereKey($applicants->modelKeys())
                    ->update(['status' => ApplicationStatus::Waiting]);

                // A shortlisted team means every listed member is shortlisted.
                $chosen = $chosen
                    ->merge($applicants->pluck('from_id'))
                    ->merge($applicants->flatMap(fn (TeamApplicant $a) => $a->members->pluck('member_id')));
            }

            ProjectBox::where('project_id', $project->id)
                ->whereIn('user_id', $chosen->unique()->all())
                ->update(['status' => ProjectBoxStatus::Accepted]);

            ProjectBox::where([
                'project_id' => $project->id,
                'user_id' => $project->user_id,
            ])->update(['status' => ProjectBoxStatus::Confirmation]);
        });

        return response()->json(['message' => 'Applicants shortlisted.']);
    }
}
