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
  Building2,
  Wrench,
  Receipt,
  Users,
  KeyRound,
  Plus,
  AlertTriangle,
  CheckCircle2,
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

// Top Vault Items (Quick meter & code reference on dashboard)
const priorityVaultItems = computed(() => {
  return store.vault.slice(0, 3)
})
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Top Hero Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Property Command Hub
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
          Overview of {{ store.properties.length }} managed properties, committed monthly spend & active repairs.
        </p>
      </div>

      <!-- Quick Action Buttons on Desktop -->
      <div class="hidden sm:flex items-center gap-2">
        <button
          @click="openNewSnagModal"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all active:scale-95"
        >
          <Wrench class="w-4 h-4" />
          <span>Log Snag</span>
        </button>

        <button
          @click="openNewExpenseModal"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all active:scale-95"
        >
          <Receipt class="w-4 h-4" />
          <span>Add Expense</span>
        </button>

        <button
          @click="openNewPropertyModal"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>New Property</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Metric Strip -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center gap-3.5">
        <div class="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
          <Building2 class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Properties</div>
          <div class="text-xl font-extrabold text-white font-mono">{{ store.properties.length }}</div>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center gap-3.5">
        <div class="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
          <Receipt class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monthly Spend</div>
          <div class="text-xl font-extrabold text-white font-mono truncate">{{ store.formatCurrency(store.totalMonthlySpend) }}</div>
        </div>
      </div>

      <div
        class="p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 transition-all"
        :class="store.urgentSnags.length > 0 ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' : 'bg-slate-900/80 border-slate-800'"
      >
        <div
          class="p-2.5 rounded-xl shrink-0"
          :class="store.urgentSnags.length > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'"
        >
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-semibold uppercase tracking-wider opacity-80">Urgent Snags</div>
          <div class="text-xl font-extrabold font-mono flex items-center gap-2">
            <span>{{ store.urgentSnags.length }}</span>
            <span v-if="store.openSnags.length > 0" class="text-xs font-normal opacity-60 font-sans">
              ({{ store.openSnags.length }} total open)
            </span>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center gap-3.5">
        <div class="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 shrink-0">
          <Users class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contacts</div>
          <div class="text-xl font-extrabold text-white font-mono">{{ store.contacts.length }}</div>
        </div>
      </div>
    </div>

    <!-- Monthly Spend Summary Card -->
    <SpendSummaryCard />

    <!-- SECTION: Snags & Maintenance Priority Tasks -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Wrench class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-white tracking-tight">Snag List & Maintenance</h2>
            <p class="text-xs text-slate-400">1-click resolve, severity tags & contractor direct dial</p>
          </div>
        </div>

        <!-- Snag Filter Tabs -->
        <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs overflow-x-auto">
          <button
            @click="snagFilter = 'urgent'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all"
            :class="snagFilter === 'urgent' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          >
            <span>Urgent</span>
            <span
              v-if="store.urgentSnags.length > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
              :class="snagFilter === 'urgent' ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'"
            >
              {{ store.urgentSnags.length }}
            </span>
          </button>

          <button
            @click="snagFilter = 'open'"
            class="px-3 py-1.5 rounded-xl font-semibold transition-all"
            :class="snagFilter === 'open' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          >
            Open ({{ store.openSnags.length }})
          </button>

          <button
            @click="snagFilter = 'resolved'"
            class="px-3 py-1.5 rounded-xl font-semibold transition-all"
            :class="snagFilter === 'resolved' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          >
            Resolved ({{ store.resolvedSnags.length }})
          </button>

          <button
            @click="snagFilter = 'all'"
            class="px-3 py-1.5 rounded-xl font-semibold transition-all"
            :class="snagFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'"
          >
            All ({{ store.snags.length }})
          </button>
        </div>
      </div>

      <!-- Snag Cards Grid -->
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
        class="flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 text-center"
      >
        <div class="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-2">
          <CheckCircle2 class="w-6 h-6" />
        </div>
        <h4 class="text-sm font-bold text-slate-200">No snags match this filter</h4>
        <p class="text-xs text-slate-400 mt-1">Great news! Everything in this category is currently in order.</p>
        <button
          @click="openNewSnagModal"
          class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Log New Snag</span>
        </button>
      </div>
    </div>

    <!-- SECTION: Managed Properties Portfolio -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-white tracking-tight">Properties Portfolio</h2>
            <p class="text-xs text-slate-400">Click any property to open full expenses, vault & maintenance hub</p>
          </div>
        </div>

        <button
          @click="openNewPropertyModal"
          class="sm:hidden flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
        >
          <Plus class="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      <!-- Properties Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PropertyCard
          v-for="prop in filteredProperties"
          :key="prop.id"
          :property="prop"
        />
      </div>
    </div>

    <!-- SECTION: Quick Key Vault & Access Codes Preview -->
    <div class="space-y-4 pt-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <KeyRound class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-white tracking-tight">Key Details & Meter Vault</h2>
            <p class="text-xs text-slate-400">1-tap copy electricity meters, gate codes & Wi-Fi keys</p>
          </div>
        </div>

        <RouterLink
          to="/vault"
          class="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>View all {{ store.vault.length }} codes</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
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
