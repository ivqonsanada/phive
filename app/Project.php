<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $guarded = [];
    protected $hidden = ['thumbnail'];
    protected $casts = [
        'ui_ux_designer' => 'boolean',
        'front_end_engineer' => 'boolean',
        'back_end_engineer' => 'boolean',
        'data_expert' => 'boolean',
        'certificate' => 'boolean',
        'salary' => 'boolean',
        'is_open_hiring' => 'boolean',
        'user_id' => 'integer'
    ];

    protected $withCount = ['individual_applicants', 'team_applicants'];

    protected $appends = [
        'thumbnail_url'
    ];

    public function getThumbnailUrlAttribute()
    {
        if ($this->thumbnail === null) {
            return "https://placeimg.com/680/500/tech/{$this->id}";
        } else return "/storage/images/project/{$this->thumbnail}";
    }

    public function user()
    {
        return $this->belongsTo('App\User');
    }

    public function requirements() {
        return $this->hasMany('App\ProjectRequirement', 'project_id');
    }

    public function skills() {
        return $this->hasMany('App\ProjectSkill', 'project_id');
    }

    public function project_team () {
        return $this->hasOne('App\ProjectTeam');
    }

    public function individual_applicants () {
        return $this->hasMany('App\IndividualApplicant');
    }

    public function team_applicants () {
        return $this->hasMany('App\TeamApplicant');
    }

    public function project_review () {
        return $this->hasOne('App\ProjectReview');
    }

    public function is_wished () {
        return $this->hasOne('App\Wishlist', 'project_id');
    }


    // public function active_projects() {

    // }
}
