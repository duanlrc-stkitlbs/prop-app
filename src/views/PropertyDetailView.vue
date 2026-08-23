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
  <div v-if="property" class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Back Button & Top Action Strip -->
    <div class="flex items-center justify-between gap-4">
      <button
        @click="router.push('/')"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all active:scale-95"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div class="flex items-center gap-2">
        <button
          @click="showPropertyModal = true"
          class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Edit Property Info"
        >
          <Edit2 class="w-4 h-4" />
        </button>
        <button
          @click="confirmDeleteProperty"
          class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Delete Property"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Main Property Banner Card -->
    <div class="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="space-y-2">
          <!-- Type and Status Badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {{ property.type }}
            </span>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {{ property.status }}
            </span>
            <span v-if="property.rentalIncome" class="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              Income: {{ store.formatCurrency(property.rentalIncome) }}/mo
            </span>
          </div>

          <!-- Name & Address -->
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {{ property.name }}
          </h1>
          <p class="flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin class="w-4 h-4 text-slate-500 shrink-0" />
            <span>{{ property.address }}</span>
          </p>

          <!-- Units Badges -->
          <div v-if="property.units && property.units.length > 0" class="flex items-center gap-1.5 flex-wrap pt-1">
            <span class="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Layers class="w-3.5 h-3.5" /> Units:
            </span>
            <span
              v-for="(u, idx) in property.units"
              :key="idx"
              class="text-xs px-2.5 py-0.5 rounded-lg bg-slate-950 text-slate-200 border border-slate-800"
            >
              {{ u }}
            </span>
          </div>
        </div>

        <!-- Right Monthly Spend & Snag summary -->
        <div class="flex items-center gap-3 shrink-0">
          <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[130px]">
            <div class="text-[10px] text-slate-400 font-semibold uppercase">Monthly Spend</div>
            <div class="text-lg font-bold text-white font-mono mt-0.5">
              {{ store.formatCurrency(store.getPropertyMonthlySpend(property.id)) }}
            </div>
          </div>

          <div
            class="p-4 rounded-2xl border text-center min-w-[130px]"
            :class="propertyOpenSnags.length > 0 ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' : 'bg-slate-950/80 border-slate-800 text-emerald-400'"
          >
            <div class="text-[10px] uppercase font-semibold opacity-80">Open Snags</div>
            <div class="text-lg font-bold font-mono mt-0.5">
              {{ propertyOpenSnags.length }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs for Property Hub -->
    <div class="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
      <button
        @click="activeTab = 'overview'"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
        :class="activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
      >
        <KeyRound class="w-4 h-4" />
        <span>Key Vault ({{ propertyVault.length }})</span>
      </button>

      <button
        @click="activeTab = 'expenses'"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
        :class="activeTab === 'expenses' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
      >
        <Receipt class="w-4 h-4" />
        <span>Expenses & Spend ({{ propertyExpenses.length }})</span>
      </button>

      <button
        @click="activeTab = 'snags'"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
        :class="activeTab === 'snags' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
      >
        <Wrench class="w-4 h-4" />
        <span>Snag List ({{ propertySnags.length }})</span>
        <span
          v-if="propertyOpenSnags.length > 0"
          class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
          :class="activeTab === 'snags' ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'"
        >
          {{ propertyOpenSnags.length }}
        </span>
      </button>

      <button
        @click="activeTab = 'contacts'"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
        :class="activeTab === 'contacts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
      >
        <Users class="w-4 h-4" />
        <span>Contacts ({{ propertyContacts.length }})</span>
      </button>

      <button
        @click="activeTab = 'notes'"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
        :class="activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
      >
        <FileText class="w-4 h-4" />
        <span>Notes & Log ({{ propertyNotes.length }})</span>
      </button>
    </div>

    <!-- TAB 1: Key Vault & Meter Reference -->
    <div v-if="activeTab === 'overview'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-white">Property Key Vault & Utility Codes</h2>
          <p class="text-xs text-slate-400">Prepaid meters, gate PINs, Wi-Fi keys, account numbers with 1-tap copy</p>
        </div>

        <button
          @click="activeVault = null; showVaultModal = true"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>Add Key Detail</span>
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

      <div v-else class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
        <KeyRound class="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h4 class="text-sm font-bold text-slate-200">No Key Details Saved Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Store prepaid electricity meter numbers, gate codes, or Wi-Fi passwords.</p>
        <button
          @click="showVaultModal = true"
          class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
        >
          <Plus class="w-4 h-4" />
          <span>Add First Code</span>
        </button>
      </div>
    </div>

    <!-- TAB 2: Spend & Expenses -->
    <div v-if="activeTab === 'expenses'" class="space-y-6">
      <SpendSummaryCard :property-id="property.id" />

      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-white">Monthly Committed Expenses & Bills</h2>
          <p class="text-xs text-slate-400">1-tap toggle to mark paid each cycle</p>
        </div>

        <button
          @click="activeExpense = null; showExpenseModal = true"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="exp in propertyExpenses"
          :key="exp.id"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all"
        >
          <div class="flex items-start gap-3">
            <!-- 1-Tap Mark Paid Button -->
            <button
              @click="store.toggleExpensePaid(exp.id)"
              class="mt-1 shrink-0 p-1 rounded-lg transition-transform active:scale-90"
              :class="exp.isPaid ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'"
              :title="exp.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'"
            >
              <CheckCircle2 v-if="exp.isPaid" class="w-5 h-5 fill-emerald-500/20" />
              <Circle v-else class="w-5 h-5" />
            </button>

            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="text-sm font-bold text-slate-100" :class="{ 'line-through text-slate-400': exp.isPaid }">
                  {{ exp.name }}
                </h4>
                <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {{ exp.category }}
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                  Due: {{ exp.dueDay }}{{ exp.dueDay === 1 ? 'st' : exp.dueDay === 2 ? 'nd' : exp.dueDay === 3 ? 'rd' : 'th' }} of month
                </span>
              </div>

              <div class="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span v-if="exp.accountReference" class="font-mono text-slate-300">Ref: {{ exp.accountReference }}</span>
                <span v-if="exp.lastPaidDate" class="text-[11px] text-emerald-400">Last Paid: {{ exp.lastPaidDate }}</span>
              </div>
              <p v-if="exp.notes" class="text-xs text-slate-400 mt-1">{{ exp.notes }}</p>
            </div>
          </div>

          <!-- Amount & Actions -->
          <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
            <div class="text-right">
              <div class="text-base font-extrabold text-white font-mono">
                {{ store.formatCurrency(exp.amount) }}
              </div>
              <div class="text-[10px] text-slate-400 uppercase font-semibold">
                {{ exp.frequency }}
              </div>
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="activeExpense = exp; showExpenseModal = true"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Edit Expense"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                @click="store.deleteExpense(exp.id)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Expense"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Snags & Tasks -->
    <div v-if="activeTab === 'snags'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-white">Property Snag List & Tasks</h2>
          <p class="text-xs text-slate-400">Track defects, repair quotes, and maintenance</p>
        </div>

        <button
          @click="activeSnag = null; showSnagModal = true"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
        >
          <Plus class="w-4 h-4" />
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

      <div v-else class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
        <CheckCircle2 class="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <h4 class="text-sm font-bold text-slate-200">Zero Open Snags!</h4>
        <p class="text-xs text-slate-400 mt-1">This property is in perfect condition.</p>
        <button
          @click="showSnagModal = true"
          class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
        >
          <Plus class="w-4 h-4" />
          <span>Log Snag</span>
        </button>
      </div>
    </div>

    <!-- TAB 4: Contacts -->
    <div v-if="activeTab === 'contacts'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-white">Assigned Service Contacts & Tenants</h2>
          <p class="text-xs text-slate-400">1-tap call & WhatsApp directly from cards</p>
        </div>

        <button
          @click="activeContact = null; showContactModal = true"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
        >
          <Plus class="w-4 h-4" />
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

      <div v-else class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
        <Users class="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h4 class="text-sm font-bold text-slate-200">No Assigned Contacts Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Assign plumbers, electricians, tenants, or managing agents.</p>
        <button
          @click="showContactModal = true"
          class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          <Plus class="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>
    </div>

    <!-- TAB 5: Notes & Timeline History -->
    <div v-if="activeTab === 'notes'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-white">Inspection Notes & Activity Log</h2>
          <p class="text-xs text-slate-400">Timestamped records, access logs & lease updates</p>
        </div>

        <button
          @click="activeNote = null; showNoteModal = true"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 active:scale-95 transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div v-if="propertyNotes.length > 0" class="space-y-3">
        <div
          v-for="note in propertyNotes"
          :key="note.id"
          class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-md"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                {{ note.category }}
              </span>
              <span class="text-xs text-slate-400">
                {{ new Date(note.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </span>
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="activeNote = note; showNoteModal = true"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Edit Note"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                @click="store.deleteNote(note.id)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Note"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h4 class="text-base font-bold text-white">{{ note.title }}</h4>
          <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{{ note.content }}</p>
        </div>
      </div>

      <div v-else class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
        <FileText class="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h4 class="text-sm font-bold text-slate-200">No Notes Logged</h4>
        <p class="text-xs text-slate-400 mt-1">Record inspection logs, meter disputes, or key handover notes.</p>
        <button
          @click="showNoteModal = true"
          class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
        >
          <Plus class="w-4 h-4" />
          <span>Add Note</span>
        </button>
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

  <div v-else class="max-w-7xl mx-auto px-4 py-12 text-center">
    <h2 class="text-lg font-bold text-white">Property Not Found</h2>
    <p class="text-sm text-slate-400 mt-1">The requested property may have been removed.</p>
    <button
      @click="router.push('/')"
      class="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
    >
      Return to Dashboard
    </button>
  </div>
</template>
