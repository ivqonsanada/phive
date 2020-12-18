<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class MessageBody extends Model
{
    protected $guarded = [];

    public function sender () {
        return $this->belongsTo('App\User');
    }
}
