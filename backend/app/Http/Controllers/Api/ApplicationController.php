<?php

namespace App\Http\Controllers\Api;

use App\Enums\Expertise;
use App\Enums\ProjectBoxStatus;
use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Models\ApplicantTeamMember;
use App\Models\IndividualApplicant;
use App\Models\Project;
use App\Models\ProjectBox;
use App\Models\Team;
use App\Models\TeamApplicant;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ApplicationController extends Controller
{
    /**
     * Apply on your own.
     */
    public function applyAsIndividual(Request $request, Project $project): JsonResponse
    {
        $student = $request->user();

        $this->assertCanApply($request, $project);
        abort_unless(
            $project->applicant_type->allowsIndividual(),
            422,
            'This project only accepts team applications.',
        );

        $data = $request->validate([
            'expertise' => ['required', Rule::enum(Expertise::class)],
            'self_describe' => ['nullable', 'string', 'max:2000'],
            'apply_reason' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($project, $student, $data) {
            IndividualApplicant::create([
                ...$data,
                'project_id' => $project->id,
                'from_id' => $student->id,
                'to_id' => $project->user_id,
            ]);

            $this->openProjectBox($project, $student->id);
        });

        return response()->json(['message' => 'Application submitted.'], 201);
    }

    /**
     * Apply with your party. Only the leader can do this, and every listed member
     * has to actually be in the party.
     */
    public function applyAsTeam(Request $request, Project $project): JsonResponse
    {
        $leader = $request->user();

        $this->assertCanApply($request, $project);
        abort_unless(
            $project->applicant_type->allowsTeam(),
            422,
            'This project only accepts individual applications.',
        );

        $team = Team::firstWhere('leader_id', $leader->id);
        abort_unless($team, 422, 'Build a party before applying as a team.');

        $data = $request->validate([
            'self_describe' => ['nullable', 'string', 'max:2000'],
            'apply_reason' => ['nullable', 'string', 'max:2000'],
            'members' => ['required', 'array', 'min:1'],
            'members.*.member_id' => ['required', 'integer'],
            'members.*.expertise' => ['required', Rule::enum(Expertise::class)],
        ]);

        $partyMemberIds = TeamMember::where('team_id', $team->id)->pluck('member_id')->all();

        foreach ($data['members'] as $member) {
            abort_unless(
                in_array($member['member_id'], $partyMemberIds, strict: true),
                422,
                'Every applicant has to be a member of your party.',
            );
        }

        DB::transaction(function () use ($project, $leader, $data) {
            $application = TeamApplicant::create([
                'project_id' => $project->id,
                'from_id' => $leader->id,
                'to_id' => $project->user_id,
                'self_describe' => $data['self_describe'] ?? null,
                'apply_reason' => $data['apply_reason'] ?? null,
            ]);

            foreach ($data['members'] as $member) {
                ApplicantTeamMember::create([
                    'team_applicant_id' => $application->id,
                    'member_id' => $member['member_id'],
                    'expertise' => $member['expertise'],
                ]);

                // Every listed member gets their own project box row.
                $this->openProjectBox($project, $member['member_id']);
            }
        });

        return response()->json(['message' => 'Team application submitted.'], 201);
    }

    /**
     * Withdraw an application that has not been acted on yet.
     */
    public function withdraw(Request $request, Project $project): JsonResponse
    {
        $student = $request->user();

        $individual = IndividualApplicant::where([
            'project_id' => $project->id,
            'from_id' => $student->id,
        ])->first();

        $team = TeamApplicant::where([
            'project_id' => $project->id,
            'from_id' => $student->id,
        ])->first();

        abort_unless($individual || $team, 404, 'You have not applied to this project.');

        DB::transaction(function () use ($individual, $team, $project, $student) {
            $individual?->delete();
            $team?->delete();

            ProjectBox::where(['project_id' => $project->id, 'user_id' => $student->id])
                ->where('status', ProjectBoxStatus::Waiting)
                ->delete();
        });

        return response()->json(['message' => 'Application withdrawn.']);
    }

    /**
     * Shared gate for both application routes.
     */
    private function assertCanApply(Request $request, Project $project): void
    {
        $student = $request->user();

        abort_unless($student->isStudent(), 403, 'Only students apply to projects.');
        abort_if($project->user_id === $student->id, 422, 'You cannot apply to your own project.');

        abort_unless(
            $project->status === ProjectStatus::Hiring && $project->is_open_hiring,
            422,
            'This project is not accepting applications.',
        );

        $alreadyApplied = IndividualApplicant::where([
            'project_id' => $project->id,
            'from_id' => $student->id,
        ])->exists() || TeamApplicant::where([
            'project_id' => $project->id,
            'from_id' => $student->id,
        ])->exists();

        abort_if($alreadyApplied, 409, 'You have already applied to this project.');
    }

    /**
     * The legacy version passed `status` inside firstOrCreate's search array, so a box
     * whose status had moved on would be treated as missing and violate the unique
     * (project_id, user_id) index. Search on the pair only.
     */
    private function openProjectBox(Project $project, int $userId): void
    {
        ProjectBox::firstOrCreate(
            ['project_id' => $project->id, 'user_id' => $userId],
            ['status' => ProjectBoxStatus::Waiting],
        );
    }
}
