<script setup>
import { ref, onMounted } from 'vue'
import { useSessionStore } from './stores/sessionStore.js'
import HomeView from './components/HomeView.vue'
import LoginView from './components/LoginView.vue'
import ProfileView from './components/ProfileView.vue'
import Impressum from './components/Impressum.vue'
import CookieConsent from './components/CookieConsent.vue'
import QrCodeModal from './components/QrCodeModal.vue'
import { setLocale, useLocale } from './i18n.js'

const store = useSessionStore()
const currentView = ref('home')
const errorMessage = ref('')
const newQuestionText = ref('')
const showEndConfirmation = ref(false)
const isMenuOpen = ref(false)
const showQrModal = ref(false)
const locale = useLocale()

// Cookie-Zustimmung prüfen
const cookiesAccepted = ref(false)

// Login State - Standardmäßig als Gast eingeloggt
const isLoggedIn = ref(true)
const currentUser = ref(null)

// View State für Login/Register Modal
const showLoginModal = ref(false)

// Dark Mode
const isDarkMode = ref(false)

const checkSystemTheme = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkMode.value = prefersDark
  
  if (prefersDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const setupThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e) => {
    if (e.matches) {
      document.documentElement.classList.add('dark')
      isDarkMode.value = true
    } else {
      document.documentElement.classList.remove('dark')
      isDarkMode.value = false
    }
  }
  mediaQuery.addEventListener('change', handler)
}

// Login Handler
const handleLoginSuccess = (user) => {
  currentUser.value = user
  showLoginModal.value = false
}

// Modal schließen (bleibt als Gast)
const closeLoginModal = () => {
  showLoginModal.value = false
}

// Host meldet sich ab
const handleLogout = async () => {
  await store.logout()
}

// HomeView meldet: "Zum Erstellen einer Session ist Login nötig" -> Modal öffnen
const handleNeedLogin = () => {
  showLoginModal.value = true
}

onMounted(() => {
  // Prüfe Cookie-Zustimmung
  const consent = localStorage.getItem('cookie-consent')
  cookiesAccepted.value = consent === 'accepted'
  
  if (!cookiesAccepted.value) return // Nichts weiter laden
  
  checkSystemTheme()
  setupThemeListener()

  // Gast-User nur wenn Cookies akzeptiert
  currentUser.value = {
    username: 'Gast_' + Math.floor(Math.random() * 10000),
    email: '',
    role: 'guest',
    isGuest: true
  }

  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (code && code.length === 5) {
    store.joinSession(code).then(() => {
      currentView.value = 'session'
    }).catch((err) => {
      errorMessage.value = err.message
    })
  }
})


const addQuestion = async () => {
  if (!newQuestionText.value.trim()) return

  try {
    // Moderation passiert jetzt im Backend: bei unangemessenem Text wirft
    // store.addQuestion einen Error (HTTP 422), den wir unten anzeigen.
    const newQ = await store.addQuestion(newQuestionText.value.trim())
    const userQuestions = JSON.parse(localStorage.getItem('askly_userQuestions') || '[]')
    userQuestions.unshift({
      text: newQ.text,
      time: new Date().toLocaleString(),
      sessionCode: store.activeSessionCode.value
    })
    localStorage.setItem('askly_userQuestions', JSON.stringify(userQuestions))
    newQuestionText.value = ''
    errorMessage.value = ''
  } catch (err) {
    errorMessage.value = err.message
  }
}

const voteQuestion = async (questionId) => {
  try {
    await store.voteQuestion(questionId)
  } catch (err) {
    errorMessage.value = err.message
  }
}

const endSession = async () => {
  await store.endSession()
  showEndConfirmation.value = false
  currentView.value = 'home'
}
</script>

<template>
  <!-- Cookie Consent erzwingt Zustimmung VOR allem anderen -->
  <CookieConsent v-if="!cookiesAccepted" />
  
  <!-- Erst nach Cookie-Zustimmung wird der Inhalt angezeigt -->
  <template v-else>
    <!-- Login/Register Modal -->
    <LoginView 
      v-if="showLoginModal" 
      @login-success="handleLoginSuccess" 
      @close="closeLoginModal"
    />
    
    <div class="min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900">
      <!-- Header -->
      <header class="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center gap-2">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Askly</h1>
          
          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-2">
            <button @click="currentView = 'home'" :class="['px-4 py-2 rounded-lg font-medium transition', currentView === 'home' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800']">Home</button>
            <button @click="currentView = 'session'" :class="['px-4 py-2 rounded-lg font-medium transition', currentView === 'session' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800']">Session</button>
            <button @click="currentView = 'profile'" :class="['px-4 py-2 rounded-lg font-medium transition', currentView === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800']">Profil</button>
            
            <div class="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300 dark:border-gray-700">
              <button 
                v-if="!store.isAuthenticated.value"
                @click="showLoginModal = true"
                class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Host-Login
              </button>
              <button 
                v-else
                @click="handleLogout"
                class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition font-medium"
              >
                Abmelden
              </button>
            </div>
            
            <div class="flex gap-1 ml-2">
              <button @click="setLocale('de')" :class="['px-2 py-1 rounded text-sm', locale==='de'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200']">DE</button>
              <button @click="setLocale('en')" :class="['px-2 py-1 rounded text-sm', locale==='en'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200']">EN</button>
            </div>
          </div>

          <!-- Mobile: Hamburger Button -->
          <div class="flex items-center gap-3 md:hidden">
            <div class="flex gap-1">
              <button @click="setLocale('de')" :class="['px-2 py-1 rounded text-sm', locale==='de'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200']">DE</button>
              <button @click="setLocale('en')" :class="['px-2 py-1 rounded text-sm', locale==='en'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200']">EN</button>
            </div>
            <button @click="isMenuOpen = !isMenuOpen" class="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <span class="w-6 h-0.5 bg-gray-800 dark:bg-white"></span>
              <span class="w-6 h-0.5 bg-gray-800 dark:bg-white"></span>
              <span class="w-6 h-0.5 bg-gray-800 dark:bg-white"></span>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Menü Overlay -->
      <Transition name="fade">
        <div v-if="isMenuOpen" class="fixed inset-0 z-40 md:hidden" @click="isMenuOpen = false">
          <div class="absolute inset-0 bg-black/50"></div>
          <nav class="absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-900 shadow-xl p-6" @click.stop>
            <div class="mt-16 flex flex-col gap-3">
              <button @click="currentView = 'home'; isMenuOpen = false" :class="['px-4 py-3 rounded-xl text-left', currentView === 'home' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800']">🏠 Home</button>
              <button @click="currentView = 'session'; isMenuOpen = false" :class="['px-4 py-3 rounded-xl text-left', currentView === 'session' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800']">💬 Session</button>
              <button @click="currentView = 'profile'; isMenuOpen = false" :class="['px-4 py-3 rounded-xl text-left', currentView === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800']">👤 Profil</button>
              
              <div class="border-t border-gray-200 dark:border-gray-700 my-3"></div>
              
              <button v-if="!store.isAuthenticated.value" @click="showLoginModal = true; isMenuOpen = false" class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-left font-medium">
                🔐 Host-Login
              </button>
              <button v-else @click="handleLogout(); isMenuOpen = false" class="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-left font-medium">
                🚪 Abmelden
              </button>
            </div>
          </nav>
        </div>
      </Transition>

      <main class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- HOME VIEW -->
        <div v-if="currentView === 'home'">
          <HomeView @navigate="(view) => { currentView = view; }" @need-login="handleNeedLogin" />
        </div>

        <!-- SESSION VIEW -->
        <div v-if="currentView === 'session'">
          <div v-if="!store.currentSession.value" class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">Keine aktive Session.</p>
            <button @click="currentView = 'home'" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl">Zurück</button>
          </div>
          <div v-else>
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6 flex flex-wrap justify-between items-center">
              <div>
                <h2 class="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  Session: {{ store.currentSession.value.code }}
                  <button @click="showQrModal = true" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition" title="QR-Code">QR</button>
                </h2>
                <p class="text-gray-600 dark:text-gray-400">
                  Teilnehmer: {{ store.currentSession.value.participantsCount }} | Fragen: {{ store.currentSession.value.questions.length }}
                </p>
              </div>
              <button v-if="store.userRole.value === 'host'" @click="showEndConfirmation = true" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl">Session beenden</button>
            </div>

            <div v-if="store.userRole.value !== 'host'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
              <textarea
                v-model="newQuestionText"
                rows="2"
                placeholder="Deine anonyme Frage..."
                class="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              ></textarea>
              <button @click="addQuestion" class="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl">Frage senden</button>
            </div>

            <div class="space-y-3">
              <div v-for="q in store.sortedQuestions.value" :key="q.id" class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex justify-between items-start">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-500">{{ q.time }}</p>
                  <p class="text-gray-800 dark:text-gray-100">{{ q.text }}</p>
                </div>
                <button @click="voteQuestion(q.id)" :disabled="store.userRole.value === 'host' || store.votedQuestionIds.value.includes(q.id)" class="flex flex-col items-center px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50">
                  <span class="text-gray-800 dark:text-gray-200">▲</span>
                  <span class="font-bold text-gray-800 dark:text-gray-200">{{ q.votes }}</span>
                </button>
              </div>
            </div>

            <div v-if="showEndConfirmation" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Session beenden?</h3>
                <div class="flex gap-3 mt-6">
                  <button @click="endSession" class="flex-1 bg-red-500 text-white py-2 rounded-xl">Ja</button>
                  <button @click="showEndConfirmation = false" class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-xl">Nein</button>
                </div>
              </div>
            </div>

            <QrCodeModal
              :visible="showQrModal"
              :sessionCode="store.currentSession.value.code"
              :sessionUrl="store.getSessionUrl(store.currentSession.value.code)"
              @update:visible="showQrModal = $event"
            />
          </div>
        </div>

        <!-- PROFILE VIEW -->
        <div v-if="currentView === 'profile'">
          <ProfileView />
        </div>
      </main>
    </div>
  </template>
</template>

<style>
body {
  background-color: #ffffff;
  color: #1a1a1a;
}

html.dark,
html.dark body {
  background-color: #121212 !important;
  color: #ffffff !important;
}

html.dark .bg-white,
html.dark .bg-gray-50,
html.dark .bg-gray-100 {
  background-color: #1e1e1e !important;
}

html.dark .text-gray-900,
html.dark .text-gray-800,
html.dark .text-gray-700,
html.dark .text-gray-600,
html.dark .text-black {
  color: #ffffff !important;
}

html.dark .text-gray-500,
html.dark .text-gray-400 {
  color: #b0b0b0 !important;
}

html.dark .border-gray-200,
html.dark .border-gray-300 {
  border-color: #333333 !important;
}

html.dark input,
html.dark textarea {
  background-color: #2a2a2a !important;
  color: #ffffff !important;
  border-color: #444444 !important;
}


html.dark input::placeholder,
html.dark textarea::placeholder {
  color: #888888 !important;
}

html.dark button.bg-gray-200,
html.dark button.bg-gray-100 {
  background-color: #2a2a2a !important;
  color: #ffffff !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>