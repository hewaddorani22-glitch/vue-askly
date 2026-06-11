export interface Question {
  id: number
  text: string
  votes: number
  time: string
}

export interface Session {
  code: string
  questions: Question[]
  isEnded: boolean
  participantsCount: number
}