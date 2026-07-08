<script setup>
import { t } from '../i18n.js'
import { ref } from 'vue'
import { useSessionStore } from '../stores/sessionStore.js'  

const store = useSessionStore()
const sessionInput = ref('')
const errorMessage = ref('')
const emit = defineEmits(['navigate', 'need-login'])

const createSession = async () => {
  // Nur eingeloggte Hosts dürfen eine Session erstellen.
  if (!store.isAuthenticated.value) {
    errorMessage.value = 'Bitte zuerst als Host anmelden.'
    emit('need-login')
    return
  }
  try {
    await store.createSession()
    emit('navigate', 'session')
  } catch (err) {
    errorMessage.value = err.message || 'Fehler beim Erstellen'
  }
}

const joinSession = async () => {
  const code = sessionInput.value.trim().toUpperCase()
  if (!code) {
    errorMessage.value = 'Bitte Code eingeben'
    return
  }
  try {
    await store.joinSession(code)
    emit('navigate', 'session')
    errorMessage.value = ''
  } catch (err) {
    errorMessage.value = err.message || 'Beitreten fehlgeschlagen'
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-4xl font-extrabold text-black dark:text-white">{{ t('homeTitle') }}</h2>
     
    </div>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
       
        <h3 class="text-xl font-bold mt-1">{{ t('joinSessionTitle') }}</h3>
       <input
  v-model="sessionInput"
  placeholder="Code (z.B. 123AB)"
  class="mt-4 w-full px-4 py-3 border rounded-xl bg-white text-black border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
/>
        <button @click="joinSession" class="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition">{{ t('joinButton') }}</button>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        
        <h3 class="text-xl font-bold mt-1">{{ t('startSessionTitle') }}</h3>
        <button @click="createSession" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">{{ t('createSessionButton') }}</button>
      </div>
    </div>
    <p v-if="errorMessage" class="text-red-500 text-center">{{ errorMessage }}</p>
  </div>
  <div class="mt-12 grid md:grid-cols-3 gap-6">
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
    <div class="text-3xl mb-3"></div>
    <h3 class="text-xl font-bold text-gray-900 dark:text-white">
      {{ t('feature1Title') }}
    </h3>
    
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
    <div class="text-3xl mb-3"></div>
    <h3 class="text-xl font-bold text-gray-900 dark:text-white">
      {{ t('feature2Title') }}
    </h3>
    
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
    <div class="text-3xl mb-3"></div>
    <h3 class="text-xl font-bold text-gray-900 dark:text-white">
      {{ t('feature3Title') }}
    </h3>
   
  </div>
</div>

<div class="mt-12 text-center">
  <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
    {{ t('landingTitle') }}
  </h3>

</div>
</template>