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
            $table->string('title');
            $table->string('description');
            $table->string('salary')->nullable();
            $table->boolean('certificate')->default(false);
            $table->string('max_person');
            $table->string('image')->nullable();
            $table->boolean('ui_ux_designer');
            $table->boolean('front_end_engineer');
            $table->boolean('back_end_engineer');
            $table->boolean('data_expert');
            $table->string('min_points');
            $table->string('level_applicant');
            $table->string('applicant_type')->default('Individual & Team');
            $table->string('status')->default('Hiring');
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
