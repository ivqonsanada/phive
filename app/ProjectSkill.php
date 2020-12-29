<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectSkill extends Model
{
    protected $guarded = [];
    protected $hidden = [
        'skill_id',
        'id',
        'project_id'
    ];

    public $timestamps = false;

    protected $casts = [
        'project_id' => 'integer',
        'skill_id' => 'integer',
    ];

    public function project () {
        return $this->belongsTo('App\Project');
    }
}
