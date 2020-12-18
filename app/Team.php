<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'leader_id' => 'integer',
    ];

    public function leader () {
        return $this->belongsTo('App\User');
    }

    public function members () {
        return $this->hasMany('App\TeamMember');
    }
}
