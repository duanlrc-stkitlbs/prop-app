<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import type { Contact, ContactRole } from '../types/property'
import ContactCard from '../components/ContactCard.vue'
import ContactModal from '../components/modals/ContactModal.vue'
import WhatsAppMessageModal from '../components/WhatsAppMessageModal.vue'
import {
  Users,
  Search,
  Plus,
  ShieldAlert
} from 'lucide-vue-next'

const store = usePropertyStore()

const searchQuery = ref('')
const selectedRole = ref<string>('All')

const roles: (ContactRole | 'All' | 'Emergency')[] = [
  'All',
  'Emergency',
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
  'Insurance Broker'
]

const showContactModal = ref(false)
const activeContactForEdit = ref<Contact | null>(null)

// WhatsApp modal
const showWhatsAppModal = ref(false)
const whatsAppContact = ref<Contact | null>(null)

function openWhatsApp(contact: Contact) {
  whatsAppContact.value = contact
  showWhatsAppModal.value = true
}

function handleEditContact(contact: Contact) {
  activeContactForEdit.value = contact
  showContactModal.value = true
}

function openNewContactModal() {
  activeContactForEdit.value = null
  showContactModal.value = true
}

const filteredContacts = computed(() => {
  let list = store.contacts

  if (selectedRole.value === 'Emergency') {
    list = list.filter(c => c.isEmergencyContact)
  } else if (selectedRole.value !== 'All') {
    list = list.filter(c => c.role === selectedRole.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    )
  }

  // Sort emergency contacts to the top
  return list.slice().sort((a, b) => {
    if (a.isEmergencyContact && !b.isEmergencyContact) return -1
    if (!a.isEmergencyContact && b.isEmergencyContact) return 1
    return a.name.localeCompare(b.name)
  })
})
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <Users class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Service Directory & Contacts
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
            Plumbers, electricians, handymen, tenants & emergency dispatch
          </p>
        </div>
      </div>

      <button
        @click="openNewContactModal"
        class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95 shrink-0"
      >
        <Plus class="w-4 h-4" />
        <span>Add Contact</span>
      </button>
    </div>

    <!-- Search & Filter Controls -->
    <div class="space-y-3">
      <!-- Search Input -->
      <div class="relative">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, company, trade, or phone number..."
          class="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
        />
      </div>

      <!-- Role Filter Chips -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="role in roles"
          :key="role"
          @click="selectedRole = role"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border"
          :class="[
            selectedRole === role
              ? 'bg-blue-600 text-white border-blue-500 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          ]"
        >
          <ShieldAlert v-if="role === 'Emergency'" class="w-3.5 h-3.5 text-rose-400" />
          <span>{{ role }}</span>
        </button>
      </div>
    </div>

    <!-- Contacts Grid -->
    <div v-if="filteredContacts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ContactCard
        v-for="contact in filteredContacts"
        :key="contact.id"
        :contact="contact"
        @edit="handleEditContact"
        @open-whatsapp="openWhatsApp"
      />
    </div>

    <div
      v-else
      class="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center max-w-md mx-auto"
    >
      <Users class="w-10 h-10 text-slate-500 mx-auto mb-3" />
      <h3 class="text-base font-bold text-slate-200">No Contacts Found</h3>
      <p class="text-xs text-slate-400 mt-1">Try adjusting your search query or role filter.</p>
      <button
        @click="searchQuery = ''; selectedRole = 'All'"
        class="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
      >
        Clear Filters
      </button>
    </div>

    <!-- Modals -->
    <ContactModal
      :show="showContactModal"
      :contact="activeContactForEdit"
      @close="showContactModal = false"
    />
    <WhatsAppMessageModal
      :show="showWhatsAppModal"
      :contact="whatsAppContact"
      @close="showWhatsAppModal = false"
    />
  </div>
</template>
