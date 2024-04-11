<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leaderboard extends Model
{
    use HasFactory;

        protected $guarded = [];

    protected $casts = [
        'user_id' => 'integer',
    ];

    public function user () {
        return $this->belongsTo('App\User');
    }
    
}
