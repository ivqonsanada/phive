<?php

namespace App\Filament\Resources\Leaderboards\Schemas;

use App\Enums\Expertise;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class LeaderboardForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'id')
                    ->required(),
                Select::make('expertise')
                    ->options(Expertise::class)
                    ->required(),
                TextInput::make('points')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
