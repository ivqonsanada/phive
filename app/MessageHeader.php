<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class MessageHeader extends Model
{
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
