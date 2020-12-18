<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicantTeamMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('applicant_team_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_applicant_id');
            $table->unsignedBigInteger('member_id');
            $table->string('expertise');

            $table->unique(['team_applicant_id', 'member_id']);
            $table->foreign('team_applicant_id')->references('id')->on('team_applicants')->onDelete('cascade');
            $table->foreign('member_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('applicant_team_members');
    }
}
