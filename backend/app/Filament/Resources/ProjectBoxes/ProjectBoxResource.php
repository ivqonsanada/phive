<?php

namespace App\Filament\Resources\ProjectBoxes;

use App\Filament\Resources\ProjectBoxes\Pages\CreateProjectBox;
use App\Filament\Resources\ProjectBoxes\Pages\EditProjectBox;
use App\Filament\Resources\ProjectBoxes\Pages\ListProjectBoxes;
use App\Filament\Resources\ProjectBoxes\Schemas\ProjectBoxForm;
use App\Filament\Resources\ProjectBoxes\Tables\ProjectBoxesTable;
use App\Models\ProjectBox;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ProjectBoxResource extends Resource
{
    protected static ?string $model = ProjectBox::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedInbox;

    protected static string|\UnitEnum|null $navigationGroup = 'Projects';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return ProjectBoxForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ProjectBoxesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListProjectBoxes::route('/'),
            'create' => CreateProjectBox::route('/create'),
            'edit' => EditProjectBox::route('/{record}/edit'),
        ];
    }
}
