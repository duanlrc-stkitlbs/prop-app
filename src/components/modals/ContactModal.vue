<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Contact, ContactRole } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X, UserPlus, Star, ShieldAlert } from 'lucide-vue-next'

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
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:scale-95"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <UserPlus class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-white">
                  {{ contact ? 'Edit Contact' : 'Add New Contact' }}
                </h3>
                <p class="text-xs text-slate-400">Plumbers, electricians, tenants, managing agents</p>
              </div>
            </div>
            <button
              @click="emit('close')"
              class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Name & Role -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g. Johan van der Merwe"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Role / Trade</label>
                <select
                  v-model="form.role"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
            </div>

            <!-- Company / Business Name -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Company / Business (Optional)</label>
              <input
                v-model="form.company"
                type="text"
                placeholder="e.g. Vanguard Plumbing, SparkGuard Electrical"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <!-- Phone & WhatsApp Phone -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Primary Phone (Dial)</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  placeholder="e.g. +27825551201"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">WhatsApp Number</label>
                <input
                  v-model="form.whatsappPhone"
                  type="tel"
                  placeholder="e.g. 27825551201"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="e.g. contact@domain.com"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <!-- Emergency Priority Toggle -->
            <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div class="flex items-center gap-2.5">
                <div class="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <ShieldAlert class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-200">24/7 Emergency Priority?</div>
                  <div class="text-[11px] text-slate-400">Pin to top of emergency contact list</div>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="form.isEmergencyContact" type="checkbox" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <!-- Rating Stars -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Trust / Reliability Rating</label>
              <div class="flex items-center gap-2">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  @click="form.rating = star"
                  class="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Star
                    class="w-6 h-6 transition-transform hover:scale-110 active:scale-95"
                    :class="star <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'"
                  />
                </button>
                <span class="text-xs text-slate-400 font-medium ml-2">{{ form.rating }} / 5 Stars</span>
              </div>
            </div>

            <!-- Assigned Properties -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Properties</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in store.properties"
                  :key="p.id"
                  type="button"
                  @click="togglePropertySelection(p.id)"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                  :class="form.propertyIds.includes(p.id) ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'"
                >
                  {{ p.nickname || p.name }}
                </button>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Notes & Work History</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="Specialties, hourly rates, key contacts..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-3">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-98"
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
