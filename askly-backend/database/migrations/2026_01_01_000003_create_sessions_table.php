<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Eine "Session" ist eine Frage-Runde, die ein Host eröffnet (z.B. für eine Vorlesung).
// Sie hat einen kurzen Beitritts-Code (z.B. "123AB"), gehört einem Host (user_id)
// und kann beendet werden (is_ended).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 5)->unique();          // Beitritts-Code, z.B. 123AB
            $table->string('title')->nullable();          // optionaler Titel der Runde
            $table->foreignId('user_id')                  // der Host, dem die Session gehört
                  ->constrained()
                  ->onDelete('cascade');
            $table->boolean('is_ended')->default(false);  // beendet ja/nein
            $table->unsignedInteger('participants_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
