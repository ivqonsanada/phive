<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $hidden = ['id', 'user_id'];

    protected $casts = [
        'user_id' => 'integer',
    ];

    protected $dates = [
        'start_date', 'end_date'
    ];

    public $timestamps = false;
}
