<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectInvitation extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'project_id' => 'integer',
        'from_id' => 'integer',
        'to_id' => 'integer',
    ];

    public function project () {
        return $this->belongsTo('App\Project');
    }

    public function from () {
        return $this->belongsTo('App\User');
    }

    public function to () {
        return $this->belongsTo('App\User');
    }
}
