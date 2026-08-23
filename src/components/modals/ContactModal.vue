<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Contact, ContactRole } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X, Star } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  contact?: Contact | null
  defaultPropertyId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = usePropertyStore()

const roles: ContactRole[] = [
  'Plumber',
  'Electrician',
  'Handyman',
  'Tenant',
  'Body Corporate',
  'Security',
  'Gardener & Landscaper',
  'Appliance Repair',
  'Locksmith',
  'Painter',
  'Insurance Broker',
  'Property Manager',
  'Other'
]

const form = ref({
  name: '',
  role: 'Plumber' as ContactRole,
  company: '',
  phone: '',
  whatsappPhone: '',
  email: '',
  rating: 5,
  isEmergencyContact: false,
  propertyIds: [] as string[],
  notes: ''
})

watch(
  () => [props.show, props.contact, props.defaultPropertyId],
  () => {
    if (props.show) {
      if (props.contact) {
        form.value = {
          name: props.contact.name,
          role: props.contact.role,
          company: props.contact.company || '',
          phone: props.contact.phone,
          whatsappPhone: props.contact.whatsappPhone || props.contact.phone,
          email: props.contact.email || '',
          rating: props.contact.rating || 5,
          isEmergencyContact: !!props.contact.isEmergencyContact,
          propertyIds: props.contact.propertyIds ? [...props.contact.propertyIds] : [],
          notes: props.contact.notes || ''
        }
      } else {
        form.value = {
          name: '',
          role: 'Plumber',
          company: '',
          phone: '',
          whatsappPhone: '',
          email: '',
          rating: 5,
          isEmergencyContact: false,
          propertyIds: props.defaultPropertyId ? [props.defaultPropertyId] : [],
          notes: ''
        }
      }
    }
  },
  { immediate: true }
)

function togglePropertySelection(propertyId: string) {
  const idx = form.value.propertyIds.indexOf(propertyId)
  if (idx > -1) {
    form.value.propertyIds.splice(idx, 1)
  } else {
    form.value.propertyIds.push(propertyId)
  }
}

function submit() {
  if (!form.value.name.trim()) {
    store.showToast('Please enter contact name', 'warning')
    return
  }
  if (!form.value.phone.trim()) {
    store.showToast('Please enter phone number', 'warning')
    return
  }

  if (props.contact) {
    store.updateContact(props.contact.id, { ...form.value })
  } else {
    store.addContact({ ...form.value })
  }
  emit('close')
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
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white border border-zinc-200 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-zinc-950">
                {{ contact ? 'Edit Contact' : 'Add New Contact' }}
              </h3>
              <p class="text-xs text-zinc-500">Plumbers, electricians, tenants, managing agents</p>
            </div>
            <button
              @click="emit('close')"
              class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Name & Role -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Full Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g. Johan van der Merwe"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Role / Trade</label>
                <select
                  v-model="form.role"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-sm focus:outline-none focus:border-zinc-900"
                >
                  <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
            </div>

            <!-- Company -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Company (Optional)</label>
              <input
                v-model="form.company"
                type="text"
                placeholder="e.g. Vanguard Plumbing"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900"
              />
            </div>

            <!-- Phone & WhatsApp Phone -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Primary Phone</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  placeholder="e.g. +27825551201"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900 font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">WhatsApp Number</label>
                <input
                  v-model="form.whatsappPhone"
                  type="tel"
                  placeholder="e.g. 27825551201"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900 font-mono"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="e.g. contact@domain.com"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900"
              />
            </div>

            <!-- 24/7 Priority Toggle -->
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div>
                <div class="text-xs font-medium text-zinc-900">24/7 Priority Emergency Contact?</div>
                <div class="text-[11px] text-zinc-500">Pins to top of directory</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="form.isEmergencyContact" type="checkbox" class="sr-only peer" />
                <div class="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-950"></div>
              </label>
            </div>

            <!-- Rating Stars -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Reliability Rating</label>
              <div class="flex items-center gap-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  @click="form.rating = star"
                  class="p-1 rounded hover:bg-zinc-100 transition-colors"
                >
                  <Star
                    class="w-5 h-5 transition-transform active:scale-95"
                    :class="star <= form.rating ? 'fill-zinc-900 text-zinc-900' : 'text-zinc-300'"
                  />
                </button>
                <span class="text-xs text-zinc-500 font-medium ml-2">{{ form.rating }} / 5 Stars</span>
              </div>
            </div>

            <!-- Assigned Properties -->
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Assigned Properties</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="p in store.properties"
                  :key="p.id"
                  type="button"
                  @click="togglePropertySelection(p.id)"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  :class="form.propertyIds.includes(p.id) ? 'bg-zinc-950 text-white border-zinc-950 font-semibold' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'"
                >
                  {{ p.nickname || p.name }}
                </button>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Notes</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="Specialties, rates..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900 resize-none"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-sm transition-all active:scale-98 shadow-sm"
              >
                {{ contact ? 'Update Contact' : 'Save Contact' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
