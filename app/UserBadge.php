<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserBadge extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function user () {
        return $this->belongsTo('App\User');
    }

    public function badge () {
        return $this->belongsTo('App\Badge');
    }
}
