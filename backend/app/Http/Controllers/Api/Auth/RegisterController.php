<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\Tagname;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            ...$data,
            'last_name' => $data['last_name'] ?? '',
            'tagname' => Tagname::generate(trim(($data['first_name'] ?? '').' '.($data['last_name'] ?? ''))),
        ]);

        event(new Registered($user));

        $token = $user->createToken($request->string('device_name', 'phive-web')->toString());

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token->plainTextToken,
        ], 201);
    }
}
