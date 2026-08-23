<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertyStore } from '../stores/propertyStore'
import type { Expense, Snag, Contact, VaultItem, PropertyNote } from '../types/property'
import SpendSummaryCard from '../components/SpendSummaryCard.vue'
import KeyDetailBadge from '../components/KeyDetailBadge.vue'
import SnagCard from '../components/SnagCard.vue'
import ContactCard from '../components/ContactCard.vue'
import WhatsAppMessageModal from '../components/WhatsAppMessageModal.vue'
import ExpenseModal from '../components/modals/ExpenseModal.vue'
import SnagModal from '../components/modals/SnagModal.vue'
import PropertyModal from '../components/modals/PropertyModal.vue'
import ContactModal from '../components/modals/ContactModal.vue'
import VaultModal from '../components/modals/VaultModal.vue'
import NoteModal from '../components/modals/NoteModal.vue'
import {
  ArrowLeft,
  MapPin,
  KeyRound,
  Receipt,
  Wrench,
  Users,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Layers
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = usePropertyStore()

const propertyId = computed(() => route.params.id as string)
const property = computed(() => store.getPropertyById(propertyId.value))

// Tabs
type ActiveTab = 'overview' | 'expenses' | 'snags' | 'contacts' | 'notes'
const activeTab = ref<ActiveTab>('overview')

// Modals
const showPropertyModal = ref(false)
const showExpenseModal = ref(false)
const showSnagModal = ref(false)
const showContactModal = ref(false)
const showVaultModal = ref(false)
const showNoteModal = ref(false)

const activeExpense = ref<Expense | null>(null)
const activeSnag = ref<Snag | null>(null)
const activeContact = ref<Contact | null>(null)
const activeVault = ref<VaultItem | null>(null)
const activeNote = ref<PropertyNote | null>(null)

// WhatsApp modal
const showWhatsAppModal = ref(false)
const whatsAppContact = ref<Contact | null>(null)
const whatsAppSnag = ref<Snag | null>(null)

// Property data slices
const propertyExpenses = computed(() => store.getExpensesByProperty(propertyId.value))
const propertySnags = computed(() => store.getSnagsByProperty(propertyId.value))
const propertyOpenSnags = computed(() => store.getOpenSnagsByProperty(propertyId.value))
const propertyVault = computed(() => store.getVaultByProperty(propertyId.value))
const propertyNotes = computed(() => store.getNotesByProperty(propertyId.value))
const propertyContacts = computed(() => store.getContactsByProperty(propertyId.value))

function openWhatsAppForSnag(payload: { contactId: string; snag: Snag }) {
  const c = store.getContactById(payload.contactId)
  if (c) {
    whatsAppContact.value = c
    whatsAppSnag.value = payload.snag
    showWhatsAppModal.value = true
  }
}

function openWhatsAppForContact(contact: Contact) {
  whatsAppContact.value = contact
  whatsAppSnag.value = null
  showWhatsAppModal.value = true
}

function confirmDeleteProperty() {
  if (!property.value) return
  if (confirm(`Are you sure you want to delete "${property.value.name}" and all associated records?`)) {
    store.deleteProperty(propertyId.value)
    router.push('/')
  }
}
</script>

<template>
  <div v-if="property" class="space-y-8 max-w-7xl mx-auto px-6 lg:px-8 py-8">
    <!-- Back Button & Actions -->
    <div class="flex items-center justify-between gap-4">
      <button
        @click="router.push('/')"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 text-xs font-medium transition-colors shadow-xs"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Portfolio</span>
      </button>

      <div class="flex items-center gap-2">
        <button
          @click="showPropertyModal = true"
          class="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shadow-xs"
          title="Edit Property Info"
        >
          <Edit2 class="w-4 h-4" />
        </button>
        <button
          @click="confirmDeleteProperty"
          class="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shadow-xs"
          title="Delete Property"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Main Property Info Card -->
    <div class="rounded-2xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-xs">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="space-y-3">
          <!-- Type and Status -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-medium px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              {{ property.type }}
            </span>
            <span class="text-xs font-medium px-2.5 py-0.5 rounded bg-zinc-50 text-zinc-600 border border-zinc-200">
              {{ property.status }}
            </span>
            <span v-if="property.rentalIncome" class="text-xs font-mono font-medium px-2.5 py-0.5 rounded bg-zinc-50 text-zinc-700 border border-zinc-200">
              Income: {{ store.formatCurrency(property.rentalIncome) }}/mo
            </span>
          </div>

          <!-- Name & Address -->
          <div>
            <h1 class="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
              {{ property.name }}
            </h1>
            <p class="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 mt-1">
              <MapPin class="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{{ property.address }}</span>
            </p>
          </div>

          <!-- Units Badges -->
          <div v-if="property.units && property.units.length > 0" class="flex items-center gap-1.5 flex-wrap pt-1">
            <span class="text-xs text-zinc-500 font-medium flex items-center gap-1">
              <Layers class="w-3.5 h-3.5" /> Units:
            </span>
            <span
              v-for="(u, idx) in property.units"
              :key="idx"
              class="text-xs px-2.5 py-0.5 rounded bg-zinc-50 text-zinc-800 border border-zinc-200"
            >
              {{ u }}
            </span>
          </div>
        </div>

        <!-- Right Metric Strip -->
        <div class="flex items-center gap-3 shrink-0">
          <div class="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80 text-center min-w-[130px]">
            <div class="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Monthly Spend</div>
            <div class="text-base font-semibold text-zinc-950 font-mono mt-0.5">
              {{ store.formatCurrency(store.getPropertyMonthlySpend(property.id)) }}
            </div>
          </div>

          <div
            class="p-4 rounded-xl border text-center min-w-[130px]"
            :class="propertyOpenSnags.length > 0 ? 'border-rose-200/80 bg-rose-50/10' : 'bg-zinc-50/80 border-zinc-200/80'"
          >
            <div class="text-[10px] uppercase font-medium text-zinc-500 tracking-wider">Open Tasks</div>
            <div
              class="text-base font-semibold font-mono mt-0.5"
              :class="propertyOpenSnags.length > 0 ? 'text-rose-700' : 'text-zinc-950'"
            >
              {{ propertyOpenSnags.length }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-zinc-100/80 border border-zinc-200/80">
      <button
        @click="activeTab = 'overview'"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
        :class="activeTab === 'overview' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'"
      >
        <KeyRound class="w-3.5 h-3.5" />
        <span>Key Vault ({{ propertyVault.length }})</span>
      </button>

      <button
        @click="activeTab = 'expenses'"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
        :class="activeTab === 'expenses' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'"
      >
        <Receipt class="w-3.5 h-3.5" />
        <span>Expenses & Spend ({{ propertyExpenses.length }})</span>
      </button>

      <button
        @click="activeTab = 'snags'"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
        :class="activeTab === 'snags' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'"
      >
        <Wrench class="w-3.5 h-3.5" />
        <span>Snags ({{ propertySnags.length }})</span>
      </button>

      <button
        @click="activeTab = 'contacts'"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
        :class="activeTab === 'contacts' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'"
      >
        <Users class="w-3.5 h-3.5" />
        <span>Contacts ({{ propertyContacts.length }})</span>
      </button>

      <button
        @click="activeTab = 'notes'"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
        :class="activeTab === 'notes' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-semibold' : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'"
      >
        <FileText class="w-3.5 h-3.5" />
        <span>Notes & Log ({{ propertyNotes.length }})</span>
      </button>
    </div>

    <!-- TAB 1: Key Vault -->
    <div v-if="activeTab === 'overview'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-950">Utility Codes & Key Details</h2>
          <p class="text-xs text-zinc-500">Prepaid meters, gate PINs, and access references</p>
        </div>

        <button
          @click="activeVault = null; showVaultModal = true"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-800 text-xs font-medium transition-all active:scale-98 shadow-xs"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Code</span>
        </button>
      </div>

      <div v-if="propertyVault.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KeyDetailBadge
          v-for="item in propertyVault"
          :key="item.id"
          :item="item"
          :show-property-badge="false"
        />
      </div>

      <div v-else class="p-8 rounded-2xl bg-white border border-zinc-200/80 text-center shadow-xs">
        <h4 class="text-sm font-semibold text-zinc-700">No Key Details Saved</h4>
        <p class="text-xs text-zinc-500 mt-1">Store prepaid meter numbers or alarm PINs.</p>
      </div>
    </div>

    <!-- TAB 2: Spend & Expenses -->
    <div v-if="activeTab === 'expenses'" class="space-y-6">
      <SpendSummaryCard :property-id="property.id" />

      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-950">Monthly Committed Bills</h2>
          <p class="text-xs text-zinc-500">Toggle to reconcile bills for the current period</p>
        </div>

        <button
          @click="activeExpense = null; showExpenseModal = true"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm active:scale-98 transition-all"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      <div class="space-y-2.5">
        <div
          v-for="exp in propertyExpenses"
          :key="exp.id"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-xs"
        >
          <div class="flex items-start gap-3">
            <!-- Toggle Checkbox -->
            <button
              @click="store.toggleExpensePaid(exp.id)"
              class="mt-1 shrink-0 text-zinc-400 hover:text-zinc-950 transition-colors"
              :title="exp.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'"
            >
              <CheckCircle2 v-if="exp.isPaid" class="w-5 h-5 text-emerald-600" />
              <Circle v-else class="w-5 h-5 text-zinc-300 hover:text-zinc-600" />
            </button>

            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="text-sm font-semibold text-zinc-950" :class="{ 'line-through text-zinc-400': exp.isPaid }">
                  {{ exp.name }}
                </h4>
                <span class="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {{ exp.category }}
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-50 text-zinc-500">
                  Due: {{ exp.dueDay }}th
                </span>
              </div>

              <div class="text-xs text-zinc-500 mt-1 flex items-center gap-3 flex-wrap">
                <span v-if="exp.accountReference" class="font-mono text-zinc-700">Ref: {{ exp.accountReference }}</span>
                <span v-if="exp.lastPaidDate" class="text-[11px] text-zinc-600">Settled: {{ exp.lastPaidDate }}</span>
              </div>
              <p v-if="exp.notes" class="text-xs text-zinc-600 mt-1">{{ exp.notes }}</p>
            </div>
          </div>

          <!-- Amount & Actions -->
          <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100">
            <div class="text-right">
              <div class="text-base font-semibold text-zinc-950 font-mono">
                {{ store.formatCurrency(exp.amount) }}
              </div>
              <div class="text-[10px] text-zinc-500 uppercase font-medium">
                {{ exp.frequency }}
              </div>
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="activeExpense = exp; showExpenseModal = true"
                class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                title="Edit"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                @click="store.deleteExpense(exp.id)"
                class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                title="Delete"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Snags -->
    <div v-if="activeTab === 'snags'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-950">Snags & Repairs</h2>
          <p class="text-xs text-zinc-500">Defects and ongoing maintenance</p>
        </div>

        <button
          @click="activeSnag = null; showSnagModal = true"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-800 text-xs font-medium transition-all active:scale-98 shadow-xs"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Log Snag</span>
        </button>
      </div>

      <div v-if="propertySnags.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SnagCard
          v-for="snag in propertySnags"
          :key="snag.id"
          :snag="snag"
          :show-property-badge="false"
          @edit="(s) => { activeSnag = s; showSnagModal = true }"
          @contact-whatsapp="openWhatsAppForSnag"
        />
      </div>

      <div v-else class="p-8 rounded-2xl bg-white border border-zinc-200/80 text-center shadow-xs">
        <h4 class="text-sm font-semibold text-zinc-700">Zero Open Snags</h4>
        <p class="text-xs text-zinc-500 mt-1">This property has no open maintenance items.</p>
      </div>
    </div>

    <!-- TAB 4: Contacts -->
    <div v-if="activeTab === 'contacts'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-950">Assigned Trades & Tenants</h2>
          <p class="text-xs text-zinc-500">Relevant service directory for this address</p>
        </div>

        <button
          @click="activeContact = null; showContactModal = true"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-800 text-xs font-medium transition-all active:scale-98 shadow-xs"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Contact</span>
        </button>
      </div>

      <div v-if="propertyContacts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ContactCard
          v-for="c in propertyContacts"
          :key="c.id"
          :contact="c"
          @edit="(contact) => { activeContact = contact; showContactModal = true }"
          @open-whatsapp="openWhatsAppForContact"
        />
      </div>

      <div v-else class="p-8 rounded-2xl bg-white border border-zinc-200/80 text-center shadow-xs">
        <h4 class="text-sm font-semibold text-zinc-700">No Contacts Assigned</h4>
        <p class="text-xs text-zinc-500 mt-1">Add plumbers, electricians, or tenants.</p>
      </div>
    </div>

    <!-- TAB 5: Notes -->
    <div v-if="activeTab === 'notes'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-950">Inspection Notes & Log</h2>
          <p class="text-xs text-zinc-500">Timestamped records and historical entries</p>
        </div>

        <button
          @click="activeNote = null; showNoteModal = true"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-800 text-xs font-medium transition-all active:scale-98 shadow-xs"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      <div v-if="propertyNotes.length > 0" class="space-y-3">
        <div
          v-for="note in propertyNotes"
          :key="note.id"
          class="p-5 rounded-xl bg-white border border-zinc-200/80 space-y-2 shadow-xs"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200/80">
                {{ note.category }}
              </span>
              <span class="text-xs text-zinc-500">
                {{ new Date(note.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </span>
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="activeNote = note; showNoteModal = true"
                class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                title="Edit"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                @click="store.deleteNote(note.id)"
                class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                title="Delete"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h4 class="text-sm font-semibold text-zinc-950">{{ note.title }}</h4>
          <p class="text-xs text-zinc-700 leading-relaxed whitespace-pre-line">{{ note.content }}</p>
        </div>
      </div>

      <div v-else class="p-8 rounded-2xl bg-white border border-zinc-200/80 text-center shadow-xs">
        <h4 class="text-sm font-semibold text-zinc-700">No Notes Logged</h4>
        <p class="text-xs text-zinc-500 mt-1">Record inspection logs, meter disputes, or key handover notes.</p>
      </div>
    </div>

    <!-- Modals -->
    <PropertyModal :show="showPropertyModal" :property="property" @close="showPropertyModal = false" />
    <ExpenseModal :show="showExpenseModal" :expense="activeExpense" :default-property-id="property.id" @close="showExpenseModal = false" />
    <SnagModal :show="showSnagModal" :snag="activeSnag" :default-property-id="property.id" @close="showSnagModal = false" />
    <ContactModal :show="showContactModal" :contact="activeContact" :default-property-id="property.id" @close="showContactModal = false" />
    <VaultModal :show="showVaultModal" :vault-item="activeVault" :default-property-id="property.id" @close="showVaultModal = false" />
    <NoteModal :show="showNoteModal" :note="activeNote" :default-property-id="property.id" @close="showNoteModal = false" />
    <WhatsAppMessageModal
      :show="showWhatsAppModal"
      :contact="whatsAppContact"
      :snag="whatsAppSnag"
      :property="property"
      @close="showWhatsAppModal = false"
    />
  </div>

  <div v-else class="max-w-7xl mx-auto px-6 py-16 text-center">
    <h2 class="text-base font-semibold text-zinc-950">Property Not Found</h2>
    <p class="text-xs text-zinc-500 mt-1">The requested property may have been removed.</p>
    <button
      @click="router.push('/')"
      class="mt-4 px-4 py-2 rounded-lg bg-zinc-900 text-white font-semibold text-xs shadow-xs"
    >
      Return to Dashboard
    </button>
  </div>
</template>
