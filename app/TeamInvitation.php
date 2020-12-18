<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TeamInvitation extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function team () {
        return $this->belongsTo('App\Team');
    }

    public function from () {
        return $this->belongsTo('App\User');
    }

    public function to () {
        return $this->belongsTo('App\User');
    }
}
