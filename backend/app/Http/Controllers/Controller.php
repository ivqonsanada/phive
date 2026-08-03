<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    // Laravel 11 removed this from the base controller; policies are how the lecturer
    // endpoints stay scoped to their own projects, so bring it back.
    use AuthorizesRequests;
}
