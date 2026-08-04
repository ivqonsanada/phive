<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('Draft')->index();
            $table->string('applicant_type')->default('Individual & Team');
            $table->string('max_person')->default('Not Specified');
            $table->string('thumbnail')->nullable();
            $table->string('level_applicant')->nullable();

            $table->boolean('ui_ux_designer')->default(false);
            $table->boolean('front_end_engineer')->default(false);
            $table->boolean('back_end_engineer')->default(false);
            $table->boolean('data_expert')->default(false);

            $table->boolean('certificate')->default(false);
            $table->boolean('salary')->default(false);
            $table->boolean('is_open_hiring')->default(true);
            $table->string('currency')->default('IDR');
            $table->string('salary_amount')->default('0');
            $table->string('payment_type')->default('person');

            $table->string('project_url')->nullable()->unique();
            $table->timestamp('start_time')->nullable();
            $table->timestamp('finish_time')->nullable();
            $table->timestamps();
        });

        Schema::create('project_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('requirement');
        });

        Schema::create('project_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('name');

            $table->unique(['project_id', 'name']);
        });

        Schema::create('project_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('overall_score')->nullable();
            $table->text('overall_review')->nullable();
            $table->string('project_result')->nullable();
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'project_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('project_reviews');
        Schema::dropIfExists('project_skills');
        Schema::dropIfExists('project_requirements');
        Schema::dropIfExists('projects');
    }
};
