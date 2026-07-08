<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  visible: Boolean,
  sessionCode: String,
  sessionUrl: String
})

const emit = defineEmits([
  'update:visible'
])

const qrCodeUrl = ref('')
const close = () => emit('update:visible', false)

const generateQR = async () => {
  if (!props.sessionUrl) return
  try {
    qrCodeUrl.value = await QRCode.toDataURL(props.sessionUrl, { width: 250, margin: 2 })
  } catch (err) {
    console.error('QR generation failed', err)
  }
}

const downloadQR = () => {
  if (!qrCodeUrl.value) return
  const link = document.createElement('a')
  link.download = `askly-session-${props.sessionCode}.png`
  link.href = qrCodeUrl.value
  link.click()
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.sessionUrl) generateQR()
})
</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="close">
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center max-w-sm w-full">
      <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">QR-Code für diese Session</h3>
      <img v-if="qrCodeUrl" :src="qrCodeUrl" class="mx-auto border rounded-xl p-2 bg-white" style="width: 200px;" />
      <div v-else class="w-48 h-48 mx-auto flex items-center justify-center text-gray-500 dark:text-gray-400">Generiere...</div>
      <div class="flex gap-3 mt-6">
        <button @click="downloadQR" class="flex-1 bg-blue-600 text-white py-2 rounded-xl">Herunterladen</button>
        <button @click="close" class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-xl">Schließen</button>
      </div>
    </div>
  </div>
</template>