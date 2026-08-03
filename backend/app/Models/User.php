<?php

namespace App\Models;

use App\Enums\Expertise;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'first_name', 'last_name', 'role', 'tagname', 'identity_number', 'email', 'password',
    'photo_url', 'expertise', 'university', 'faculty', 'major', 'location', 'biography',
    'is_open_hired', 'behance', 'github', 'linkedin', 'dribbble', 'website', 'cv_url',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmailContract
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Route model binding resolves users by their public handle, not their id.
     */
    public function getRouteKeyName(): string
    {
        return 'tagname';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'expertise' => Expertise::class,
            'is_open_hired' => 'boolean',
        ];
    }

    /**
     * @return Attribute<string, never>
     */
    protected function name(): Attribute
    {
        return Attribute::get(fn (): string => trim("{$this->first_name} {$this->last_name}"));
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::Student;
    }

    public function isLecturer(): bool
    {
        return $this->role === UserRole::Lecturer;
    }

    /** @return HasMany<UserSkill, $this> */
    public function skills(): HasMany
    {
        return $this->hasMany(UserSkill::class);
    }

    /** @return HasMany<Experience, $this> */
    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class);
    }

    /** @return HasOne<Leaderboard, $this> */
    public function leaderboard(): HasOne
    {
        return $this->hasOne(Leaderboard::class);
    }

    /** Projects this user published (lecturers). @return HasMany<Project, $this> */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
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

    /** The party this user leads. @return HasOne<Team, $this> */
    public function team(): HasOne
    {
        return $this->hasOne(Team::class, 'leader_id');
    }

    /** Parties this user belongs to as a member. @return HasMany<TeamMember, $this> */
    public function teamMemberships(): HasMany
    {
        return $this->hasMany(TeamMember::class, 'member_id');
    }

    /** @return HasMany<Inbox, $this> */
    public function inboxes(): HasMany
    {
        return $this->hasMany(Inbox::class, 'recipient_id');
    }

    /** @return HasMany<ProjectTeamMember, $this> */
    public function projectTeamMemberships(): HasMany
    {
        return $this->hasMany(ProjectTeamMember::class, 'member_id');
    }
}
