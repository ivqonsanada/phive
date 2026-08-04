<?php

namespace App\Filament\Resources\Leaderboards\Pages;

use App\Filament\Resources\Leaderboards\LeaderboardResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditLeaderboard extends EditRecord
{
    protected static string $resource = LeaderboardResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
