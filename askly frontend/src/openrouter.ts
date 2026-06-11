interface ModerationResult {
  flagged: boolean
  reason: string | null
}

export async function moderateQuestion(questionText: string): Promise<ModerationResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    console.warn('Kein OpenRouter API-Key gefunden. Moderation übersprungen.')
    return { flagged: false, reason: null }
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Askly'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Du bist ein Moderator für eine anonyme Q&A-Plattform.
Prüfe die folgende Nachricht auf:
- Beleidigungen, Hassrede, Mobbing
- Spam oder sinnlosen Inhalt
- Sexuell unangemessene Inhalte
- Werbung oder Links

Antworte NUR mit einem JSON-Objekt:
{"flagged": true/false, "reason": "kurzer Grund oder null"}

Erlaubt sind normale, sachliche Fragen – auch kritische.`
          },
          {
            role: 'user',
            content: questionText
          }
        ],
        max_tokens: 100,
        temperature: 0
      })
    })

    if (!response.ok) {
      console.error('OpenRouter Fehler:', response.status)
      return { flagged: false, reason: null }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    
    // JSON aus der Antwort extrahieren
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return {
        flagged: result.flagged === true,
        reason: result.reason || null
      }
    }
    
    return { flagged: false, reason: null }
  } catch (err) {
    console.error('Moderationsfehler:', err)
    return { flagged: false, reason: null }
  }
}