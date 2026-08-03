<?php

namespace App\Filament\Resources\ProjectBoxes\Pages;

use App\Filament\Resources\ProjectBoxes\ProjectBoxResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProjectBox extends EditRecord
{
    protected static string $resource = ProjectBoxResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
