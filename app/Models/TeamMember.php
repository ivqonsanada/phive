<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    use HasFactory;

       protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'team_id' => 'integer',
        'member_id' => 'integer',
    ];

    public function team () {
        return $this->belongsTo('App\Team');
    }

    public function member () {
        return $this->belongsTo('App\User');
    }
}
