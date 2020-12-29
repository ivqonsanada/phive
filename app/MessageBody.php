<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class MessageBody extends Model
{
    protected $guarded = [];

    protected $casts = [
        'message_header_id' => 'integer',
        'sender_id' => 'integer',
        'recipient_id' => 'integer',
    ];

    public function sender () {
        return $this->belongsTo('App\User');
    }
}
