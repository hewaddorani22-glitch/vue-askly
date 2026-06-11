<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
        <h1 class="text-3xl font-bold text-white">Askly</h1>
        <p class="text-blue-100 mt-2">Neues Konto erstellen</p>
      </div>

      <!-- Register Form -->
      <div class="p-6">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Benutzername
            </label>
            <input 
              v-model="registerForm.username"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="max.mustermann"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              E-Mail
            </label>
            <input 
              v-model="registerForm.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="dein@email.de"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passwort
            </label>
            <input 
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passwort bestätigen
            </label>
            <input 
              v-model="registerForm.passwordConfirm"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
            >
          </div>

          <button 
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
          >
            <span v-if="!isLoading">Konto erstellen</span>
            <span v-else>Wird erstellt...</span>
          </button>
        </form>

        <!-- Link zurück zum Login -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Bereits ein Konto?
            <button 
              @click="$emit('switch-to-login')"
              class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Hier anmelden
            </button>
          </p>
        </div>
      </div>
    </div>

    <!-- Error Toast -->
    <div v-if="errorMessage" class="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'register-success', user: { username: string; email: string; role: string }): void
  (e: 'switch-to-login'): void
}>()

const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  passwordConfirm: ''
})

const handleRegister = async () => {
  errorMessage.value = ''
  
  if (registerForm.value.password !== registerForm.value.passwordConfirm) {
    errorMessage.value = 'Passwörter stimmen nicht überein'
    setTimeout(() => errorMessage.value = '', 3000)
    return
  }
  
  if (registerForm.value.password.length < 6) {
    errorMessage.value = 'Passwort muss mindestens 6 Zeichen lang sein'
    setTimeout(() => errorMessage.value = '', 3000)
    return
  }

  isLoading.value = true

  // Hier deine Firebase Registrierungs-Logik einfügen
  setTimeout(() => {
    emit('register-success', {
      username: registerForm.value.username,
      email: registerForm.value.email,
      role: 'student'
    })
    isLoading.value = false
  }, 800)
}
</script>