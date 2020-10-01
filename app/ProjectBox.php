<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectBox extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function project () {
        return $this->belongsTo('App\Project');
    }
}
