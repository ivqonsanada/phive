<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('Hiring');
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
            $table->string('project_url')->nullable();
            $table->timestamp('start_time')->nullable();
            $table->timestamp('finish_time')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('projects');
    }
}
