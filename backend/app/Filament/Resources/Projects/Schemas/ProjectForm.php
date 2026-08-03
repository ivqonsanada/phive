<?php

namespace App\Filament\Resources\Projects\Schemas;

use App\Enums\ApplicantType;
use App\Enums\ProjectStatus;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'id')
                    ->required(),
                TextInput::make('title'),
                Textarea::make('description')
                    ->columnSpanFull(),
                Select::make('status')
                    ->options(ProjectStatus::class)
                    ->default('Draft')
                    ->required(),
                Select::make('applicant_type')
                    ->options(ApplicantType::class)
                    ->default('Individual & Team')
                    ->required(),
                TextInput::make('max_person')
                    ->required()
                    ->default('Not Specified'),
                TextInput::make('thumbnail'),
                TextInput::make('level_applicant'),
                Toggle::make('ui_ux_designer')
                    ->required(),
                Toggle::make('front_end_engineer')
                    ->required(),
                Toggle::make('back_end_engineer')
                    ->required(),
                Toggle::make('data_expert')
                    ->required(),
                Toggle::make('certificate')
                    ->required(),
                Toggle::make('salary')
                    ->required(),
                Toggle::make('is_open_hiring')
                    ->required(),
                TextInput::make('currency')
                    ->required()
                    ->default('IDR'),
                TextInput::make('salary_amount')
                    ->required()
                    ->default('0'),
                TextInput::make('payment_type')
                    ->required()
                    ->default('person'),
                TextInput::make('project_url')
                    ->url(),
                DateTimePicker::make('start_time'),
                DateTimePicker::make('finish_time'),
            ]);
    }
}
