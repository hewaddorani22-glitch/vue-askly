import { ref, computed } from 'vue'
import { api, setToken, clearToken, getToken } from '../api.js'

// ---------- Modulweite (geteilte) Zustände ----------
const activeSessionCode = ref(null)
const userRole = ref(null)              // 'host' | 'guest' | null
const votedQuestionIds = ref([])
const currentSession = ref(null)
const isAuthenticated = ref(!!getToken())

// Anonyme Voter-Kennung pro Browser (kein Login nötig).
// Wird einmal erzeugt und dauerhaft gespeichert, damit derselbe Browser
// nicht doppelt voten kann.
const getVoterId = () => {
  let id = localStorage.getItem('askly_voter_id')
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('askly_voter_id', id)
  }
  return id
}

// ---------- Abgeleiteter Zustand ----------
const sortedQuestions = computed(() => {
  if (!currentSession.value) return []
  return [...currentSession.value.questions].sort((a, b) => b.votes - a.votes)
})

// Wandelt einen created_at-Zeitstempel des Backends in eine kurze Uhrzeit um.
const toTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ---------- Der Store ----------
export const useSessionStore = () => {
  let pollTimer = null

  // Statt Firebase-"onValue" fragen wir die Session per Polling im Sekundentakt ab.
  const startPolling = (code) => {
    stopPolling()
    const fetchSession = async () => {
      try {
        const data = await api.get(`/sessions/${code}`)
        const questions = (data.questions || []).map((q) => ({
          ...q,
          time: toTime(q.created_at),
        }))
        currentSession.value = { ...data, questions }

        // Gast wird automatisch rausgeworfen, wenn der Host die Session beendet
        if (data.is_ended && userRole.value === 'guest') {
          leaveSession()
        }
      } catch (err) {
        console.error('Polling-Fehler:', err.message)
      }
    }
    fetchSession()                               // sofort einmal laden
    pollTimer = setInterval(fetchSession, 2000)  // dann alle 2 Sekunden
  }

  const stopPolling = () => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
  }

  const leaveSession = () => {
    stopPolling()
    activeSessionCode.value = null
    userRole.value = null
    currentSession.value = null
  }

  // ---------- Auth ----------
  const register = async (name, email, password) => {
    const data = await api.post('/register', { name, email, password })
    setToken(data.token)
    isAuthenticated.value = true
    return data.user
  }

  const login = async (email, password) => {
    const data = await api.post('/login', { email, password })
    setToken(data.token)
    isAuthenticated.value = true
    return data.user
  }

  const logout = async () => {
    try { await api.post('/logout') } catch { /* Token evtl. schon weg */ }
    clearToken()
    isAuthenticated.value = false
  }

  // ---------- Sessions ----------
  // Nur eingeloggte Hosts duerfen Sessions erstellen (Backend erzwingt das).
  const createSession = async (title = null) => {
    const session = await api.post('/sessions', { title })
    activeSessionCode.value = session.code
    userRole.value = 'host'
    startPolling(session.code)
    return session.code
  }

  const joinSession = async (rawCode) => {
    const code = rawCode.trim().toUpperCase()
    if (!/^\d{3}[A-Z]{2}$/.test(code)) throw new Error('Ungueltiges Code-Format')
    await api.post(`/sessions/${code}/join`)   // Backend prueft Existenz & is_ended
    activeSessionCode.value = code
    userRole.value = 'guest'
    startPolling(code)
  }

  const endSession = async () => {
    if (!activeSessionCode.value) return
    await api.patch(`/sessions/${activeSessionCode.value}/end`)
    leaveSession()
  }

  // ---------- Fragen ----------
  const addQuestion = async (text) => {
    if (userRole.value === 'host') throw new Error('Der Host kann keine Fragen stellen')
    if (!activeSessionCode.value) throw new Error('Keine aktive Session')
    // Moderation passiert jetzt SERVERSEITIG. Bei unangemessenem Text
    // antwortet das Backend mit 422 und request() wirft einen Error.
    const question = await api.post(`/sessions/${activeSessionCode.value}/questions`, { text })
    return question
  }

  const voteQuestion = async (questionId) => {
    if (userRole.value === 'host') throw new Error('Der Host kann nicht voten')
    if (votedQuestionIds.value.includes(questionId)) return
    await api.post(`/questions/${questionId}/vote`, { voter_id: getVoterId() })
    votedQuestionIds.value.push(questionId)   // UI sofort sperren; Server sichert zusaetzlich
  }

  const getSessionUrl = (code) => `${window.location.origin}?code=${code}`

  return {
    currentSession,
    sortedQuestions,
    userRole,
    votedQuestionIds,
    activeSessionCode,
    isAuthenticated,
    register,
    login,
    logout,
    createSession,
    joinSession,
    endSession,
    addQuestion,
    voteQuestion,
    getSessionUrl,
  }
}
