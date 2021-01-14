<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('role');
            $table->string('tagname')->unique()->nullable();
            $table->string('identity_number')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('expertise')->nullable();
            $table->string('university')->nullable();
            $table->string('faculty')->nullable();
            $table->string('major')->nullable();
            $table->string('location')->nullable();
            $table->text('biography')->nullable();
            $table->boolean('is_open_hired')->default(false);

            $table->string('behance')->nullable();
            $table->string('github')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('dribbble')->nullable();
            $table->string('website')->nullable();

            $table->string('cv_url')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
