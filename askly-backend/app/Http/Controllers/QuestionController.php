<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuestionVote;
use App\Models\Session;
use Illuminate\Http\Request;

// Zuständig für das Stellen von Fragen und das Hochvoten.
// Die Moderation (unangemessene Sprache) passiert hier SERVERSEITIG –
// so kann sie kein Nutzer im Browser umgehen.
class QuestionController extends Controller
{
    // Wortfilter serverseitig. In einer echten App käme das aus einer Config/DB.
    private array $bannedWords = [
        'fucking', 'shit', 'bitch', 'asshole', 'sex',
        'ficken', 'fick dich', 'hurensohn', 'hure', 'nutte',
        'arsch', 'arschloch',
    ];

    // POST /api/sessions/{code}/questions  (öffentlich) -> Gast stellt anonyme Frage
    public function store(Request $request, string $code)
    {
        // 1) Eingabe validieren
        $data = $request->validate([
            'text' => 'required|string|min:3|max:280',
        ]);

        // 2) Session finden und prüfen, ob sie noch läuft
        $session = Session::where('code', strtoupper($code))->firstOrFail();
        if ($session->is_ended) {
            return response()->json(['message' => 'Diese Session ist beendet.'], 410);
        }

        // 3) Moderation: enthält der Text ein verbotenes Wort?
        if ($this->containsBannedWord($data['text'])) {
            // 422 = Unprocessable Entity (Validierung/Moderation fehlgeschlagen)
            return response()->json([
                'message' => 'Deine Frage enthält unangemessene Sprache.',
            ], 422);
        }

        // 4) Frage speichern
        $question = $session->questions()->create([
            'text'  => $data['text'],
            'votes' => 0,
        ]);

        // 5) 201 Created + die neue Frage zurückgeben
        return response()->json($question, 201);
    }

    // POST /api/questions/{question}/vote  (öffentlich) -> eine Frage hochvoten
    public function vote(Request $request, Question $question)
    {
        // voter_id ist eine anonyme Kennung, die der Browser erzeugt und mitschickt
        $data = $request->validate([
            'voter_id' => 'required|string|max:64',
        ]);

        // Hat dieser Voter diese Frage schon gevotet? -> unique-Constraint schützt zusätzlich
        $alreadyVoted = QuestionVote::where('question_id', $question->id)
            ->where('voter_id', $data['voter_id'])
            ->exists();

        if ($alreadyVoted) {
            return response()->json(['message' => 'Schon gevotet.'], 409); // 409 Conflict
        }

        // Vote-Eintrag anlegen und Zähler erhöhen
        QuestionVote::create([
            'question_id' => $question->id,
            'voter_id'    => $data['voter_id'],
        ]);
        $question->increment('votes');

        return response()->json($question->fresh());
    }

    // Hilfsfunktion: prüft den Text (case-insensitiv, wortgenau) gegen die Sperrliste.
    private function containsBannedWord(string $text): bool
    {
        foreach ($this->bannedWords as $word) {
            if (preg_match('/\b' . preg_quote($word, '/') . '\b/iu', $text)) {
                return true;
            }
        }
        return false;
    }
}
