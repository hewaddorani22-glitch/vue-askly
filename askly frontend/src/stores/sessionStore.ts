import { ref, computed } from 'vue'
import { ref as dbRef, onValue, set, update, get } from 'firebase/database'
import { db } from '../firebase'
import type { Question, Session } from '../types'

// ---------- Modulweite (geteilte) Zustände ----------
const activeSessionCode = ref<string | null>(null)
const userRole = ref<'host' | 'guest' | null>(null)
const votedQuestionIds = ref<number[]>([])
const currentSession = ref<Session | null>(null)   // ← jetzt GLOBAL

const bannedWords = [
  
  'tester',
  'fucking',
  'shit',
  'bitch',
  'asshole',
  'sex',
  'soso',
  'ficken',
  'fick dich',
  'hurensohn',
  'hure',
  'nutte',
  'arsch',
  'arschloch',
  'hund'
]
// ---------- Abgeleiteter Zustand ----------
const sortedQuestions = computed(() => {
  if (!currentSession.value) return []
  return [...currentSession.value.questions].sort((a, b) => b.votes - a.votes)
})

// ---------- Hilfsfunktion ----------
const generateCode = (): string => {
  const digits = Math.floor(Math.random() * 900 + 100).toString()
  const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                  String.fromCharCode(65 + Math.floor(Math.random() * 26))
  return `${digits}${letters}`
}

// ---------- Der Store (gibt nur noch Funktionen zurück) ----------
export const useSessionStore = () => {
  let unsubscribe: (() => void) | null = null

  const listenToSession = (code: string) => {
    if (unsubscribe) unsubscribe()
    const sessionRef = dbRef(db, `sessions/${code}`)
    unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        let questions = data.questions
        if (questions && !Array.isArray(questions)) questions = Object.values(questions)
        currentSession.value = { ...data, questions: questions || [] }
        if (data.isEnded && userRole.value === 'guest') {
          activeSessionCode.value = null
          userRole.value = null
          currentSession.value = null
        }
      } else {
        currentSession.value = null
      }
    })
  }

  const createSession = async () => {
    const code = generateCode()
    const newSession: Session = {
  code,
  questions: [],
  isEnded: false,
  participantsCount: 0
}
    try {
      await set(dbRef(db, `sessions/${code}`), newSession)
      activeSessionCode.value = code
      userRole.value = 'host'
      listenToSession(code)
      return code
    } catch (err) {
      console.error(err)
      throw new Error('Create failed')
    }
  }

  const joinSession = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase()
    if (!/^\d{3}[A-Z]{2}$/.test(code)) throw new Error('Invalid code format')
    const sessionRef = dbRef(db, `sessions/${code}`)
    const snapshot = await get(sessionRef)
    if (!snapshot.exists()) throw new Error('Session not found')
    const data = snapshot.val()
    if (data.isEnded) throw new Error('Session ended')
    const newCount = (data.participantsCount || 0) + 1
    await update(sessionRef, { participantsCount: newCount })
    activeSessionCode.value = code
    userRole.value = 'guest'
    listenToSession(code)
  }

  const endSession = async () => {
    if (!activeSessionCode.value) return
    const sessionRef = dbRef(db, `sessions/${activeSessionCode.value}`)
    await update(sessionRef, { isEnded: true })
    activeSessionCode.value = null
    userRole.value = null
    currentSession.value = null
    if (unsubscribe) unsubscribe()
    unsubscribe = null
  }

  const addQuestion = async (text: string) => {
    if (userRole.value === 'host') throw new Error('Host cannot add question')
    if (!activeSessionCode.value) throw new Error('No active session')
      const lowerText = text.toLowerCase()

    const containsBannedWord = bannedWords.some(word =>
    new RegExp(`\\b${word}\\b`, 'i').test(text)
)

  if (containsBannedWord) {
  throw new Error('Inappropriate language is not allowed')
}
    const sessionRef = dbRef(db, `sessions/${activeSessionCode.value}`)
    const snapshot = await get(sessionRef)
    const data = snapshot.val()
    if (!data) throw new Error('Session not found')
    let questions = data.questions || []
    if (!Array.isArray(questions)) questions = Object.values(questions)
    const newQuestion: Question = {
      id: Date.now(),
      text,
      votes: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    const updatedQuestions = [...questions, newQuestion]
    await update(sessionRef, { questions: updatedQuestions })
    return newQuestion
  }

  const voteQuestion = async (questionId: number) => {
    if (userRole.value === 'host') throw new Error('Host cannot vote')
    if (votedQuestionIds.value.includes(questionId)) return
    if (!activeSessionCode.value) throw new Error('No active session')
    const sessionRef = dbRef(db, `sessions/${activeSessionCode.value}`)
    const snapshot = await get(sessionRef)
    const data = snapshot.val()
    if (!data) throw new Error('Session not found')
    let questions = data.questions || []
    if (!Array.isArray(questions)) questions = Object.values(questions)
    const updatedQuestions = questions.map((q: Question) =>
      q.id === questionId ? { ...q, votes: q.votes + 1 } : q
    )
    await update(sessionRef, { questions: updatedQuestions })
    votedQuestionIds.value.push(questionId)
  }

  const getSessionUrl = (code: string) => `${window.location.origin}?code=${code}`

  return {
    currentSession,      // ← globaler Ref
    sortedQuestions,     // ← globaler computed
    userRole,            // ← globaler Ref
    votedQuestionIds,    // ← globaler Ref
    activeSessionCode,   // ← globaler Ref
    createSession,
    joinSession,
    endSession,
    addQuestion,
    voteQuestion,
    getSessionUrl
  }
}