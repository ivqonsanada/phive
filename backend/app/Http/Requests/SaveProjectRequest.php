<?php

namespace App\Http\Requests;

use App\Enums\ApplicantType;
use App\Enums\ProjectLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Shared by create and update. A draft is allowed to be half-finished; publishing
 * is what tightens the rules, so `publish` drives the conditional requirements.
 */
class SaveProjectRequest extends FormRequest
{
    public function publishing(): bool
    {
        return $this->boolean('publish');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $requiredWhenPublishing = $this->publishing() ? 'required' : 'nullable';

        return [
            'publish' => ['nullable', 'boolean'],

            'title' => [$requiredWhenPublishing, 'string', 'max:255'],
            'description' => [$requiredWhenPublishing, 'string', 'max:20000'],

            'applicant_type' => ['nullable', Rule::enum(ApplicantType::class)],
            'max_person' => ['nullable', 'string', 'max:50'],
            // Difficulty decides how many leaderboard points the project can award,
            // so it has to be one of the known levels.
            'level_applicant' => ['nullable', Rule::enum(ProjectLevel::class)],

            'ui_ux_designer' => ['nullable', 'boolean'],
            'front_end_engineer' => ['nullable', 'boolean'],
            'back_end_engineer' => ['nullable', 'boolean'],
            'data_expert' => ['nullable', 'boolean'],

            'certificate' => ['nullable', 'boolean'],
            'salary' => ['nullable', 'boolean'],
            'currency' => ['nullable', 'string', 'max:8'],
            'salary_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_type' => ['nullable', Rule::in(['person', 'project'])],

            'skills' => ['nullable', 'array', 'max:20'],
            'skills.*' => ['string', 'max:50'],

            'requirements' => ['nullable', 'array', 'max:20'],
            'requirements.*' => ['string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->publishing()) {
                return;
            }

            // A published project has to tell students what it is looking for and,
            // if it claims to pay, how much.
            $wantsSomeone = $this->boolean('ui_ux_designer')
                || $this->boolean('front_end_engineer')
                || $this->boolean('back_end_engineer')
                || $this->boolean('data_expert');

            if (! $wantsSomeone) {
                $validator->errors()->add(
                    'ui_ux_designer',
                    'Choose at least one expertise this project is hiring for.',
                );
            }

            if ($this->boolean('salary') && (float) $this->input('salary_amount') <= 0) {
                $validator->errors()->add(
                    'salary_amount',
                    'A paid project needs a salary amount above zero.',
                );
            }
        });
    }
}
