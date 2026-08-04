<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Draft = 'Draft';
    case Hiring = 'Hiring';
    case Ongoing = 'Ongoing';
    case Finished = 'Finished';
}
