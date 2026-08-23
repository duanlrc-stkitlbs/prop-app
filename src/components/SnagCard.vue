<script setup lang="ts">
import { computed } from 'vue'
import type { Snag } from '../types/property'
import { usePropertyStore } from '../stores/propertyStore'
import {
  CheckCircle2,
  Circle,
  Phone,
  MessageCircle,
  Edit2,
  Trash2,
  MapPin
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
</script>

<template>
  <div
    class="flex flex-col justify-between p-5 rounded-2xl bg-white border transition-colors duration-150 shadow-xs"
    :class="[
      snag.status === 'Resolved'
        ? 'border-zinc-200 opacity-60 bg-zinc-50/50'
        : snag.severity === 'Urgent'
        ? 'border-zinc-950 shadow-sm ring-1 ring-zinc-950/10'
        : 'border-zinc-200 hover:border-zinc-300'
    ]"
  >
    <div class="space-y-3">
      <!-- Top Row: Area Tag & Severity -->
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
            <MapPin class="w-3 h-3 text-zinc-500" />
            {{ snag.area }}
          </span>

          <span
            class="px-2 py-0.5 rounded text-[11px] font-medium border"
            :class="[
              snag.severity === 'Urgent'
                ? 'bg-zinc-950 text-white border-zinc-950 font-semibold'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200'
            ]"
          >
            {{ snag.severity }}
          </span>
        </div>

        <span
          v-if="showPropertyBadge && property"
          class="text-xs text-zinc-500 font-medium truncate max-w-[150px]"
        >
          {{ property.nickname || property.name }}
        </span>
      </div>

      <!-- Title & Checkbox -->
      <div class="flex items-start gap-3">
        <button
          @click="toggleStatus"
          class="mt-0.5 shrink-0 text-zinc-400 hover:text-zinc-950 transition-colors"
          :title="snag.status === 'Resolved' ? 'Reopen task' : 'Mark as resolved'"
        >
          <CheckCircle2 v-if="snag.status === 'Resolved'" class="w-5 h-5 text-zinc-900" />
          <Circle v-else class="w-5 h-5 text-zinc-400 hover:text-zinc-900" />
        </button>

        <div class="flex-1 min-w-0">
          <h4
            class="text-sm font-semibold leading-snug text-zinc-950"
            :class="{ 'line-through text-zinc-400 font-normal': snag.status === 'Resolved' }"
          >
            {{ snag.title }}
          </h4>
          <p v-if="snag.notes" class="text-xs text-zinc-600 mt-1 leading-relaxed line-clamp-2">
            {{ snag.notes }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Action Row -->
    <div class="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-3">
      <!-- Status Cycler Button -->
      <button
        @click="cycleStatus"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors"
        :class="[
          snag.status === 'Resolved'
            ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
            : snag.status === 'In Progress'
            ? 'bg-zinc-950 text-white border-zinc-950'
            : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:bg-zinc-100'
        ]"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="snag.status === 'Resolved' ? 'bg-zinc-400' : snag.status === 'In Progress' ? 'bg-white' : 'bg-zinc-600'"></span>
        <span>{{ snag.status }}</span>
      </button>

      <!-- Assigned Contractor & Actions -->
      <div class="flex items-center gap-2">
        <div v-if="assignedContact" class="flex items-center gap-1.5">
          <span class="text-xs text-zinc-600 truncate max-w-[110px] hidden sm:inline">
            {{ assignedContact.name }}
          </span>

          <button
            v-if="assignedContact.whatsappPhone || assignedContact.phone"
            @click="emit('contact-whatsapp', { contactId: assignedContact.id, snag })"
            class="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-colors"
            title="Message on WhatsApp"
          >
            <MessageCircle class="w-3.5 h-3.5" />
          </button>

          <a
            :href="`tel:${assignedContact.phone}`"
            class="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-colors"
            title="Call contractor"
          >
            <Phone class="w-3.5 h-3.5" />
          </a>
        </div>

        <div v-if="snag.costEstimate" class="text-xs font-mono text-zinc-700 px-2 py-1 rounded bg-zinc-100 border border-zinc-200">
          {{ store.formatCurrency(snag.costEstimate) }}
        </div>

        <div class="flex items-center gap-1 pl-1 border-l border-zinc-200">
          <button
            @click="emit('edit', snag)"
            class="p-1.5 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Edit"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>
          <button
            @click="store.deleteSnag(snag.id)"
            class="p-1.5 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Delete"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
