<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Eine Session gehört einem Host und hat viele Fragen.
class Session extends Model
{
    protected $fillable = [
        'code',
        'title',
        'user_id',
        'is_ended',
        'participants_count',
    ];

    protected $casts = [
        'is_ended' => 'boolean',
    ];

    // Die Session gehört zu genau einem Host (n:1).
    public function host()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Eine Session hat viele Fragen (1:n).
    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
