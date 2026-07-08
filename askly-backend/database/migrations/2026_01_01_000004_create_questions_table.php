<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Eine "Question" ist eine anonyme Frage, die ein Gast in eine Session stellt.
// Sie gehört immer genau zu einer Session (session_id = Fremdschlüssel).
// "votes" ist ein Zähler, der die Anzahl der Upvotes spiegelt (für schnelles Sortieren).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')               // zu welcher Session gehört die Frage
                  ->constrained()
                  ->onDelete('cascade');                  // Session gelöscht -> Fragen weg
            $table->text('text');                         // der Fragetext
            $table->unsignedInteger('votes')->default(0); // Anzahl Upvotes (Zähler)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
