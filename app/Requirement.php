<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Requirement extends Model
{
    public function project() {
        return $this->belongsTo('App\Project');
    }
}
