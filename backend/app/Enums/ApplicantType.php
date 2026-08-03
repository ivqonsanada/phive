<?php

namespace App\Enums;

enum ApplicantType: string
{
    case Individual = 'Individual';
    case Team = 'Team';
    case IndividualAndTeam = 'Individual & Team';

    public function allowsIndividual(): bool
    {
        return $this !== self::Team;
    }

    public function allowsTeam(): bool
    {
        return $this !== self::Individual;
    }
}
