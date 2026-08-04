<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\UserSkill;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Partial update: every field is `sometimes`, so a form may send only what it owns.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($request, $user) {
            $user->update($request->safe()->except('skills'));

            if ($request->has('skills')) {
                // Edited as a whole list, so replace rather than diff.
                UserSkill::where('user_id', $user->id)->delete();

                foreach (array_unique($request->input('skills', [])) as $name) {
                    UserSkill::create(['user_id' => $user->id, 'name' => $name]);
                }
            }
        });

        return response()->json([
            'message' => 'Profile updated.',
            'user' => new UserResource($user->fresh()->load(['skills', 'experiences', 'leaderboards'])),
        ]);
    }
}
