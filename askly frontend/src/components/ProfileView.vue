<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { push, set } from 'firebase/database'
import { ref as dbRef } from 'firebase/database'
import { db } from '../firebase'
import { t, setLocale, useLocale } from '../i18n'
import Impressum from './Impressum.vue'

const locale = useLocale()

const userName = ref(localStorage.getItem('askly_userName') || 'Gast')
const editNameInput = ref(userName.value)
const isEditingName = ref(false)
const userQuestions = ref<{ text: string, time: string, sessionCode: string }[]>([])
const bugReportText = ref('')
const bugReportSuccess = ref(false)
const bugReportError = ref('')

const saveUserName = () => {
  if (editNameInput.value.trim()) {
    userName.value = editNameInput.value.trim()
    localStorage.setItem('askly_userName', userName.value)
  }
  isEditingName.value = false
}

const loadUserQuestions = () => {
  const stored = localStorage.getItem('askly_userQuestions')
  if (stored) userQuestions.value = JSON.parse(stored)
}

const submitBugReport = async () => {
  if (!bugReportText.value.trim()) return
  bugReportError.value = ''
  bugReportSuccess.value = false
  try {
    const bugRef = push(dbRef(db, 'bugs'))
    await set(bugRef, {
      message: bugReportText.value.trim(),
      userName: userName.value,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
    bugReportText.value = ''
    bugReportSuccess.value = true
    setTimeout(() => { bugReportSuccess.value = false }, 3000)
  } catch (err) {
    console.error(err)
    bugReportError.value = t('bugError')
  }
}

onMounted(() => {
  loadUserQuestions()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 space-y-6">
    <div class="flex justify-end gap-2">
      <button @click="setLocale('de')" :class="['px-3 py-1 rounded', locale === 'de' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100']">DE</button>
      <button @click="setLocale('en')" :class="['px-3 py-1 rounded', locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100']">EN</button>
    </div>

    <!-- Profil Info -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('profileTitle') }}</h2>
      <div class="mt-4">
        <p class="text-gray-600 dark:text-gray-300">{{ t('currentName') }}</p>
        <div v-if="!isEditingName" class="flex justify-between items-center">
          <span class="text-xl font-semibold text-gray-900 dark:text-white">{{ userName }}</span>
          <button @click="isEditingName = true" class="text-blue-500">{{ t('edit') }}</button>
        </div>
        <div v-else class="space-y-2">
          <input v-model="editNameInput" class="w-full p-2 border rounded-xl bg-white text-black border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          <div class="flex gap-2">
            <button @click="saveUserName" class="bg-green-500 text-white px-4 py-1 rounded-lg">{{ t('save') }}</button>
            <button @click="isEditingName = false" class="bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white px-4 py-1 rounded-lg">{{ t('cancel') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fragen-Historie -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('historyTitle') }}</h2>
      <div v-if="userQuestions.length === 0" class="text-gray-500 dark:text-gray-400 mt-2">{{ t('noQuestions') }}</div>
      <ul class="mt-4 space-y-3 max-h-80 overflow-y-auto">
        <li v-for="(q, idx) in userQuestions" :key="idx" class="border-b dark:border-gray-700 pb-2">
          <p class="text-xs text-gray-400 dark:text-gray-500">{{ q.time }} – {{ t('timeSession') }} {{ q.sessionCode }}</p>
          <p class="text-gray-800 dark:text-gray-200">{{ q.text }}</p>
        </li>
      </ul>
    </div>

    <!-- Bug-Report -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('bugReportTitle') }}</h2>
      <textarea v-model="bugReportText" rows="3" :placeholder="t('bugPlaceholder')" class="mt-2 w-full p-3 border rounded-xl bg-white text-black border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"></textarea>
      <button @click="submitBugReport" class="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl">{{ t('bugSubmit') }}</button>
      <p v-if="bugReportSuccess" class="text-green-500 mt-2">{{ t('bugSuccess') }}</p>
      <p v-if="bugReportError" class="text-red-500 mt-2">{{ bugReportError }}</p>
    </div>

    <!-- How-To -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('howtoTitle') }}</h2>
      <div class="mt-4 prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" v-html="t('howtoText')"></div>
    </div>

    <!-- IMPRESSUM -->
    <Impressum />
  </div>
</template>