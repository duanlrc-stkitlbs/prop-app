<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import type { Snag, Contact } from '../types/property'
import SpendSummaryCard from '../components/SpendSummaryCard.vue'
import SnagCard from '../components/SnagCard.vue'
import PropertyCard from '../components/PropertyCard.vue'
import KeyDetailBadge from '../components/KeyDetailBadge.vue'
import WhatsAppMessageModal from '../components/WhatsAppMessageModal.vue'
import ExpenseModal from '../components/modals/ExpenseModal.vue'
import SnagModal from '../components/modals/SnagModal.vue'
import PropertyModal from '../components/modals/PropertyModal.vue'
import ContactModal from '../components/modals/ContactModal.vue'
import VaultModal from '../components/modals/VaultModal.vue'
import NoteModal from '../components/modals/NoteModal.vue'
import {
  Wrench,
  Receipt,
  Plus,
  ArrowRight
} from 'lucide-vue-next'

const store = usePropertyStore()

const snagFilter = ref<'all' | 'urgent' | 'open' | 'resolved'>('urgent')
const searchQuery = ref('')

// Modals
const showExpenseModal = ref(false)
const showSnagModal = ref(false)
const showPropertyModal = ref(false)
const showContactModal = ref(false)
const showVaultModal = ref(false)
const showNoteModal = ref(false)

const activeSnagForEdit = ref<Snag | null>(null)
const activeContactForEdit = ref<Contact | null>(null)

// WhatsApp modal state
const showWhatsAppModal = ref(false)
const whatsAppContact = ref<Contact | null>(null)
const whatsAppSnag = ref<Snag | null>(null)

function openWhatsAppForSnag(payload: { contactId: string; snag: Snag }) {
  const c = store.getContactById(payload.contactId)
  if (c) {
    whatsAppContact.value = c
    whatsAppSnag.value = payload.snag
    showWhatsAppModal.value = true
  }
}

function handleEditSnag(snag: Snag) {
  activeSnagForEdit.value = snag
  showSnagModal.value = true
}

function openNewSnagModal() {
  activeSnagForEdit.value = null
  showSnagModal.value = true
}

function openNewExpenseModal() {
  showExpenseModal.value = true
}

function openNewPropertyModal() {
  showPropertyModal.value = true
}

// Filtered Snags
const filteredSnags = computed(() => {
  let list = store.snags
  if (snagFilter.value === 'urgent') {
    list = list.filter(s => s.severity === 'Urgent' && s.status !== 'Resolved')
  } else if (snagFilter.value === 'open') {
    list = list.filter(s => s.status !== 'Resolved')
  } else if (snagFilter.value === 'resolved') {
    list = list.filter(s => s.status === 'Resolved')
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      (s.notes && s.notes.toLowerCase().includes(q))
    )
  }

  return list
})

// Filtered Properties
const filteredProperties = computed(() => {
  if (!searchQuery.value.trim()) return store.properties
  const q = searchQuery.value.toLowerCase()
  return store.properties.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.address.toLowerCase().includes(q) ||
    (p.nickname && p.nickname.toLowerCase().includes(q))
  )
})

// Priority Vault Items
const priorityVaultItems = computed(() => {
  return store.vault.slice(0, 3)
})
</script>

<template>
  <div class="space-y-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
          Portfolio Overview
        </h1>
        <p class="text-xs sm:text-sm text-zinc-500">
          {{ store.properties.length }} managed properties, committed monthly spend & active maintenance.
        </p>
      </div>

      <!-- Quick Action Buttons on Desktop -->
      <div class="hidden sm:flex items-center gap-2.5">
        <button
          @click="openNewSnagModal"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium transition-all active:scale-98 shadow-xs"
        >
          <Wrench class="w-3.5 h-3.5 text-zinc-600" />
          <span>Log Snag</span>
        </button>

        <button
          @click="openNewExpenseModal"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium transition-all active:scale-98 shadow-xs"
        >
          <Receipt class="w-3.5 h-3.5 text-zinc-600" />
          <span>Add Expense</span>
        </button>

        <button
          @click="openNewPropertyModal"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-98"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>New Property</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Metric Strip -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
        <div class="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Properties</div>
        <div class="text-2xl font-semibold text-zinc-950 font-mono mt-1">{{ store.properties.length }}</div>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
        <div class="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Monthly Committed</div>
        <div class="text-2xl font-semibold text-zinc-950 font-mono mt-1 truncate">{{ store.formatCurrency(store.totalMonthlySpend) }}</div>
      </div>

      <div class="p-5 rounded-2xl bg-white border shadow-xs" :class="store.urgentSnags.length > 0 ? 'border-zinc-950 ring-1 ring-zinc-950/10' : 'border-zinc-200'">
        <div class="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Urgent Tasks</div>
        <div class="text-2xl font-semibold text-zinc-950 font-mono mt-1 flex items-baseline gap-2">
          <span>{{ store.urgentSnags.length }}</span>
          <span v-if="store.openSnags.length > 0" class="text-xs font-normal text-zinc-500 font-sans">
            ({{ store.openSnags.length }} total open)
          </span>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
        <div class="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Directory Contacts</div>
        <div class="text-2xl font-semibold text-zinc-950 font-mono mt-1">{{ store.contacts.length }}</div>
      </div>
    </div>

    <!-- Monthly Spend Summary Card -->
    <SpendSummaryCard />

    <!-- SECTION: Snags & Tasks -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-zinc-950 tracking-tight">Maintenance & Snags</h2>
          <p class="text-xs text-zinc-500">1-click task resolution, trade contact shortcuts</p>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 p-1 rounded-xl bg-zinc-100/90 border border-zinc-200 text-xs overflow-x-auto">
          <button
            @click="snagFilter = 'urgent'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all"
            :class="snagFilter === 'urgent' ? 'bg-white text-zinc-950 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-950'"
          >
            <span>Urgent</span>
            <span
              v-if="store.urgentSnags.length > 0"
              class="px-1.5 py-0.2 text-[10px] font-mono rounded bg-zinc-200 text-zinc-900 font-semibold"
            >
              {{ store.urgentSnags.length }}
            </span>
          </button>

          <button
            @click="snagFilter = 'open'"
            class="px-3 py-1.5 rounded-lg font-medium transition-all"
            :class="snagFilter === 'open' ? 'bg-white text-zinc-950 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-950'"
          >
            Open ({{ store.openSnags.length }})
          </button>

          <button
            @click="snagFilter = 'resolved'"
            class="px-3 py-1.5 rounded-lg font-medium transition-all"
            :class="snagFilter === 'resolved' ? 'bg-white text-zinc-950 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-950'"
          >
            Resolved ({{ store.resolvedSnags.length }})
          </button>

          <button
            @click="snagFilter = 'all'"
            class="px-3 py-1.5 rounded-lg font-medium transition-all"
            :class="snagFilter === 'all' ? 'bg-white text-zinc-950 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-950'"
          >
            All ({{ store.snags.length }})
          </button>
        </div>
      </div>

      <!-- Snags Grid -->
      <div v-if="filteredSnags.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SnagCard
          v-for="snag in filteredSnags"
          :key="snag.id"
          :snag="snag"
          :show-property-badge="true"
          @edit="handleEditSnag"
          @contact-whatsapp="openWhatsAppForSnag"
        />
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-zinc-200 text-center shadow-xs"
      >
        <h4 class="text-sm font-semibold text-zinc-700">No tasks match this filter</h4>
        <p class="text-xs text-zinc-500 mt-1">Everything in this category is clear.</p>
      </div>
    </div>

    <!-- SECTION: Managed Properties -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-950 tracking-tight">Properties</h2>
          <p class="text-xs text-zinc-500">Select any property to view expenses, vault codes, and history</p>
        </div>

        <button
          @click="openNewPropertyModal"
          class="sm:hidden flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-950 text-white text-xs font-semibold"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PropertyCard
          v-for="prop in filteredProperties"
          :key="prop.id"
          :property="prop"
        />
      </div>
    </div>

    <!-- SECTION: Key Details Vault Preview -->
    <div class="space-y-4 pt-2">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-950 tracking-tight">Key Details & Meter Vault</h2>
          <p class="text-xs text-zinc-500">Prepaid meters, gate PINs & Wi-Fi keys with 1-tap copy</p>
        </div>

        <RouterLink
          to="/vault"
          class="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <span>View all ({{ store.vault.length }})</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KeyDetailBadge
          v-for="item in priorityVaultItems"
          :key="item.id"
          :item="item"
          :property-name="store.getPropertyById(item.propertyId)?.nickname || store.getPropertyById(item.propertyId)?.name"
          :show-property-badge="true"
        />
      </div>
    </div>

    <!-- Modals -->
    <ExpenseModal :show="showExpenseModal" @close="showExpenseModal = false" />
    <SnagModal :show="showSnagModal" :snag="activeSnagForEdit" @close="showSnagModal = false" />
    <PropertyModal :show="showPropertyModal" @close="showPropertyModal = false" />
    <ContactModal :show="showContactModal" :contact="activeContactForEdit" @close="showContactModal = false" />
    <VaultModal :show="showVaultModal" @close="showVaultModal = false" />
    <NoteModal :show="showNoteModal" @close="showNoteModal = false" />
    <WhatsAppMessageModal
      :show="showWhatsAppModal"
      :contact="whatsAppContact"
      :snag="whatsAppSnag"
      @close="showWhatsAppModal = false"
    />
  </div>
</template>
