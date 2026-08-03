<?php

namespace App\Http\Controllers\Api;

use App\Enums\ApplicationStatus;
use App\Enums\Expertise;
use App\Enums\ProjectBoxStatus;
use App\Enums\ProjectLevel;
use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserSummaryResource;
use App\Models\IndividualApplicant;
use App\Models\Leaderboard;
use App\Models\Project;
use App\Models\ProjectBox;
use App\Models\ProjectReview;
use App\Models\ProjectTeam;
use App\Models\ProjectTeamMember;
use App\Models\TeamApplicant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * The lecturer's half of the project lifecycle after hiring: kicking the work off
 * and closing it out with a review.
 */
class ProjectWorkflowController extends Controller
{
    /**
     * Start the project with whoever confirmed. Everyone else is released.
     */
    public function start(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        abort_if(
            $project->status === ProjectStatus::Ongoing,
            409,
            'This project has already started.',
        );

        $confirmed = ProjectBox::where('project_id', $project->id)
            ->where('status', ProjectBoxStatus::WaitingToStart)
            ->pluck('user_id');

        abort_if(
            $confirmed->isEmpty(),
            422,
            'Nobody has confirmed yet, so there is no team to start with.',
        );

        DB::transaction(function () use ($project, $confirmed) {
            $project->update([
                'status' => ProjectStatus::Ongoing,
                'is_open_hiring' => false,
                'start_time' => now(),
            ]);

            $team = ProjectTeam::firstOrCreate(['project_id' => $project->id]);

            // Whichever expertise each person applied under carries into the team.
            $expertise = IndividualApplicant::where('project_id', $project->id)
                ->whereIn('from_id', $confirmed)
                ->pluck('expertise', 'from_id');

            foreach ($confirmed as $userId) {
                ProjectTeamMember::firstOrCreate(
                    ['project_team_id' => $team->id, 'member_id' => $userId],
                    ['expertise' => $expertise[$userId] ?? null],
                );
            }

            ProjectBox::where('project_id', $project->id)
                ->whereIn('user_id', $confirmed)
                ->update(['status' => ProjectBoxStatus::ProjectStarted]);

            ProjectBox::where('project_id', $project->id)
                ->where('user_id', $project->user_id)
                ->update(['status' => ProjectBoxStatus::Ongoing]);

            // Anyone who did not make it is released rather than left hanging.
            ProjectBox::where('project_id', $project->id)
                ->whereNotIn('user_id', [...$confirmed->all(), $project->user_id])
                ->update(['status' => ProjectBoxStatus::Rejected]);

            IndividualApplicant::where('project_id', $project->id)
                ->whereIn('from_id', $confirmed)
                ->update(['status' => ApplicationStatus::Fixed]);

            TeamApplicant::where('project_id', $project->id)
                ->whereIn('from_id', $confirmed)
                ->update(['status' => ApplicationStatus::Fixed]);
        });

        return response()->json(['message' => 'Project started.']);
    }

    /**
     * The team as it stands, for building the review form.
     */
    public function reviewForm(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $team = ProjectTeam::with('members.member')->firstWhere('project_id', $project->id);

        return response()->json([
            'participants' => $team?->members->map(fn (ProjectTeamMember $member) => [
                'member_id' => $member->member_id,
                'expertise' => $member->expertise,
                'score' => $member->score,
                'assessment' => $member->assessment,
                'user' => new UserSummaryResource($member->member),
            ]) ?? [],
            'review' => $project->review,
        ]);
    }

    /**
     * Close the project out: record the review, score each participant, and award
     * leaderboard points.
     */
    public function review(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        abort_unless(
            $project->status === ProjectStatus::Ongoing,
            409,
            'Only an ongoing project can be reviewed.',
        );

        $data = $request->validate([
            'overall_score' => ['required', 'numeric', 'min:0', 'max:5'],
            'overall_review' => ['nullable', 'string', 'max:5000'],
            'project_result' => ['nullable', 'string', 'max:2000'],
            'participants' => ['required', 'array', 'min:1'],
            'participants.*.member_uuid' => ['required', 'uuid'],
            'participants.*.expertise' => ['required', Rule::enum(Expertise::class)],
            'participants.*.score' => ['required', 'numeric', 'min:0', 'max:5'],
            'participants.*.assessment' => ['nullable', 'string', 'max:2000'],
        ]);

        $team = ProjectTeam::firstWhere('project_id', $project->id);
        abort_unless($team, 409, 'This project has no team to review.');

        // Participants arrive as public identifiers; map them to internal ids, scoped
        // to this project's team so a stray uuid cannot be scored onto it.
        $memberIds = User::whereIn(
            'id',
            ProjectTeamMember::where('project_team_id', $team->id)->pluck('member_id'),
        )->pluck('id', 'uuid');

        foreach ($data['participants'] as $participant) {
            abort_unless(
                $memberIds->has($participant['member_uuid']),
                422,
                'Everyone scored has to be on this project team.',
            );
        }

        $level = $project->level_applicant
            ? ProjectLevel::tryFrom($project->level_applicant)
            : null;

        DB::transaction(function () use ($project, $team, $data, $level, $memberIds) {
            $project->update([
                'status' => ProjectStatus::Finished,
                'finish_time' => now(),
            ]);

            ProjectBox::where('project_id', $project->id)
                ->whereIn('status', [ProjectBoxStatus::ProjectStarted, ProjectBoxStatus::Ongoing])
                ->update(['status' => ProjectBoxStatus::Finished]);

            ProjectReview::updateOrCreate(
                ['project_id' => $project->id],
                [
                    'overall_score' => (string) $data['overall_score'],
                    'overall_review' => $data['overall_review'] ?? null,
                    'project_result' => $data['project_result'] ?? null,
                ],
            );

            foreach ($data['participants'] as $participant) {
                ProjectTeamMember::updateOrCreate(
                    ['project_team_id' => $team->id, 'member_id' => $memberIds[$participant['member_uuid']]],
                    [
                        'expertise' => $participant['expertise'],
                        'score' => (string) $participant['score'],
                        'assessment' => $participant['assessment'] ?? null,
                    ],
                );

                if (! $level) {
                    continue;
                }

                $award = $level->award((float) $data['overall_score'], (float) $participant['score']);

                // The legacy version issued a bare UPDATE, so a student without a
                // leaderboard row silently earned nothing. Create it if missing.
                $board = Leaderboard::firstOrCreate(
                    ['user_id' => $memberIds[$participant['member_uuid']], 'expertise' => $participant['expertise']],
                    ['points' => 0],
                );

                $board->increment('points', $award);
            }
        });

        return response()->json(['message' => 'Review posted and points awarded.']);
    }
}
