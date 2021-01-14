<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserSkill extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'user_id' => 'integer',
        'skill_id' => 'integer'
    ];

    public function user () {
        return $this->belongsTo('App\User');
    }

    public function skill () {
        return $this->belongsTo('App\Skill');
    }
}
