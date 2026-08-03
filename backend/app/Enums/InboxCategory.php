<?php

namespace App\Enums;

enum InboxCategory: string
{
    case Message = 'Message';
    case TeamInvitation = 'Team Invitation';
    case ProjectInvitation = 'Project Invitation';
}
