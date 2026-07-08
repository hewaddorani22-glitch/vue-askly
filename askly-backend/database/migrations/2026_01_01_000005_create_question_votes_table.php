<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Diese Tabelle merkt sich, WER eine Frage schon hochgevotet hat.
// "voter_id" ist eine anonyme Kennung, die der Browser des Gasts erzeugt (kein Login nötig).
// Das unique-Constraint (question_id + voter_id) verhindert serverseitig doppeltes Voten.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->string('voter_id');                   // anonyme Browser-Kennung
            $table->timestamps();

            // Jede voter_id darf jede Frage nur EINMAL voten:
            $table->unique(['question_id', 'voter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_votes');
    }
};
