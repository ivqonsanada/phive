<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One conversation per unordered pair of users.
        Schema::create('message_headers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_one_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_two_id')->constrained('users')->cascadeOnDelete();

            $table->unique(['user_one_id', 'user_two_id']);
        });

        Schema::create('message_bodies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_header_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->timestamps();

            $table->index(['message_header_id', 'created_at']);
        });

        Schema::create('inboxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('team_invitation_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('project_invitation_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('message_body_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('category')->index();
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index(['recipient_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inboxes');
        Schema::dropIfExists('message_bodies');
        Schema::dropIfExists('message_headers');
    }
};
