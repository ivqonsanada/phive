<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndividualApplicant extends Model
{
    use HasFactory;

        protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'project_id' => 'integer',
        'from_id' => 'integer',
        'to_id' => 'integer',
    ];

    public function inbox() {
        return $this->hasOne('App\Inbox');
    }

    public function from () {
        return $this->belongsTo('App\User');
    }

    public function to () {
        return $this->belongsTo('App\User');
    }

    public function project() {
        return $this->belongsTo('App\Project');
    }
}
