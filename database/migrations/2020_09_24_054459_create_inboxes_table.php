<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInboxesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inboxes', function (Blueprint $table) {
            $table->id();
            // $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('recipient_id');
            $table->unsignedBigInteger('sender_id');
            // $table->unsignedBigInteger('individual_applicant_id')->nullable();
            // $table->unsignedBigInteger('team_applicant_id')->nullable();
            $table->unsignedBigInteger('team_invitation_id')->nullable();
            $table->unsignedBigInteger('project_invitation_id')->nullable();
            $table->unsignedBigInteger('message_body_id')->nullable();
            $table->string('category');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->foreign('recipient_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            // $table->foreign('individual_applicant_id')->references('id')->on('individual_applicants')->onDelete('cascade');
            // $table->foreign('team_applicant_id')->references('id')->on('team_applicants')->onDelete('cascade');
            $table->foreign('team_invitation_id')->references('id')->on('team_invitations')->onDelete('cascade');
            $table->foreign('project_invitation_id')->references('id')->on('project_invitations')->onDelete('cascade');
            $table->foreign('message_body_id')->references('id')->on('message_bodies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('inboxes');
    }
}

