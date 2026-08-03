<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $emailRules = ['required', 'string', 'email', 'max:255', 'unique:users,email'];

        $pattern = config('phive.lecturer_email_pattern');

        if ($this->input('role') === UserRole::Lecturer->value && $pattern) {
            $emailRules[] = "regex:$pattern";
        }

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'role' => ['required', Rule::enum(UserRole::class)],
            'email' => $emailRules,
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.regex' => 'Lecturer accounts require a non-student academic email address.',
        ];
    }
}
