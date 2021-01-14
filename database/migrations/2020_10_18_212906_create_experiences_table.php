<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExperiencesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('project_name');
            $table->string('project_role');
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
    // message: "SQLSTATE[21S01]: Insert value list does not match column list: 1136 Column count doesn't match value count at row 2 (SQL:
    // insert
    // into `experiences`
    // (`end_date`, `id`, `name`, `role`, `start_date`, `user_id`) values
    // (2020-11-30 17:00:00, 1, asdf, asdf, 2020-10-31 17:00:00, 1),
    // (2020-10-31T17:00:00.000Z, sdf, asdf, 2020-08-31T17:00:00.000Z, 1),
    // (2021-05-31T17:00:00.000Z, sadfsafdsdf, sadfssr23r23rsed, 2020-10-31T17:00:00.000Z, 1))"

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('experiences');
    }
}
