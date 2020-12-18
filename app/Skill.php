<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $guarded = [];
    protected $hidden = ['project_id'];

    public $timestamps = false;
}
