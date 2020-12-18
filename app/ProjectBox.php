<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectBox extends Model
{
    protected $guarded = [];

    public function project () {
        return $this->belongsTo('App\Project');
    }
}
