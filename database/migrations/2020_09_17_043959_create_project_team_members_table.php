<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProjectTeamMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('project_team_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_team_id');
            $table->unsignedBigInteger('member_id');
            $table->string('expertise')->nullable();
            $table->text('assessment')->nullable();
            $table->string('score')->nullable();

            $table->unique(['project_team_id', 'member_id']);
            $table->foreign('project_team_id')->references('id')->on('project_teams')->onDelete('cascade');
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
        Schema::dropIfExists('project_team_members');
    }
}
