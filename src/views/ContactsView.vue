<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import type { Contact, ContactRole } from '../types/property'
import ContactCard from '../components/ContactCard.vue'
import ContactModal from '../components/modals/ContactModal.vue'
import WhatsAppMessageModal from '../components/WhatsAppMessageModal.vue'
import {
  Search,
  Plus
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

  return list.slice().sort((a, b) => {
    if (a.isEmergencyContact && !b.isEmergencyContact) return -1
    if (!a.isEmergencyContact && b.isEmergencyContact) return 1
    return a.name.localeCompare(b.name)
  })
})
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
          Service Directory & Contacts
        </h1>
        <p class="text-xs sm:text-sm text-zinc-500">
          Contractors, plumbers, electricians, handymen & emergency numbers
        </p>
      </div>

      <button
        @click="openNewContactModal"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-98 shrink-0 self-start sm:self-center"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Contact</span>
      </button>
    </div>

    <!-- Search & Filter Controls -->
    <div class="space-y-3">
      <!-- Search Input -->
      <div class="relative">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search contacts by name, company, trade, or phone..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:border-zinc-900 shadow-xs"
        />
      </div>

      <!-- Role Filter Chips -->
      <div class="flex gap-1.5 overflow-x-auto pb-1">
        <button
          v-for="role in roles"
          :key="role"
          @click="selectedRole = role"
          class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shadow-xs"
          :class="[
            selectedRole === role
              ? (role === 'Emergency' ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold' : 'bg-zinc-900 text-white border-zinc-900 font-semibold')
              : 'bg-white text-zinc-700 border-zinc-200/90 hover:bg-zinc-50 hover:text-zinc-950'
          ]"
        >
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
      class="p-12 rounded-2xl bg-white border border-zinc-200/80 text-center max-w-md mx-auto shadow-xs"
    >
      <h3 class="text-sm font-semibold text-zinc-800">No Contacts Found</h3>
      <p class="text-xs text-zinc-500 mt-1">Try adjusting your search query or filter.</p>
      <button
        @click="searchQuery = ''; selectedRole = 'All'"
        class="mt-4 px-3.5 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 text-xs font-medium hover:bg-zinc-200"
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
