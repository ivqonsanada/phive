<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectSkill extends Model
{
    use HasFactory;

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
