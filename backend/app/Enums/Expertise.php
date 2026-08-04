<?php

namespace App\Enums;

enum Expertise: string
{
    case UiUxDesigner = 'UI/UX Designer';
    case FrontendEngineer = 'Frontend Engineer';
    case BackendEngineer = 'Backend Engineer';
    case DataExpert = 'Data Expert';

    /**
     * The `projects` boolean column that flags a project as open to this expertise.
     */
    public function projectColumn(): string
    {
        return match ($this) {
            self::UiUxDesigner => 'ui_ux_designer',
            self::FrontendEngineer => 'front_end_engineer',
            self::BackendEngineer => 'back_end_engineer',
            self::DataExpert => 'data_expert',
        };
    }
}
