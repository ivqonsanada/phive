<?php

namespace App\Models;

use App\Enums\ApplicantType;
use App\Enums\ProjectStatus;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id', 'title', 'description', 'status', 'applicant_type', 'max_person', 'thumbnail',
    'level_applicant', 'ui_ux_designer', 'front_end_engineer', 'back_end_engineer', 'data_expert',
    'certificate', 'salary', 'is_open_hiring', 'currency', 'salary_amount', 'payment_type',
    'project_url', 'start_time', 'finish_time',
])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    public function getRouteKeyName(): string
    {
        return 'project_url';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
            'applicant_type' => ApplicantType::class,
            'ui_ux_designer' => 'boolean',
            'front_end_engineer' => 'boolean',
            'back_end_engineer' => 'boolean',
            'data_expert' => 'boolean',
            'certificate' => 'boolean',
            'salary' => 'boolean',
            'is_open_hiring' => 'boolean',
            'start_time' => 'datetime',
            'finish_time' => 'datetime',
        ];
    }

    /** @param Builder<$this> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', '!=', ProjectStatus::Draft);
    }

    /** @param Builder<$this> $query */
    public function scopeHiring(Builder $query): void
    {
        $query->where('status', ProjectStatus::Hiring)->where('is_open_hiring', true);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<ProjectRequirement, $this> */
    public function requirements(): HasMany
    {
        return $this->hasMany(ProjectRequirement::class);
    }

    /** @return HasMany<ProjectSkill, $this> */
    public function skills(): HasMany
    {
        return $this->hasMany(ProjectSkill::class);
    }

    /** @return HasOne<ProjectTeam, $this> */
    public function projectTeam(): HasOne
    {
        return $this->hasOne(ProjectTeam::class);
    }

    /** @return HasOne<ProjectReview, $this> */
    public function review(): HasOne
    {
        return $this->hasOne(ProjectReview::class);
    }

    /** @return HasMany<IndividualApplicant, $this> */
    public function individualApplicants(): HasMany
    {
        return $this->hasMany(IndividualApplicant::class);
    }

    /** @return HasMany<TeamApplicant, $this> */
    public function teamApplicants(): HasMany
    {
        return $this->hasMany(TeamApplicant::class);
    }

    /** @return HasMany<ProjectBox, $this> */
    public function projectBoxes(): HasMany
    {
        return $this->hasMany(ProjectBox::class);
    }

    /** @return HasMany<Wishlist, $this> */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /** @return HasMany<ProjectInvitation, $this> */
    public function invitations(): HasMany
    {
        return $this->hasMany(ProjectInvitation::class);
    }
}
