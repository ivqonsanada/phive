<?php

namespace App\Enums;

enum SocialProvider: string
{
    case Google = 'google';
    case Apple = 'apple';

    public function label(): string
    {
        return match ($this) {
            self::Google => 'Google',
            self::Apple => 'Apple',
        };
    }

    /**
     * Whether the provider is actually set up. Buttons for unconfigured providers are
     * hidden rather than shown and then failing at the redirect.
     */
    public function isConfigured(): bool
    {
        return filled(config("services.{$this->value}.client_id"));
    }
}
