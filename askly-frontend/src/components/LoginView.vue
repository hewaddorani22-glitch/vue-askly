<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click="$emit('close')">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative" @click.stop>
      
      <!-- Close Button -->
      <button 
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl z-10"
      >
        ✕
      </button>
      
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
        <h1 class="text-3xl font-bold text-white">Askly</h1>
        <p class="text-blue-100 mt-2">Live Q&A für Vorlesungen</p>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          @click="activeTab = 'login'"
          :class="[
            'flex-1 py-4 text-center font-medium transition-all duration-200',
            activeTab === 'login' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          Anmelden
        </button>
        <button 
          @click="activeTab = 'register'"
          :class="[
            'flex-1 py-4 text-center font-medium transition-all duration-200',
            activeTab === 'register' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          Registrieren
        </button>
      </div>

      <!-- Login Form -->
      <div class="p-6">
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail</label>
            <input v-model="loginForm.email" type="email" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="dein@email.de">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort</label>
            <input v-model="loginForm.password" type="password" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="••••••••">
          </div>
          <button type="submit" :disabled="isLoading" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 rounded-lg">Anmelden</button>
        </form>

        <!-- Register Form -->
        <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Benutzername</label>
            <input v-model="registerForm.username" type="text" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="max.mustermann">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail</label>
            <input v-model="registerForm.email" type="email" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="dein@email.de">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort</label>
            <input v-model="registerForm.password" type="password" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="••••••••">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort bestätigen</label>
            <input v-model="registerForm.passwordConfirm" type="password" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="••••••••">
          </div>
          <button type="submit" :disabled="isLoading" class="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-2.5 rounded-lg">Registrieren</button>
        </form>

        <!-- Fehlermeldung -->
        <p v-if="errorMessage" class="mt-4 text-sm text-red-500 text-center">{{ errorMessage }}</p>

        <!-- Gast Hinweis -->
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Du bist als Gast unterwegs. <br>Mit einem Konto kannst du deine Daten speichern.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSessionStore } from '../stores/sessionStore.js'

const store = useSessionStore()

const emit = defineEmits([
  'login-success',
  'close'
])

const activeTab = ref('login')
const isLoading = ref(false)
const errorMessage = ref('')

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ username: '', email: '', password: '', passwordConfirm: '' })

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const user = await store.login(loginForm.value.email, loginForm.value.password)
    emit('login-success', { username: user.name, email: user.email, isGuest: false })
  } catch (err) {
    errorMessage.value = err.message || 'Login fehlgeschlagen'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  errorMessage.value = ''
  if (registerForm.value.password !== registerForm.value.passwordConfirm) {
    errorMessage.value = 'Passwörter stimmen nicht überein'
    return
  }
  isLoading.value = true
  try {
    const user = await store.register(
      registerForm.value.username,
      registerForm.value.email,
      registerForm.value.password
    )
    emit('login-success', { username: user.name, email: user.email, isGuest: false })
  } catch (err) {
    errorMessage.value = err.message || 'Registrierung fehlgeschlagen'
  } finally {
    isLoading.value = false
  }
}
</script>