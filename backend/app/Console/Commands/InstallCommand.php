<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Symfony\Component\Console\Attribute\AsCommand;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\select;
use function Laravel\Prompts\text;

#[AsCommand(name: 'phive:install', description: 'Prepare a fresh PHive API installation')]
class InstallCommand extends Command
{
    protected $signature = 'phive:install
        {--force : Re-run every step even if it looks done}
        {--seed : Seed demo data without asking}
        {--no-interaction-defaults : Accept sensible defaults for every prompt}';

    public function handle(): int
    {
        $this->components->info('Installing PHive API');

        $auto = $this->option('no-interaction-defaults') || ! $this->input->isInteractive();

        $this->createEnvironmentFile();
        $this->generateAppKey();

        if (! $auto) {
            $this->configureDatabase();
        }

        if (! $this->migrate($auto)) {
            return self::FAILURE;
        }

        $this->seedDemoData($auto);
        $this->linkStorage();

        $this->newLine();
        $this->components->info('PHive API is ready.');
        $this->components->bulletList([
            'Start the API:      php artisan serve',
            'Start the worker:   php artisan queue:work',
            'Frontend origin:    '.config('phive.frontend_url').' (set FRONTEND_URL to change)',
        ]);

        return self::SUCCESS;
    }

    private function createEnvironmentFile(): void
    {
        if (File::exists(base_path('.env')) && ! $this->option('force')) {
            $this->components->twoColumnDetail('.env', '<fg=yellow>already exists</>');

            return;
        }

        File::copy(base_path('.env.example'), base_path('.env'));
        $this->components->twoColumnDetail('.env', '<fg=green>created</>');
    }

    private function generateAppKey(): void
    {
        if (config('app.key') && ! $this->option('force')) {
            $this->components->twoColumnDetail('APP_KEY', '<fg=yellow>already set</>');

            return;
        }

        $this->callSilently('key:generate', ['--force' => true]);
        $this->components->twoColumnDetail('APP_KEY', '<fg=green>generated</>');
    }

    /**
     * Write the connection details straight into .env so the operator does not have
     * to hand-edit it before the first migration.
     */
    private function configureDatabase(): void
    {
        $driver = select(
            label: 'Which database will this instance use?',
            options: [
                'pgsql' => 'PostgreSQL (recommended)',
                'mysql' => 'MySQL / MariaDB',
                'sqlite' => 'SQLite (local development only)',
                'keep' => 'Leave my current .env alone',
            ],
            default: config('database.default') === 'sqlite' ? 'pgsql' : config('database.default'),
        );

        if ($driver === 'keep') {
            return;
        }

        if ($driver === 'sqlite') {
            $path = database_path('database.sqlite');
            File::ensureDirectoryExists(dirname($path));
            touch($path);

            $this->writeEnv(['DB_CONNECTION' => 'sqlite', 'DB_URL' => '']);
            $this->components->twoColumnDetail('Database', '<fg=green>sqlite</>');

            return;
        }

        if (confirm('Do you have a single connection string (DATABASE_URL) instead of separate fields?', default: false)) {
            $this->writeEnv([
                'DB_CONNECTION' => $driver,
                'DB_URL' => text('Connection string', required: true),
            ]);
            $this->components->twoColumnDetail('Database', "<fg=green>$driver via DB_URL</>");

            return;
        }

        $this->writeEnv([
            'DB_CONNECTION' => $driver,
            'DB_URL' => '',
            'DB_HOST' => text('Host', default: '127.0.0.1'),
            'DB_PORT' => text('Port', default: $driver === 'pgsql' ? '5432' : '3306'),
            'DB_DATABASE' => text('Database name', default: 'phive'),
            'DB_USERNAME' => text('Username', default: $driver === 'pgsql' ? 'postgres' : 'root'),
            'DB_PASSWORD' => text('Password'),
        ]);

        $this->components->twoColumnDetail('Database', "<fg=green>$driver</>");
    }

    private function migrate(bool $auto): bool
    {
        if (! $auto && ! confirm('Run database migrations now?', default: true)) {
            return true;
        }

        return $this->artisan('migrate', '--force');
    }

    private function seedDemoData(bool $auto): void
    {
        $seed = $this->option('seed')
            || (! $auto && confirm('Seed demo lecturers, students and projects?', default: false));

        if ($seed) {
            $this->artisan('db:seed', '--force');
        }
    }

    /**
     * Run an artisan command in a fresh process.
     *
     * This command rewrites .env as it goes, and environment variables are only read
     * once per process — a sub-process is what makes the new credentials take effect.
     */
    private function artisan(string ...$arguments): bool
    {
        return Process::forever()
            ->path(base_path())
            ->tty(false)
            ->run([PHP_BINARY, 'artisan', ...$arguments], function (string $type, string $output) {
                $this->output->write($output);
            })
            ->successful();
    }

    private function linkStorage(): void
    {
        if (File::exists(public_path('storage')) && ! $this->option('force')) {
            $this->components->twoColumnDetail('storage symlink', '<fg=yellow>already linked</>');

            return;
        }

        $this->callSilently('storage:link');
        $this->components->twoColumnDetail('storage symlink', '<fg=green>created</>');
    }

    /**
     * @param  array<string, string>  $values
     */
    private function writeEnv(array $values): void
    {
        $path = base_path('.env');
        $contents = File::get($path);

        foreach ($values as $key => $value) {
            $escaped = str_contains($value, ' ') || str_contains($value, '#')
                ? '"'.addcslashes($value, '"\\').'"'
                : $value;

            $contents = preg_match("/^$key=.*$/m", $contents)
                ? preg_replace("/^$key=.*$/m", "$key=$escaped", $contents)
                : $contents.PHP_EOL."$key=$escaped";
        }

        File::put($path, $contents);
    }
}
