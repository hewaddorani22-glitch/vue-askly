import { ref } from 'vue'

const locale = ref<'de' | 'en'>(
  (localStorage.getItem('askly_locale') as 'de' | 'en') || 'de'
)

const texts = {
  de: {
    feature1Title: 'Anonym Fragen stellen',
feature1Text:
  'Studierende können ohne Registrierung Fragen stellen und direkt teilnehmen.',

feature2Title: 'Fragen Hochvoten',
feature2Text:
  'Wichtige Fragen können hochgevotet werden, damit Dozierende Prioritäten erkennen.',

feature3Title: 'Live Sessions',
feature3Text:
  'Echtzeit-Fragen und Antworten für moderne Vorlesungen und Workshops.',

landingTitle: 'Einfach. Anonym. Interaktiv.',
landingText:
  'Askly hilft Dozierenden Fragen in Echtzeit zu sammeln und Studierende anonym einzubinden.',
    homeTitle: 'Anonyme Fragen für moderne Vorlesungen',
    homeSubtitle: 'Live, interaktiv, ohne Registrierung',
    forStudents: 'Für Studierende',
    joinSessionTitle: 'Session beitreten',
    joinButton: 'Beitreten',
    forLecturers: 'Für Dozierende',
    startSessionTitle: 'Session starten',
    createSessionButton: 'Neue Session erstellen',
    profileTitle: 'Mein Profil',
    currentName: 'Aktueller Name:',
    edit: 'Bearbeiten',
    save: 'Speichern',
    cancel: 'Abbrechen',
    historyTitle: 'Fragen-Historie',
    noQuestions: 'Noch keine Fragen gestellt.',
    timeSession: 'Uhrzeit – Session',
    bugReportTitle: 'Problem melden',
    bugPlaceholder: 'Beschreibe das Problem...',
    bugSubmit: 'Absenden',
    bugSuccess: 'Danke für die Meldung!',
    bugError: 'Fehler beim Senden.',
    howtoTitle: 'How to use – Anleitung',
    howtoText: `<strong>Für Dozierende (Host):</strong><br>
      1. Klicke auf "Neue Session erstellen".<br>
      2. Ein eindeutiger Code (z.B. 123AB) wird generiert.<br>
      3. Teile diesen Code mit deinem Publikum.<br>
      4. In der Session-Ansicht siehst du alle Fragen in Echtzeit.<br>
      5. Beende die Session, wenn die Fragerunde abgeschlossen ist.<br><br>
      <strong>Für Studierende (Gäste):</strong><br>
      1. Gib den Code des Dozenten ein und klicke "Beitreten".<br>
      2. Stelle anonyme Fragen.<br>
      3. Bewerte Fragen anderer mit dem Upvote-Button.<br>
      4. Deine eigenen Fragen werden in der Historie gespeichert.<br><br>
      <strong>Allgemein:</strong><br>
      - Name ändern (lokal gespeichert).<br>
      - Probleme melden (landen in Firebase).<br>
      - Dunkelmodus und Sprachumschaltung verfügbar.`
  },
  en: {
feature1Title: 'Ask anonymously',
feature1Text:
  'Students can ask questions without registration and participate instantly.',

feature2Title: 'Vote questions',
feature2Text:
  'Upvote important questions so lecturers can focus on what matters most.',

feature3Title: 'Live sessions',
feature3Text:
  'Real-time questions and answers for lectures, workshops, and interactive sessions.',

landingTitle: 'Simple. Anonymous. Interactive.',
landingText:
  'Askly helps lecturers collect questions in real time while keeping students engaged through anonymous participation and voting.',
    homeTitle: 'Anonymous questions for modern lectures',
    homeSubtitle: 'Live, interactive, no registration',
    forStudents: 'For students',
    joinSessionTitle: 'Join session',
    joinButton: 'Join',
    forLecturers: 'For lecturers',
    startSessionTitle: 'Start session',
    createSessionButton: 'Create new session',
    profileTitle: 'My Profile',
    currentName: 'Current name:',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    historyTitle: 'Question History',
    noQuestions: 'No questions asked yet.',
    timeSession: 'Time – Session',
    bugReportTitle: 'Report a Problem',
    bugPlaceholder: 'Describe the problem...',
    bugSubmit: 'Submit',
    bugSuccess: 'Thank you for your report!',
    bugError: 'Error sending report.',
    howtoTitle: 'How to use',
    howtoText: `<strong>For lecturers (Host):</strong><br>
      1. Click "Create new session".<br>
      2. A unique code (e.g. 123AB) will be generated.<br>
      3. Share this code with your audience.<br>
      4. In the session view you see all incoming questions.<br>
      5. End the session when the Q&A is finished.<br><br>
      <strong>For students (Guests):</strong><br>
      1. Enter the code and click "Join".<br>
      2. Ask anonymous questions.<br>
      3. Upvote questions from others.<br>
      4. Your own questions are saved in the history.<br><br>
      <strong>General:</strong><br>
      - Change your name (stored locally).<br>
      - Report issues (sent to Firebase).<br>
      - Dark mode and language switching available.`
  }
} as const

export const t = (key: string): string => {
  return (texts[locale.value] as Record<string, string>)[key] || key
}

export const setLocale = (newLocale: 'de' | 'en') => {
  locale.value = newLocale
  localStorage.setItem('askly_locale', newLocale)
}

export const useLocale = () => locale