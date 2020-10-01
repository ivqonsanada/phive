<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Project;
use App\ProjectBox;
use App\Team;
use App\User;
use App\Wishlist;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get authenticated user.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function current(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'Student') {
            $projects = ProjectBox::with('project.user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user->id)->latest()->get();
            $wishlists = Wishlist::with('project.user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user->id)->latest()->get();
            $team = Team::with('members.member:id,tagname,first_name,last_name,photo_url,email')->where('leader_id', $user->id)->first();

            return response()->json(
                [
                    'user' => $user,
                    'projects' => $projects,
                    'wishlists' => $wishlists,
                    'team' => $team
                ]
            );
        } else {
            $projects = Project::with('user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user->id)->latest()->get();

            return response()->json(
                [
                    'user' => $user,
                    'projects' => $projects,
                    'wishlists' => null
                ]
            );
        }
    }

    public function uploadAvatar(Request $request)
    {
        $userAuth = $request->user();

        $this->validate($request, [
            'file' => 'required|image|mimes:jpeg,png,jpg|max:516',
        ]);

        if ($request->hasFile('file')) {
            $image = $request->file('file');
            $extension = $image->extension();
            $imgName = $this->generateRandomString(25) . '.' . $extension;
            $destinationPath = storage_path('app/public/images/avatar');
            $image->move($destinationPath, $imgName);

            if ($userAuth->photo_url) {
                $path = storage_path() . 'app/public/images/avatar/' . $userAuth->photo_url;
                if (file_exists($path)) unlink($path);
            }

            $user = User::findOrFail($userAuth->id);
            $user->photo_url = $imgName;
            $user->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Photo has been Changed',
            'avatar' => '/storage/images/avatar/' . $imgName
        ]);
    }

    public function saveProfile1(Request $request)
    {
        $userAuth = $request->user();
        $newUserData = $request->post('user');

        $user = User::findOrFail($userAuth->id);

        $user->first_name = $newUserData['first_name'];
        $user->last_name = $newUserData['last_name'];
        $user->identity_number = $newUserData['identity_number'];
        $user->university = $newUserData['university'];
        $user->faculty = $newUserData['faculty'];
        $user->major = $newUserData['major'];
        $user->location = $newUserData['location'];
        $user->biography = $newUserData['biography'];

        $user->behance = $newUserData['behance'];
        $user->github = $newUserData['github'];
        $user->linkedin = $newUserData['linkedin'];
        $user->dribbble = $newUserData['dribbble'];
        $user->website = $newUserData['website'];

        $user->tagname = $newUserData['tagname'];

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile has been updated',
            'user' => $user
        ]);
    }

    public function saveProfile2(Request $request)
    {
        $userAuth = $request->user();
        $user = User::findOrFail($userAuth->id);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile has been updated',
            'user' => $user
        ]);
    }

    private function generateRandomString($length = 10)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }
}
