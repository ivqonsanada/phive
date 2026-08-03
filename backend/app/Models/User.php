<?php

namespace App\Models;

use App\Enums\Expertise;
use App\Enums\ProjectBoxStatus;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
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
class User extends Authenticatable implements FilamentUser, MustVerifyEmailContract
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Only explicitly flagged administrators reach the Filament panel. Every other
     * account — including lecturers — is refused even with valid credentials.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_admin === true;
    }

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
            'is_admin' => 'boolean',
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

    /**
     * Ordered by id so the list comes back the way it was entered — the unique index
     * on (user_id, name) would otherwise let the database answer alphabetically.
     *
     * @return HasMany<UserSkill, $this>
     */
    public function skills(): HasMany
    {
        return $this->hasMany(UserSkill::class)->orderBy('id');
    }

    /** Most recent first — that is how a CV reads. @return HasMany<Experience, $this> */
    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class)->orderByDesc('start_date');
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

    /** Work this user actually completed — the public portfolio. @return HasMany<ProjectBox, $this> */
    public function finishedProjects(): HasMany
    {
        return $this->projectBoxes()->where('status', ProjectBoxStatus::Finished);
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
