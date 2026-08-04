<?php

namespace App\Enums;

enum InvitationStatus: string
{
    case Pending = 'Pending';
    case Accepted = 'Accepted';
    case Rejected = 'Rejected';
}
