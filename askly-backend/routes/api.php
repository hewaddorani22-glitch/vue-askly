<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\SessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  (Präfix /api, definiert in bootstrap/app.php)
|--------------------------------------------------------------------------
| Hier steht die komplette REST-Landkarte von Askly.
| "öffentlich"  = ohne Login erreichbar (Gäste)
| "geschützt"   = nur mit gültigem Sanctum-Token (eingeloggte Hosts)
*/

// ---------- Auth (öffentlich) ----------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ---------- Sessions & Fragen: Gäste (öffentlich) ----------
Route::get('/sessions/{code}',              [SessionController::class, 'show']);
Route::post('/sessions/{code}/join',        [SessionController::class, 'join']);
Route::post('/sessions/{code}/questions',   [QuestionController::class, 'store']);
Route::post('/questions/{question}/vote',   [QuestionController::class, 'vote']);

// ---------- Nur für eingeloggte Hosts (geschützt via Sanctum) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',                    [AuthController::class, 'me']);
    Route::post('/logout',                 [AuthController::class, 'logout']);

    Route::get('/sessions',                [SessionController::class, 'index']);
    Route::post('/sessions',               [SessionController::class, 'store']);
    Route::patch('/sessions/{code}/end',   [SessionController::class, 'end']);
});
