<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Leaderboard extends Model
{
    // public function getTopBoards () {
    //     return $this->with(['user'])->groupBy('expertise')->get();
    // }

    // protected $withCount = ['user.finished_count'];

    protected $casts = [
        'user_id' => 'integer',
    ];

    public function user () {
        return $this->belongsTo('App\User');
    }
}
