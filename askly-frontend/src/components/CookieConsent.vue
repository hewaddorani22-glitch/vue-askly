<template>
  <div v-if="!cookiesAccepted" class="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-center">
        <h1 class="text-2xl font-bold text-white">🍪 Cookie-Hinweis</h1>
      </div>

      <!-- Content -->
      <div class="p-6">
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          Wir verwenden Cookies und speichern Ihre Daten, um die Live-Session-Funktionalität zu gewährleisten.
        </p>
        
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 text-sm">
          <p class="font-semibold mb-2 text-gray-800 dark:text-white">Folgende Daten werden gespeichert:</p>
          <ul class="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>Ihre Anmeldedaten (E-Mail, Benutzername)</li>
            <li>Ihre gestellten Fragen und Votes</li>
            <li>Session-Code für automatischen Wiedereintritt</li>
            <li>Sprachauswahl (DE/EN)</li>
          </ul>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Ihre Daten werden nicht an Dritte weitergegeben. Sie können Ihre Zustimmung jederzeit über die Browser-Einstellungen widerrufen.
        </p>

        <button 
          @click="acceptCookies"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
        >
          Akzeptieren und fortfahren
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const cookiesAccepted = ref(false)

const acceptCookies = () => {
  cookiesAccepted.value = true
  localStorage.setItem('cookie-consent', 'accepted')
  // Seite neu laden, um alles zu initialisieren
  window.location.reload()
}

onMounted(() => {
  const consent = localStorage.getItem('cookie-consent')
  if (consent === 'accepted') {
    cookiesAccepted.value = true
  }
})
</script>