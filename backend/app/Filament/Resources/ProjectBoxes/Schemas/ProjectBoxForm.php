<?php

namespace App\Filament\Resources\ProjectBoxes\Schemas;

use App\Enums\ProjectBoxStatus;
use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;

class ProjectBoxForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('project_id')
                    ->relationship('project', 'title')
                    ->required(),
                Select::make('user_id')
                    ->relationship('user', 'id')
                    ->required(),
                Select::make('status')
                    ->options(ProjectBoxStatus::class)
                    ->default('Waiting')
                    ->required(),
            ]);
    }
}
