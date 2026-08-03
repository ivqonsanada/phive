<?php

namespace App\Enums;

/**
 * Status of an individual or team application to a project.
 *
 * Applying -> Waiting (shortlisted) -> Fixed (confirmed by the student)
 * or Rejected at any point before Fixed.
 */
enum ApplicationStatus: string
{
    case Applying = 'Applying';
    case Waiting = 'Waiting';
    case Fixed = 'Fixed';
    case Rejected = 'Rejected';
}
