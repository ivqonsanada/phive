<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectReview extends Model
{
    protected $guarded = [];

    protected $casts = [
        'project_id' => 'integer',
    ];

    public $timestamps = false;
}
