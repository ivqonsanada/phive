<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Each user listens only to their own channel — that is where new direct messages
// and, later, any other personal notification arrives. Keyed on the public UUID so
// no internal row number appears in a channel name.
Broadcast::channel('user.{uuid}', fn (User $user, string $uuid) => $user->uuid === $uuid);
