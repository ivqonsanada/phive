<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('individual_applicants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_id')->constrained('users')->cascadeOnDelete();
            $table->string('expertise');
            $table->string('status')->default('Applying')->index();
            $table->text('self_describe')->nullable();
            $table->text('apply_reason')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'from_id', 'to_id']);
        });

        Schema::create('team_applicants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('Applying')->index();
            $table->text('self_describe')->nullable();
            $table->text('apply_reason')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'from_id', 'to_id']);
        });

        Schema::create('applicant_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_applicant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->string('expertise');

            $table->unique(['team_applicant_id', 'member_id']);
        });

        Schema::create('project_boxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('Waiting')->index();
            $table->timestamps();

            $table->unique(['project_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_boxes');
        Schema::dropIfExists('applicant_team_members');
        Schema::dropIfExists('team_applicants');
        Schema::dropIfExists('individual_applicants');
    }
};
