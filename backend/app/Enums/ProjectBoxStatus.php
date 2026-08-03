<?php

namespace App\Enums;

/**
 * Lifecycle of a single actor's slot on a project.
 *
 * Lecturer side: Draft -> Hiring -> Confirmation -> Ongoing -> Finished
 * Student side:  Waiting -> Accepted -> Waiting to Start -> Project Started -> Finished
 *                (or Rejected / Bail Out at the corresponding step)
 */
enum ProjectBoxStatus: string
{
    case Draft = 'Draft';
    case Hiring = 'Hiring';
    case Waiting = 'Waiting';
    case Confirmation = 'Confirmation';
    case Accepted = 'Accepted';
    case Rejected = 'Rejected';
    case WaitingToStart = 'Waiting to Start';
    case ProjectStarted = 'Project Started';
    case Ongoing = 'Ongoing';
    case Finished = 'Finished';
    case BailOut = 'Bail Out';
}
