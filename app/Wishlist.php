<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{

    protected $guarded = [];
    protected $casts = [
        'status' => 'boolean',

            'user_id' => 'integer',
            'project_id' => 'integer',

    ];
    // protected $hidden = ['id', '']

    public function user () {
        return $this->belongsTo('App\User');
    }

    public function project () {
        return $this->belongsTo('App\Project');
    }
}
