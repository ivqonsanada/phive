<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserSkill extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function user () {
        return $this->belongsTo('App\User');
    }

    public function skill () {
        return $this->belongsTo('App\Skill');
    }
}
