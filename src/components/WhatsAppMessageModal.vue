<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Contact, Snag, Property } from '../types/property'
import { usePropertyStore } from '../stores/propertyStore'
import { MessageCircle, X, Send, Copy, Check, Wrench } from 'lucide-vue-next'

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
    // fallback
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
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show && contact"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MessageCircle class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-white">WhatsApp Quick Message</h3>
                <p class="text-xs text-slate-400">To: <strong class="text-slate-200">{{ contact.name }}</strong> ({{ contact.phone }})</p>
              </div>
            </div>
            <button
              @click="emit('close')"
              class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Quick Templates (if no specific snag is bound) -->
          <div v-if="!snag" class="flex gap-2 overflow-x-auto pb-1">
            <button
              @click="selectedTemplate = 'snag'"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border"
              :class="selectedTemplate === 'snag' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'"
            >
              Service Booking
            </button>
            <button
              @click="selectedTemplate = 'quote'"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border"
              :class="selectedTemplate === 'quote' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'"
            >
              Quote Request
            </button>
            <button
              @click="selectedTemplate = 'rent'"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border"
              :class="selectedTemplate === 'rent' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'"
            >
              Rent / Levy Check
            </button>
          </div>

          <!-- Snag info box if attached -->
          <div v-if="snag" class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <div class="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Wrench class="w-3.5 h-3.5" />
              <span>Attached Snag: {{ snag.title }}</span>
            </div>
            <div class="text-slate-400">Area: {{ snag.area }} • Severity: {{ snag.severity }}</div>
          </div>

          <!-- Message Textarea -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Message Content
            </label>
            <textarea
              v-model="customMessage"
              rows="6"
              class="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none font-sans"
              placeholder="Type message..."
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button
              @click="copyText"
              class="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all active:scale-98"
            >
              <Check v-if="copied" class="w-4 h-4 text-emerald-400" />
              <Copy v-else class="w-4 h-4" />
              <span>{{ copied ? 'Copied' : 'Copy Text' }}</span>
            </button>

            <button
              @click="sendWhatsApp"
              class="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
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
