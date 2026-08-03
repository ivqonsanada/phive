<?php

namespace App\Console\Commands;

use App\Support\StoredFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Console\Attribute\AsCommand;

use function Laravel\Prompts\confirm;

/**
 * Wipes the database and reseeds it, so a public demo goes back to a known state.
 *
 * This is destructive on purpose, which is exactly why it refuses to run unless the
 * environment says it is a demo. A production instance that ever picked up this
 * schedule by accident would otherwise lose everything.
 */
#[AsCommand(name: 'phive:demo-reset', description: 'Reset the demo site back to seeded data')]
class DemoResetCommand extends Command
{
    protected $signature = 'phive:demo-reset
        {--force : Skip the confirmation prompt (used by the scheduler)}
        {--keep-uploads : Leave uploaded files in place}';

    public function handle(): int
    {
        if (! config('phive.demo_mode')) {
            $this->components->error(
                'Refusing to run: DEMO_MODE is not enabled. This command deletes every row.'
            );

            return self::FAILURE;
        }

        if (! $this->option('force') && $this->input->isInteractive()) {
            $database = config('database.connections.'.config('database.default').'.database');

            if (! confirm("This deletes everything in [$database] and reseeds. Continue?", default: false)) {
                $this->components->info('Cancelled.');

                return self::SUCCESS;
            }
        }

        $this->components->info('Resetting the demo');

        $this->callSilently('migrate:fresh', ['--force' => true]);
        $this->components->twoColumnDetail('Schema', '<fg=green>rebuilt</>');

        $this->callSilently('db:seed', ['--force' => true]);
        $this->components->twoColumnDetail('Seed data', '<fg=green>loaded</>');

        if (! $this->option('keep-uploads')) {
            $this->clearUploads();
        }

        // Tokens and sessions point at rows that no longer exist.
        $this->callSilently('cache:clear');
        $this->components->twoColumnDetail('Cache', '<fg=green>cleared</>');

        $this->newLine();
        $this->components->info('Demo reset. Seeded accounts use the password "password".');

        return self::SUCCESS;
    }

    /**
     * Uploads outlive the database, so a reset would otherwise leave every avatar and
     * thumbnail from previous visitors lying around forever.
     */
    private function clearUploads(): void
    {
        $disk = Storage::disk(StoredFile::DISK);

        foreach (['avatars', 'cv', 'project-thumbnails'] as $directory) {
            if ($disk->exists($directory)) {
                $disk->deleteDirectory($directory);
            }
        }

        $this->components->twoColumnDetail('Uploads', '<fg=green>cleared</>');
    }
}
