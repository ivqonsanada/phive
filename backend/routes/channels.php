<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Each user listens only to their own channel — that is where new direct messages
// and, later, any other personal notification arrives.
Broadcast::channel('user.{id}', fn (User $user, int $id) => $user->id === $id);
