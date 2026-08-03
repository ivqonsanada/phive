<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Every domain table gets a public UUID next to its internal id.
 *
 * Framework-owned tables (sessions, cache, jobs, migrations, personal access tokens)
 * are left alone — they are never exposed and Laravel owns their shape.
 */
return new class extends Migration
{
    /**
     * @var list<string>
     */
    private array $tables = [
        'users',
        'user_skills',
        'experiences',
        'leaderboards',
        'projects',
        'project_requirements',
        'project_skills',
        'project_reviews',
        'wishlists',
        'teams',
        'team_members',
        'project_teams',
        'project_team_members',
        'individual_applicants',
        'team_applicants',
        'applicant_team_members',
        'project_boxes',
        'project_invitations',
        'team_invitations',
        'message_headers',
        'message_bodies',
        'inboxes',
        'social_accounts',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (! Schema::hasTable($table) || Schema::hasColumn($table, 'uuid')) {
                continue;
            }

            // Added nullable first so existing rows can be backfilled, then locked
            // down — a table with data cannot take a non-null unique column directly.
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->uuid('uuid')->nullable()->after('id');
            });

            $this->backfill($table);

            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                $blueprint->uuid('uuid')->nullable(false)->change();
                $blueprint->unique('uuid', "{$table}_uuid_unique");
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'uuid')) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                $blueprint->dropUnique("{$table}_uuid_unique");
                $blueprint->dropColumn('uuid');
            });
        }
    }

    /**
     * UUIDv7 so the values sort by creation time, which keeps the unique index from
     * fragmenting the way random v4 values would.
     */
    private function backfill(string $table): void
    {
        DB::table($table)->orderBy('id')->chunkById(500, function ($rows) use ($table) {
            foreach ($rows as $row) {
                DB::table($table)
                    ->where('id', $row->id)
                    ->update(['uuid' => (string) Str::uuid7()]);
            }
        });
    }
};
