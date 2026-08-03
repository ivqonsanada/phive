<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Enums\Expertise;
use App\Enums\UserRole;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Hash;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('first_name')
                    ->required(),
                TextInput::make('last_name')
                    ->required(),
                Select::make('role')
                    ->options(UserRole::class)
                    ->required(),
                TextInput::make('tagname'),
                TextInput::make('identity_number'),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                DateTimePicker::make('email_verified_at'),
                TextInput::make('password')
                    ->password()
                    ->revealable()
                    // Hashed on save, required only when creating, and left untouched
                    // when an edit leaves it blank.
                    ->dehydrateStateUsing(fn (?string $state) => filled($state) ? Hash::make($state) : null)
                    ->dehydrated(fn (?string $state) => filled($state))
                    ->required(fn (string $operation) => $operation === 'create'),
                // Stored as a path on the public disk, not a URL — the absolute URL is
                // derived when the API serialises it.
                TextInput::make('photo_url')
                    ->label('Avatar path')
                    ->helperText('Disk-relative, e.g. avatars/abc.jpg'),
                Select::make('expertise')
                    ->options(Expertise::class),
                TextInput::make('university'),
                TextInput::make('faculty'),
                TextInput::make('major'),
                TextInput::make('location'),
                Textarea::make('biography')
                    ->columnSpanFull(),
                Toggle::make('is_open_hired')
                    ->required(),
                TextInput::make('behance'),
                TextInput::make('github'),
                TextInput::make('linkedin'),
                TextInput::make('dribbble'),
                TextInput::make('website')
                    ->url(),
                TextInput::make('cv_url')
                    ->label('CV path')
                    ->helperText('Disk-relative, e.g. cv/abc.pdf'),
                Toggle::make('is_admin')
                    ->label('Administrator')
                    ->helperText('Grants access to this admin panel.'),
            ]);
    }
}
