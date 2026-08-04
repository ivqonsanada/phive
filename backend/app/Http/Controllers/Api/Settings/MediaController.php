<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Support\StoredFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Avatar, CV and project thumbnail uploads.
 *
 * Unlike the legacy app there is no "temp upload" staging area: a project must exist
 * (as a draft) before it can have a thumbnail, which removes the orphaned-file problem
 * entirely.
 */
class MediaController extends Controller
{
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:'.config('phive.uploads.avatar_max_kb'),
            ],
        ]);

        $user = $request->user();
        $user->update([
            'photo_url' => StoredFile::replace($user->photo_url, $request->file('file'), 'avatars'),
        ]);

        return response()->json([
            'message' => 'Avatar updated.',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        StoredFile::delete($user->photo_url);
        $user->update(['photo_url' => null]);

        return response()->json(['message' => 'Avatar removed.']);
    }

    public function uploadCv(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf',
                'max:'.config('phive.uploads.cv_max_kb'),
            ],
        ]);

        $user = $request->user();
        $user->update([
            'cv_url' => StoredFile::replace($user->cv_url, $request->file('file'), 'cv'),
        ]);

        return response()->json([
            'message' => 'CV updated.',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function deleteCv(Request $request): JsonResponse
    {
        $user = $request->user();

        StoredFile::delete($user->cv_url);
        $user->update(['cv_url' => null]);

        return response()->json(['message' => 'CV removed.']);
    }

    public function uploadThumbnail(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $request->validate([
            'file' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:'.config('phive.uploads.thumbnail_max_kb'),
            ],
        ]);

        $project->update([
            'thumbnail' => StoredFile::replace(
                $project->thumbnail,
                $request->file('file'),
                'project-thumbnails',
            ),
        ]);

        return response()->json([
            'message' => 'Thumbnail updated.',
            'project' => new ProjectResource($project->fresh()->load('user')),
        ]);
    }

    public function deleteThumbnail(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        StoredFile::delete($project->thumbnail);
        $project->update(['thumbnail' => null]);

        return response()->json(['message' => 'Thumbnail removed.']);
    }
}
