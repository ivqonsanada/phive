<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageHeader extends Model
{
    use HasFactory;

       protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'user_one_id' => 'integer',
        'user_two_id' => 'integer',
    ];

    public function message_bodies () {
        return $this->hasMany('App\MessageBody');
    }
}
