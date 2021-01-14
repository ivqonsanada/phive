<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    use RegistersUsers;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * The user has been registered.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    protected function registered(Request $request, User $user)
    {
        if ($user instanceof MustVerifyEmail) {
            return response()->json(['status' => trans('verification.sent')]);
        }

        return response()->json($user);
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        if ($data['role'] === 'Lecturer') {
            return Validator::make($data, [
                'first_name' => 'required|max:255',
                'last_name' => 'max:255',
                'role' => 'required|max:255|in:Student,Lecturer',
                'email' => 'required|email|max:255|unique:users|regex:/^[a-zA-Z0-9.]+@(?!.*(student)).*.ac.id.*$/',
                'password' => 'required|min:8',
            ], [
                'email.regex' => 'You were using student academic email address or not using an academic email at all.'
            ]);
        } else {
            return Validator::make($data, [
                'first_name' => 'required|max:255',
                'last_name' => 'max:255',
                'role' => 'required|max:255|in:Student,Lecturer',
                'email' => 'required|email|max:255|unique:users',
                'password' => 'required|min:8',
            ]);
        }
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\User
     */
    protected function create(array $data)
    {
        return User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'role' => $data['role'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);
    }
}
