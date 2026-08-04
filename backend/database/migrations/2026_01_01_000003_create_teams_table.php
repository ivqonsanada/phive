<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A "party": the standing team a student leads before applying to a project.
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leader_id')->constrained('users')->cascadeOnDelete();
        });

        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->string('expertise')->nullable();

            $table->unique(['team_id', 'member_id']);
        });

        // The team that actually got hired onto a project.
        Schema::create('project_teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('leader_id')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::create('project_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->string('expertise')->nullable();
            $table->text('assessment')->nullable();
            $table->string('score')->nullable();

            $table->unique(['project_team_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_team_members');
        Schema::dropIfExists('project_teams');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('teams');
    }
};
