<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// Ein User ist ein Host (Dozent/in). HasApiTokens gibt ihm die Fähigkeit,
// über Sanctum API-Tokens zu erzeugen (createToken()).
class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    // Diese Felder werden in JSON-Antworten NIE mitgeschickt:
    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'password' => 'hashed', // Passwort wird automatisch gehasht gespeichert
    ];

    // Ein Host kann viele Sessions haben (1:n).
    public function sessions()
    {
        return $this->hasMany(Session::class);
    }
}
