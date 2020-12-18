<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectInvitation extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function project () {
        return $this->belongsTo('App\Project');
    }

    public function from () {
        return $this->belongsTo('App\User');
    }

    public function to () {
        return $this->belongsTo('App\User');
    }
}
