<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectReview extends Model
{
    use HasFactory;

        protected $guarded = [];

    protected $casts = [
        'project_id' => 'integer',
    ];

    public $timestamps = false;
}
