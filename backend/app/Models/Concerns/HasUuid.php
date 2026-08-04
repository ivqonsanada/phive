<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/**
 * Gives a model a public UUID alongside its internal auto-increment key.
 *
 * The integer id stays the primary key — joins and foreign keys are narrower and
 * faster on it. The UUID is what leaves the building: it is what the API exposes and
 * what appears in URLs, so nobody can count our rows or walk them one by one.
 */
trait HasUuid
{
    protected static function bootHasUuid(): void
    {
        static::creating(function (self $model): void {
            if (blank($model->uuid)) {
                $model->uuid = (string) Str::uuid7();
            }
        });
    }

    /**
     * Route model binding resolves on the public identifier, not the internal one.
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
