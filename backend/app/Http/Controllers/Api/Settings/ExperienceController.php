<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $experience = Experience::create([
            ...$this->validated($request),
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['experience' => $experience], 201);
    }

    public function update(Request $request, Experience $experience): JsonResponse
    {
        $this->authorizeOwnership($request, $experience);

        $experience->update($this->validated($request));

        return response()->json(['experience' => $experience->fresh()]);
    }

    public function destroy(Request $request, Experience $experience): JsonResponse
    {
        $this->authorizeOwnership($request, $experience);

        $experience->delete();

        return response()->json(['message' => 'Experience removed.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'project_name' => ['required', 'string', 'max:255'],
            'project_role' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            // An open-ended entry means "still working on it".
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);
    }

    /**
     * Experiences have no policy of their own — ownership is the only rule.
     */
    private function authorizeOwnership(Request $request, Experience $experience): void
    {
        abort_unless($experience->user_id === $request->user()->id, 403);
    }
}
