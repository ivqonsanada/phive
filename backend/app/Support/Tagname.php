<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Str;

class Tagname
{
    /**
     * Build a unique public handle from a display name, falling back to a random
     * suffix when the slug is already taken.
     */
    public static function generate(string $name): string
    {
        $base = Str::slug($name, '') ?: 'user';
        $base = Str::lower(Str::limit($base, 20, ''));

        $tagname = $base;

        while (User::where('tagname', $tagname)->exists()) {
            $tagname = $base.Str::lower(Str::random(4));
        }

        return $tagname;
    }
}
