<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    public $guarded = [];
    public $hidden = ['id', 'user_id'];

    protected $casts = [
        'user_id' => 'integer',
    ];

    protected $dates = [
        'start_date', 'end_date'
    ];

    public $timestamps = false;
}
