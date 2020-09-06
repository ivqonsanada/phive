<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Project;
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
            $projects = Project::with('user')->where('user_id', $user->id)->get();
            $wishlists = Wishlist::with('user')->where('user_id', $user->id)->get();

            return response()->json(
                [
                    'user' => $user,
                    'projects' => $projects,
                    'wishlists' => $wishlists
                ]
            );
        } else {
            $projects = Project::with('user')->where('user_id', $user->id)->get();

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
            $name = $this->generateRandomString(25) . '.' . $extension;
            $destinationPath = public_path('/images/avatar/');
            $image->move($destinationPath, $name);

            if ($userAuth->photo_url) {
                $path = public_path() . '/images/avatar/' . $userAuth->photo_url;
                if (file_exists($path)) unlink($path);
            }

            $user = User::find($userAuth->id);
            $user->photo_url = $name;
            $user->save();
        }

        return response()->json([
            'success' => 'Image uploaded successfully',
            'avatar' => '/images/avatar/' . $name
        ]);
    }

    public function saveProfile(Request $request)
    {
        $userAuth = $request->user();
        $newUserData = $request->post('user');

        $user = User::find($userAuth->id);

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
            'success' => 'Profile updated successfully',
            'user' => User::find($userAuth->id)
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
