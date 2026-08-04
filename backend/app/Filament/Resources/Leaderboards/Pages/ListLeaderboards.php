<?php

namespace App\Filament\Resources\Leaderboards\Pages;

use App\Filament\Resources\Leaderboards\LeaderboardResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLeaderboards extends ListRecords
{
    protected static string $resource = LeaderboardResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
