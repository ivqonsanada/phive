<?php

namespace App\Filament\Resources\Projects\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProjectsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('Lecturer')
                    ->searchable()
                    ->searchable(),
                TextColumn::make('title')
                    ->searchable(),
                TextColumn::make('status')
                    ->badge()
                    ->searchable(),
                TextColumn::make('applicant_type')
                    ->badge()
                    ->searchable(),
                TextColumn::make('max_person')
                    ->searchable(),
                TextColumn::make('thumbnail')
                    ->searchable(),
                TextColumn::make('level_applicant')
                    ->searchable(),
                IconColumn::make('ui_ux_designer')
                    ->boolean(),
                IconColumn::make('front_end_engineer')
                    ->boolean(),
                IconColumn::make('back_end_engineer')
                    ->boolean(),
                IconColumn::make('data_expert')
                    ->boolean(),
                IconColumn::make('certificate')
                    ->boolean(),
                IconColumn::make('salary')
                    ->boolean(),
                IconColumn::make('is_open_hiring')
                    ->boolean(),
                TextColumn::make('currency')
                    ->searchable(),
                TextColumn::make('salary_amount')
                    ->searchable(),
                TextColumn::make('payment_type')
                    ->searchable(),
                TextColumn::make('project_url')
                    ->searchable(),
                TextColumn::make('start_time')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('finish_time')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
