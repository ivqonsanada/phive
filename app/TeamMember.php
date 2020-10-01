<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function team () {
        return $this->belongsTo('App\Team');
    }

    public function member () {
        return $this->belongsTo('App\User');
    }
}
