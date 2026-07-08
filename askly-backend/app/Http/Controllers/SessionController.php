<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Illuminate\Http\Request;

// Zuständig für alles rund um Sessions: erstellen (Host), anzeigen (alle),
// beitreten (Gast) und beenden (Host).
class SessionController extends Controller
{
    // POST /api/sessions  (geschützt) -> Host erstellt eine neue Session
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $session = Session::create([
            'code'               => $this->generateUniqueCode(),
            'title'              => $data['title'] ?? null,
            'user_id'            => $request->user()->id, // der eingeloggte Host
            'is_ended'           => false,
            'participants_count' => 0,
        ]);

        return response()->json($session, 201);
    }

    // GET /api/sessions/{code}  (öffentlich) -> Session inkl. Fragen laden
    // Das Frontend ruft das im Sekundentakt auf (Polling), um live zu bleiben.
    public function show(string $code)
    {
        $session = Session::where('code', strtoupper($code))->firstOrFail();

        // Fragen absteigend nach Votes sortiert mitliefern
        $questions = $session->questions()
            ->orderByDesc('votes')
            ->orderBy('id')
            ->get();

        return response()->json([
            'code'               => $session->code,
            'title'              => $session->title,
            'is_ended'           => $session->is_ended,
            'participants_count' => $session->participants_count,
            'questions'          => $questions,
        ]);
    }

    // POST /api/sessions/{code}/join  (öffentlich) -> Gast tritt bei
    public function join(string $code)
    {
        $session = Session::where('code', strtoupper($code))->firstOrFail();

        if ($session->is_ended) {
            return response()->json(['message' => 'Diese Session ist beendet.'], 410);
        }

        // Teilnehmerzähler atomar um 1 erhöhen
        $session->increment('participants_count');

        return response()->json($session);
    }

    // PATCH /api/sessions/{code}/end  (geschützt) -> Host beendet seine Session
    public function end(Request $request, string $code)
    {
        $session = Session::where('code', strtoupper($code))->firstOrFail();

        // Nur der Host, dem die Session gehört, darf sie beenden
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Keine Berechtigung.'], 403);
        }

        $session->update(['is_ended' => true]);

        return response()->json($session);
    }

    // GET /api/sessions  (geschützt) -> alle Sessions des eingeloggten Hosts
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->sessions()->latest()->get()
        );
    }

    // Erzeugt einen eindeutigen 5-stelligen Code: 3 Ziffern + 2 Großbuchstaben, z.B. 742KP
    private function generateUniqueCode(): string
    {
        do {
            $digits  = str_pad((string) random_int(100, 999), 3, '0', STR_PAD_LEFT);
            $letters = chr(random_int(65, 90)) . chr(random_int(65, 90));
            $code    = $digits . $letters;
        } while (Session::where('code', $code)->exists());

        return $code;
    }
}
