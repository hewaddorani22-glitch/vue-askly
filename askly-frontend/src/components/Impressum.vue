<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mt-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Impressum</h2>
    
    <div class="space-y-6 text-gray-700 dark:text-gray-300">
      <!-- Angaben gemäß § 5 TMG -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Angaben gemäß § 5 TMG</h3>
        <div class="space-y-1">
          <p><strong class="font-medium">Betreiber:</strong></p>
          <p v-if="contactData.name">{{ contactData.name }}</p>
          <p v-else class="text-gray-400 italic">(noch nicht eingetragen)</p>
          
          <p class="mt-2"><strong class="font-medium">Anschrift:</strong></p>
          <p v-if="contactData.street">{{ contactData.street }}</p>
          <p v-if="contactData.city">{{ contactData.city }}</p>
          <p v-else class="text-gray-400 italic">(noch nicht eingetragen)</p>
        </div>
      </div>

      <!-- Kontakt -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Kontakt</h3>
        <div class="space-y-1">
          <p><strong class="font-medium">Telefon:</strong> 
            <span v-if="contactData.phone">{{ contactData.phone }}</span>
            <span v-else class="text-gray-400 italic">(noch nicht eingetragen)</span>
          </p>
          <p><strong class="font-medium">E-Mail:</strong> 
            <span v-if="contactData.email">{{ contactData.email }}</span>
            <span v-else class="text-gray-400 italic">(noch nicht eingetragen)</span>
          </p>
          <p><strong class="font-medium">Website:</strong> 
            <span v-if="contactData.website">{{ contactData.website }}</span>
            <span v-else class="text-gray-400 italic">(noch nicht eingetragen)</span>
          </p>
        </div>
      </div>

      

      <!-- Bearbeitungsformular -->
      <div v-if="editMode" class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-3">
        <h3 class="font-semibold text-gray-800 dark:text-white mb-3">Impressum-Daten bearbeiten</h3>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name / Betreiber</label>
          <input v-model="editData.name" type="text" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="Max Mustermann">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Straße + Hausnummer</label>
          <input v-model="editData.street" type="text" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="Musterstraße 123">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PLZ + Ort</label>
          <input v-model="editData.city" type="text" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="12345 Musterstadt">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
          <input v-model="editData.phone" type="tel" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="+49 123 456789">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail</label>
          <input v-model="editData.email" type="email" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="info@askly.de">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
          <input v-model="editData.website" type="text" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="https://askly.de">
        </div>
        
        <div class="flex gap-3 pt-2">
          <button @click="saveImpressum" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition">💾 Speichern</button>
          <button @click="resetEditData" class="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg text-sm transition">↺ Zurücksetzen</button>
        </div>
      </div>

      <!-- Haftungsausschluss -->
      <div class="pt-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold mb-1">Haftungsausschluss (Disclaimer)</h3>
        <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
        
        <h3 class="font-semibold mb-1 mt-3">Urheberrecht</h3>
        <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const editMode = ref(false)

const contactData = ref({
  name: '',
  street: '',
  city: '',
  phone: '',
  email: '',
  website: ''
})

const editData = ref({ ...contactData.value })

const loadImpressum = () => {
  const saved = localStorage.getItem('askly-impressum')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      contactData.value = data
      editData.value = { ...data }
    } catch (e) {
      console.error('Fehler beim Laden', e)
    }
  }
}

const saveImpressum = () => {
  contactData.value = { ...editData.value }
  localStorage.setItem('askly-impressum', JSON.stringify(contactData.value))
  editMode.value = false
}

const resetEditData = () => {
  editData.value = { ...contactData.value }
}

onMounted(() => {
  loadImpressum()
})
</script>