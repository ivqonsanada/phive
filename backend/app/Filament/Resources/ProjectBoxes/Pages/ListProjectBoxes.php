<?php

namespace App\Filament\Resources\ProjectBoxes\Pages;

use App\Filament\Resources\ProjectBoxes\ProjectBoxResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProjectBoxes extends ListRecords
{
    protected static string $resource = ProjectBoxResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
