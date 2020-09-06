<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentBadgesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('student_badges', function (Blueprint $table) {
            $table->id();
            // tiap kolom merepresentasikan 1 badge, jadi banyaknya badge berdampak pada banyaknya kolom
            // $table->
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('student_badges');
    }
}
