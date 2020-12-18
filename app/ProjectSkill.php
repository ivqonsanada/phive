<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectSkill extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function project () {
        return $this->belongsTo('App\Project');
    }
}
