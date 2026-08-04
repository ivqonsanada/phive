<?php

namespace App\Http\Requests;

use App\Enums\Expertise;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'tagname' => [
                'sometimes',
                'string',
                'min:3',
                'max:30',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('users', 'tagname')->ignore($this->user()->id),
            ],
            'identity_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'expertise' => ['sometimes', 'nullable', Rule::enum(Expertise::class)],
            'university' => ['sometimes', 'nullable', 'string', 'max:255'],
            'faculty' => ['sometimes', 'nullable', 'string', 'max:255'],
            'major' => ['sometimes', 'nullable', 'string', 'max:255'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'biography' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'is_open_hired' => ['sometimes', 'boolean'],

            // `role`, `is_admin`, `email`, `password` and `email_verified_at` are
            // deliberately absent: this endpoint updates whatever the form sends, so
            // anything listed here is something its owner can grant themselves.
            // PrivilegeEscalationTest pins that.

            'behance' => ['sometimes', 'nullable', 'url', 'max:255'],
            'github' => ['sometimes', 'nullable', 'url', 'max:255'],
            'linkedin' => ['sometimes', 'nullable', 'url', 'max:255'],
            'dribbble' => ['sometimes', 'nullable', 'url', 'max:255'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],

            'skills' => ['sometimes', 'array', 'max:30'],
            'skills.*' => ['string', 'max:50'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tagname.regex' => 'Handles may only contain lowercase letters, numbers and underscores.',
        ];
    }
}
