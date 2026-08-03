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
                'uuid' => $applicant->uuid,
                'status' => $applicant->status,
                'expertise' => $applicant->expertise,
                'self_describe' => $applicant->self_describe,
                'apply_reason' => $applicant->apply_reason,
                'user' => new UserSummaryResource($applicant->applicant),
            ]),
            'teams' => $teams->map(fn (TeamApplicant $applicant) => [
                'uuid' => $applicant->uuid,
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
            'individual_uuids' => ['array'],
            'individual_uuids.*' => ['uuid'],
            'team_uuids' => ['array'],
            'team_uuids.*' => ['uuid'],
        ]);

        $individualUuids = $data['individual_uuids'] ?? [];
        $teamUuids = $data['team_uuids'] ?? [];

        abort_if(
            $individualUuids === [] && $teamUuids === [],
            422,
            'Pick at least one applicant to shortlist.',
        );

        DB::transaction(function () use ($project, $individualUuids, $teamUuids) {
            $chosen = collect();

            if ($individualUuids !== []) {
                $applicants = IndividualApplicant::where('project_id', $project->id)
                    ->whereIn('uuid', $individualUuids)
                    ->get();

                IndividualApplicant::whereKey($applicants->modelKeys())
                    ->update(['status' => ApplicationStatus::Waiting]);

                $chosen = $chosen->merge($applicants->pluck('from_id'));
            }

            if ($teamUuids !== []) {
                $applicants = TeamApplicant::where('project_id', $project->id)
                    ->whereIn('uuid', $teamUuids)
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
