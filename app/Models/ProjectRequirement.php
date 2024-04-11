<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectRequirement extends Model
{
    use HasFactory;

        protected $guarded = [];
    protected $hidden = [
        'id',
        'project_id'
    ];

    public $timestamps = false;

    protected $casts = [
        'project_id' => 'integer',
    ];

    public function project () {
        return $this->belongsTo('App\Project');
    }
}
