<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

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
