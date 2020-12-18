<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class MessageHeader extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public function message_bodies () {
        return $this->hasMany('App\MessageBody');
    }
}
