<?php

namespace App\Http\Controllers\Auth;

use App\Experience;
use App\Http\Controllers\Controller;
use App\Project;
use App\ProjectBox;
use App\Team;
use App\User;
use App\UserSkill;
use App\Wishlist;
use Carbon\Carbon;
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
            $projects = ProjectBox::with('project.user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user->id)->where('status', 'Finished')->latest()->get();
            $wishlists = Wishlist::with('project.user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user->id)->where('status', true)->latest()->get();
            $user = User::with(['skills', 'experiences', 'leaderboards'])->withCount(['new_notifications'])->findOrFail($user->id);

            return response()->json(
                [
                    'user' => $user,
                    'projects' => $projects,
                    'wishlists' => $wishlists,
                ]
            );
        } else {
            $projects = Project::with('user:id,tagname,first_name,last_name,photo_url,email')->where('user_id', $user->id)->latest()->get();
            $user = User::with(['skills', 'experiences'])->withCount(['new_notifications'])->findOrFail($user->id);

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

        if ($userAuth && $request->hasFile('file')) {
            $image = $request->file('file');
            $extension = $image->extension();
            $imgName = $this->generateRandomString(25) . '.' . $extension;
            $destinationPath = storage_path('app/public/images/avatar');
            $image->move($destinationPath, $imgName);

            if ($userAuth->photo_url) {
                $path = storage_path() . '/app/public/images/avatar/' . $userAuth->photo_url;
                if (file_exists($path)) unlink($path);
            }

            $userAuth->photo_url = $imgName;
            $userAuth->save();

            return response()->json([
                'message' => 'Photo has been Changed',
                'avatar' => '/storage/images/avatar/' . $imgName
                ]);
        }
    }

    public function deleteAvatar(Request $request)
    {
        $userAuth = $request->user();

            if ($userAuth->photo_url) {
                $path = storage_path() . '/app/public/images/avatar/' . $userAuth->photo_url;
                if (file_exists($path)) unlink($path);
            }

            $userAuth->photo_url = null;
            $userAuth->save();

        return response()->json([
            'message' => 'Avatar has been deleted',
            'avatar' => $userAuth->avatar
        ]);
    }

    public function saveProfile1(Request $request)
    {
        $userAuth = $request->user();
        $newUserData = $request->post('user');

        $this->validate($request, [
            '*.tagname' => "unique:users,tagname,{$userAuth->id}",
        ],[
            '*.tagname.unique' => 'The tagname already been taken.'
        ]);

        $userAuth->first_name = $newUserData['first_name'];
        $userAuth->last_name = $newUserData['last_name'];
        $userAuth->identity_number = $newUserData['identity_number'];
        $userAuth->university = $newUserData['university'];
        $userAuth->faculty = $newUserData['faculty'];
        $userAuth->major = $newUserData['major'];
        $userAuth->location = $newUserData['location'];
        $userAuth->biography = $newUserData['biography'];

        $userAuth->behance = $newUserData['behance'];
        $userAuth->github = $newUserData['github'];
        $userAuth->linkedin = $newUserData['linkedin'];
        $userAuth->dribbble = $newUserData['dribbble'];
        $userAuth->website = $newUserData['website'];

        $userAuth->tagname = $newUserData['tagname'];

        $userAuth->save();

        $user = User::with(['skills', 'experiences'])->findOrFail($userAuth->id);

        return response()->json([
            'message' => 'Profile has been updated',
            'user' => $user
        ]);
    }

    public function saveProfile2(Request $request)
    {
        $userAuth = $request->user();
        $newUserData = $request->post('user');
        // if ($newUserData['is_open_hired'] === 'false') $newUserData['is_open_hired'] = false;
        // else $newUserData['is_open_hired'] = true;

        $userAuth->expertise = $newUserData['expertise'];
        $userAuth->is_open_hired = $newUserData['is_open_hired'];
        $userAuth->save();

        $skills = $newUserData['skills'];
        $experiences = $newUserData['experiences'];

        for ($i = 0; $i < count($skills); $i++) {
            $skills[$i]['user_id'] = $userAuth->id;
        }

        for ($i = 0; $i < count($experiences); $i++) {
            $experiences[$i]['start_date'] = Carbon::createFromFormat('Y-m-d\TH:i:s+',  $experiences[$i]['start_date']);
            $experiences[$i]['end_date'] = Carbon::createFromFormat('Y-m-d\TH:i:s+',  $experiences[$i]['end_date']);
            $experiences[$i]['user_id'] = $userAuth->id;
        }

        // return response()->json($experiences);

        UserSkill::where('user_id', $userAuth->id)->delete();
        UserSkill::insert($skills);

        Experience::where('user_id', $userAuth->id)->delete();
        Experience::insert($experiences);

        $user = User::with(['skills', 'experiences'])->findOrFail($userAuth->id);

        return response()->json([
            'message' => 'Profile has been updated',
            'user' => $user
        ]);
    }

    public function uploadCV(Request $request)
    {
        $userAuth = $request->user();

        $this->validate($request, [
            'file' => 'required|mimetypes:application/pdf|max:1024',
        ]);

        if ($userAuth && $request->hasFile('file')) {
            $image = $request->file('file');
            $extension = $image->extension();
            $imgName = $this->generateRandomString(25) . '.' . $extension;
            $destinationPath = storage_path('app/public/images/cv');
            $image->move($destinationPath, $imgName);

            if ($userAuth->cv_url) {
                $path = storage_path() . '/app/public/images/cv/' . $userAuth->cv_url;
                if (file_exists($path)) unlink($path);
            }

            $userAuth->cv_url = $imgName;
            $userAuth->save();

            return response()->json([
                'message' => 'CV has been Changed',
                'cv' => $userAuth->cv_url
                ]);
        }
    }

    public function deleteCV(Request $request)
    {
        $userAuth = $request->user();

            if ($userAuth->cv_url) {
                $path = storage_path() . '/app/public/images/cv/' . $userAuth->cv_url;
                if (file_exists($path)) unlink($path);
            }

            $userAuth->cv_url = null;
            $userAuth->save();

        return response()->json([
            'message' => 'CV has been deleted',
            'cv' => $userAuth->cv_url
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
