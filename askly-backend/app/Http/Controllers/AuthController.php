<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

// Zuständig für Registrierung und Login der Hosts.
// Beim erfolgreichen Login gibt der Server einen API-Token zurück (Sanctum),
// den das Frontend bei geschützten Anfragen mitschickt.
class AuthController extends Controller
{
    // POST /api/register  -> neuen Host anlegen + Token zurückgeben
    public function register(Request $request)
    {
        // 1) Eingaben validieren
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        // 2) User anlegen (Passwort wird durch das 'hashed'-Cast automatisch gehasht)
        $user = User::create($data);

        // 3) API-Token erzeugen
        $token = $user->createToken('askly')->plainTextToken;

        // 4) 201 Created zurückgeben
        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    // POST /api/login  -> E-Mail/Passwort prüfen + Token zurückgeben
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        // Prüfen, ob User existiert UND Passwort stimmt
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['E-Mail oder Passwort ist falsch.'],
            ]);
        }

        $token = $user->createToken('askly')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    // POST /api/logout  -> aktuellen Token löschen (nur mit gültigem Token erreichbar)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Ausgeloggt.']);
    }

    // GET /api/user  -> aktuell eingeloggten Host zurückgeben
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
