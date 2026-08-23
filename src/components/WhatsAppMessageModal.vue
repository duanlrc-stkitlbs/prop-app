<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Contact, Snag, Property } from '../types/property'
import { usePropertyStore } from '../stores/propertyStore'
import { X, Send, Copy, Check, Wrench } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  contact?: Contact | null
  snag?: Snag | null
  property?: Property | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = usePropertyStore()

const resolvedProperty = computed(() => {
  if (props.property) return props.property
  if (props.snag) return store.getPropertyById(props.snag.propertyId)
  if (props.contact?.propertyIds && props.contact.propertyIds.length > 0) {
    return store.getPropertyById(props.contact.propertyIds[0])
  }
  return null
})

const selectedTemplate = ref<'snag' | 'quote' | 'rent' | 'general'>('snag')
const customMessage = ref('')
const copied = ref(false)

function generateMessage(): string {
  const contactName = props.contact?.name || 'there'
  const propName = resolvedProperty.value?.name || 'the property'
  const propAddr = resolvedProperty.value?.address ? ` (${resolvedProperty.value.address})` : ''

  if (props.snag) {
    return `Hi ${contactName}, I need your assistance with a maintenance issue at ${propName}${propAddr}.\n\n*Issue:* ${props.snag.title}\n*Area:* ${props.snag.area}\n*Severity:* ${props.snag.severity}\n${props.snag.notes ? `*Details:* ${props.snag.notes}\n` : ''}\nPlease let me know when you could take a look or provide an estimate. Thanks!`
  }

  if (selectedTemplate.value === 'snag') {
    return `Hi ${contactName}, hope you are well. Could you please let me know your availability for a maintenance job at ${propName}${propAddr}? Thanks!`
  } else if (selectedTemplate.value === 'quote') {
    return `Hi ${contactName}, could you please send through a quote / invoice for the recent work at ${propName}? Thanks!`
  } else if (selectedTemplate.value === 'rent') {
    return `Hi ${contactName}, this is a friendly confirmation regarding the rent/levy payment for ${propName} for this month. Thank you!`
  } else {
    return `Hi ${contactName}, checking in regarding ${propName}${propAddr}.`
  }
}

watch(
  () => [props.show, props.contact, props.snag, selectedTemplate.value],
  () => {
    if (props.show) {
      if (props.snag) {
        selectedTemplate.value = 'snag'
      }
      customMessage.value = generateMessage()
    }
  },
  { immediate: true }
)

const cleanPhone = computed(() => {
  if (!props.contact) return ''
  const p = props.contact.whatsappPhone || props.contact.phone
  return p.replace(/[^0-9]/g, '')
})

const whatsappUrl = computed(() => {
  const phone = cleanPhone.value
  const encoded = encodeURIComponent(customMessage.value)
  return `https://wa.me/${phone}?text=${encoded}`
})

function sendWhatsApp() {
  window.open(whatsappUrl.value, '_blank')
  emit('close')
}

async function copyText() {
  try {
    await navigator.clipboard.writeText(customMessage.value)
    copied.value = true
    store.showToast('Message copied to clipboard', 'success')
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = customMessage.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    store.showToast('Message copied to clipboard', 'success')
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-98"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-98"
    >
      <div
        v-if="show && contact"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white border border-zinc-200 shadow-2xl p-6 space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-zinc-950">WhatsApp Message</h3>
              <p class="text-xs text-zinc-500">Recipient: <strong class="text-zinc-900">{{ contact.name }}</strong> ({{ contact.phone }})</p>
            </div>
            <button
              @click="emit('close')"
              class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Quick Templates -->
          <div v-if="!snag" class="flex gap-2 overflow-x-auto pb-1">
            <button
              @click="selectedTemplate = 'snag'"
              class="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border"
              :class="selectedTemplate === 'snag' ? 'bg-zinc-950 text-white border-zinc-950 font-semibold' : 'bg-zinc-50 text-zinc-700 border-zinc-200'"
            >
              Service Booking
            </button>
            <button
              @click="selectedTemplate = 'quote'"
              class="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border"
              :class="selectedTemplate === 'quote' ? 'bg-zinc-950 text-white border-zinc-950 font-semibold' : 'bg-zinc-50 text-zinc-700 border-zinc-200'"
            >
              Quote Request
            </button>
            <button
              @click="selectedTemplate = 'rent'"
              class="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border"
              :class="selectedTemplate === 'rent' ? 'bg-zinc-950 text-white border-zinc-950 font-semibold' : 'bg-zinc-50 text-zinc-700 border-zinc-200'"
            >
              Rent / Levy Check
            </button>
          </div>

          <!-- Snag info box if attached -->
          <div v-if="snag" class="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
            <div class="flex items-center gap-1.5 text-zinc-800 font-medium">
              <Wrench class="w-3.5 h-3.5 text-zinc-600" />
              <span>Attached Task: {{ snag.title }}</span>
            </div>
            <div class="text-zinc-500">Area: {{ snag.area }} • Severity: {{ snag.severity }}</div>
          </div>

          <!-- Message Textarea -->
          <div class="space-y-1.5">
            <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Message Content
            </label>
            <textarea
              v-model="customMessage"
              rows="6"
              class="w-full px-3.5 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900 resize-none font-sans"
              placeholder="Type message..."
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button
              @click="copyText"
              class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs border border-zinc-200 transition-all active:scale-98"
            >
              <Check v-if="copied" class="w-4 h-4 text-zinc-950" />
              <Copy v-else class="w-4 h-4 text-zinc-600" />
              <span>{{ copied ? 'Copied' : 'Copy Text' }}</span>
            </button>

            <button
              @click="sendWhatsApp"
              class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition-all active:scale-98"
            >
              <Send class="w-4 h-4" />
              <span>Open WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
