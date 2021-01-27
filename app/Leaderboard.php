<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Leaderboard extends Model
{
    protected $guarded = [];

    protected $casts = [
        'user_id' => 'integer',
    ];

    public function user () {
        return $this->belongsTo('App\User');
    }
}
