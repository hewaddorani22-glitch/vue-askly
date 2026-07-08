<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Ein einzelner Vote-Eintrag: "voter_id hat question_id gevotet".
class QuestionVote extends Model
{
    protected $fillable = [
        'question_id',
        'voter_id',
    ];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
