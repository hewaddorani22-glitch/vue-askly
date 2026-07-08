<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Eine Frage gehört zu einer Session und hat viele Vote-Einträge.
class Question extends Model
{
    protected $fillable = [
        'session_id',
        'text',
        'votes',
    ];

    // Die Frage gehört zu genau einer Session (n:1).
    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    // Eine Frage hat viele Vote-Einträge (1:n) – je einer pro Voter.
    public function voteRecords()
    {
        return $this->hasMany(QuestionVote::class);
    }
}
