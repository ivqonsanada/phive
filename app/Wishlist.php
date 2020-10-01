<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    protected $guarded = [];

    public function user () {
        return $this->belongsTo('App\User');
    }

    public function project () {
        return $this->belongsTo('App\Project');
    }
}
