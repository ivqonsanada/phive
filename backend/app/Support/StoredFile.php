<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Uploads are stored as a disk-relative path (`avatars/ab12….jpg`) rather than a full
 * URL, so moving between local disk, S3 or R2 does not rewrite every existing row.
 * The absolute URL is derived at serialisation time.
 */
class StoredFile
{
    public const DISK = 'public';

    public static function put(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, self::DISK);
    }

    /**
     * Replace a file, deleting whatever was there before.
     */
    public static function replace(?string $previousPath, UploadedFile $file, string $directory): string
    {
        self::delete($previousPath);

        return self::put($file, $directory);
    }

    public static function delete(?string $path): void
    {
        if ($path && Storage::disk(self::DISK)->exists($path)) {
            Storage::disk(self::DISK)->delete($path);
        }
    }

    public static function url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        // Rows migrated from the legacy app may already hold an absolute URL.
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk(self::DISK)->url($path);
    }
}
