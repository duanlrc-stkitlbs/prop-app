<script setup lang="ts">
import { computed } from 'vue'
import type { Snag } from '../types/property'
import { usePropertyStore } from '../stores/propertyStore'
import {
  CheckCircle2,
  Circle,
  Clock,
  Phone,
  MessageCircle,
  Edit2,
  Trash2,
  MapPin,
  Coins
} from 'lucide-vue-next'

const props = defineProps<{
  snag: Snag
  showPropertyBadge?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', snag: Snag): void
  (e: 'contact-whatsapp', payload: { contactId: string; snag: Snag }): void
}>()

const store = usePropertyStore()

const property = computed(() => store.getPropertyById(props.snag.propertyId))
const assignedContact = computed(() => store.getContactById(props.snag.assignedContactId))

function toggleStatus() {
  store.quickResolveSnag(props.snag.id)
}

function cycleStatus() {
  store.cycleSnagStatus(props.snag.id)
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'Urgent':
      return {
        label: 'Urgent',
        classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-500 animate-pulse'
      }
    case 'Normal':
      return {
        label: 'Normal',
        classes: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        dot: 'bg-blue-400'
      }
    case 'Cosmetic':
      return {
        label: 'Cosmetic',
        classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        dot: 'bg-purple-400'
      }
    default:
      return {
        label: severity,
        classes: 'bg-slate-700 text-slate-300 border-slate-600',
        dot: 'bg-slate-400'
      }
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Resolved':
      return {
        label: 'Resolved',
        classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: CheckCircle2
      }
    case 'In Progress':
      return {
        label: 'In Progress',
        classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: Clock
      }
    case 'Open':
    default:
      return {
        label: 'Open',
        classes: 'bg-slate-800 text-slate-300 border-slate-700',
        icon: Circle
      }
  }
}
</script>

<template>
  <div
    class="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200"
    :class="[
      snag.status === 'Resolved'
        ? 'bg-slate-900/50 border-slate-800/80 opacity-75'
        : snag.severity === 'Urgent'
        ? 'bg-slate-900/90 border-rose-500/40 shadow-lg shadow-rose-950/20'
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
    ]"
  >
    <div>
      <!-- Top Row: Area Tag, Severity, and Property -->
      <div class="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <div class="flex items-center gap-1.5 flex-wrap">
          <!-- Area Tag -->
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <MapPin class="w-3 h-3 text-slate-400" />
            {{ snag.area }}
          </span>

          <!-- Severity Badge -->
          <span
            :class="[
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
              getSeverityBadge(snag.severity).classes
            ]"
          >
            <span :class="['w-1.5 h-1.5 rounded-full', getSeverityBadge(snag.severity).dot]"></span>
            {{ getSeverityBadge(snag.severity).label }}
          </span>
        </div>

        <!-- Property Badge if rendered in global lists -->
        <span
          v-if="showPropertyBadge && property"
          class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 truncate max-w-[150px]"
        >
          {{ property.nickname || property.name }}
        </span>
      </div>

      <!-- Title & Checkbox -->
      <div class="flex items-start gap-3 mt-1">
        <!-- 1-Click Quick Resolve Checkbox Button -->
        <button
          @click="toggleStatus"
          class="mt-0.5 shrink-0 p-1 rounded-lg transition-transform active:scale-90"
          :class="snag.status === 'Resolved' ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'"
          :title="snag.status === 'Resolved' ? 'Reopen snag' : 'Mark as resolved'"
        >
          <CheckCircle2 v-if="snag.status === 'Resolved'" class="w-5 h-5 fill-emerald-500/20" />
          <Circle v-else class="w-5 h-5" />
        </button>

        <div class="flex-1 min-w-0">
          <h4
            class="text-sm sm:text-base font-semibold leading-snug tracking-tight text-slate-100"
            :class="{ 'line-through text-slate-400 font-normal': snag.status === 'Resolved' }"
          >
            {{ snag.title }}
          </h4>
          <p v-if="snag.notes" class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {{ snag.notes }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Action & Info Row -->
    <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
      <!-- Status Badge with Status Cycler -->
      <button
        @click="cycleStatus"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all active:scale-95 hover:brightness-110"
        :class="getStatusBadge(snag.status).classes"
        title="Click to cycle status (Open → In Progress → Resolved)"
      >
        <component :is="getStatusBadge(snag.status).icon" class="w-3.5 h-3.5" />
        <span>{{ getStatusBadge(snag.status).label }}</span>
      </button>

      <!-- Assigned Contractor or Cost -->
      <div class="flex items-center gap-2">
        <!-- Assigned Contractor Quick WhatsApp / Call -->
        <div v-if="assignedContact" class="flex items-center gap-1.5">
          <span class="text-xs text-slate-400 truncate max-w-[100px] hidden sm:inline">
            {{ assignedContact.name }}
          </span>

          <!-- Quick WhatsApp button for this snag -->
          <button
            v-if="assignedContact.whatsappPhone || assignedContact.phone"
            @click="emit('contact-whatsapp', { contactId: assignedContact.id, snag })"
            class="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition-colors"
            title="Message contractor on WhatsApp about this snag"
          >
            <MessageCircle class="w-3.5 h-3.5" />
          </button>

          <!-- Direct Call -->
          <a
            :href="`tel:${assignedContact.phone}`"
            class="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 transition-colors"
            title="Call contractor"
          >
            <Phone class="w-3.5 h-3.5" />
          </a>
        </div>

        <!-- Cost Estimate if present -->
        <div v-if="snag.costEstimate" class="flex items-center gap-1 text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
          <Coins class="w-3 h-3 text-amber-400" />
          <span>{{ store.formatCurrency(snag.costEstimate) }}</span>
        </div>

        <!-- Edit & Delete -->
        <div class="flex items-center gap-1 pl-1 border-l border-slate-800">
          <button
            @click="emit('edit', snag)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Edit snag"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>
          <button
            @click="store.deleteSnag(snag.id)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete snag"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
