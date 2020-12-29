<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectRequirement extends Model
{
    protected $guarded = [];
    protected $hidden = [
        'id',
        'project_id'
    ];

    public $timestamps = false;

    protected $casts = [
        'project_id' => 'integer',
    ];

    public function project () {
        return $this->belongsTo('App\Project');
    }
}
