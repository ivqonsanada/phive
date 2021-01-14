<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectReview extends Model
{
    public $guarded = [];

    protected $casts = [
        'project_id' => 'integer',
    ];

    public $timestamps = false;
}
