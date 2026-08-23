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
    class="flex flex-col justify-between p-5 rounded-2xl bg-zinc-900 border transition-colors duration-150"
    :class="[
      snag.status === 'Resolved'
        ? 'border-zinc-800/60 opacity-60 bg-zinc-900/60'
        : snag.severity === 'Urgent'
        ? 'border-zinc-500 shadow-sm'
        : 'border-zinc-800 hover:border-zinc-700'
    ]"
  >
    <div class="space-y-3">
      <!-- Top Row: Area Tag & Severity -->
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
            <MapPin class="w-3 h-3 text-zinc-400" />
            {{ snag.area }}
          </span>

          <span
            class="px-2 py-0.5 rounded text-[11px] font-medium border"
            :class="[
              snag.severity === 'Urgent'
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
                : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60'
            ]"
          >
            {{ snag.severity }}
          </span>
        </div>

        <span
          v-if="showPropertyBadge && property"
          class="text-xs text-zinc-400 font-medium truncate max-w-[150px]"
        >
          {{ property.nickname || property.name }}
        </span>
      </div>

      <!-- Title & Checkbox -->
      <div class="flex items-start gap-3">
        <button
          @click="toggleStatus"
          class="mt-0.5 shrink-0 text-zinc-400 hover:text-white transition-colors"
          :title="snag.status === 'Resolved' ? 'Reopen task' : 'Mark as resolved'"
        >
          <CheckCircle2 v-if="snag.status === 'Resolved'" class="w-5 h-5 text-zinc-300" />
          <Circle v-else class="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
        </button>

        <div class="flex-1 min-w-0">
          <h4
            class="text-sm font-semibold leading-snug text-zinc-100"
            :class="{ 'line-through text-zinc-500 font-normal': snag.status === 'Resolved' }"
          >
            {{ snag.title }}
          </h4>
          <p v-if="snag.notes" class="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
            {{ snag.notes }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Action Row -->
    <div class="mt-4 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-3">
      <!-- Status Cycler Button -->
      <button
        @click="cycleStatus"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors"
        :class="[
          snag.status === 'Resolved'
            ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
            : snag.status === 'In Progress'
            ? 'bg-zinc-800 text-zinc-200 border-zinc-600'
            : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
        ]"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="snag.status === 'Resolved' ? 'bg-zinc-500' : snag.status === 'In Progress' ? 'bg-zinc-200' : 'bg-zinc-600'"></span>
        <span>{{ snag.status }}</span>
      </button>

      <!-- Assigned Contractor & Actions -->
      <div class="flex items-center gap-2">
        <div v-if="assignedContact" class="flex items-center gap-1.5">
          <span class="text-xs text-zinc-400 truncate max-w-[110px] hidden sm:inline">
            {{ assignedContact.name }}
          </span>

          <button
            v-if="assignedContact.whatsappPhone || assignedContact.phone"
            @click="emit('contact-whatsapp', { contactId: assignedContact.id, snag })"
            class="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
            title="Message on WhatsApp"
          >
            <MessageCircle class="w-3.5 h-3.5" />
          </button>

          <a
            :href="`tel:${assignedContact.phone}`"
            class="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
            title="Call contractor"
          >
            <Phone class="w-3.5 h-3.5" />
          </a>
        </div>

        <div v-if="snag.costEstimate" class="text-xs font-mono text-zinc-400 px-2 py-1 rounded bg-zinc-950 border border-zinc-800">
          {{ store.formatCurrency(snag.costEstimate) }}
        </div>

        <div class="flex items-center gap-1 pl-1 border-l border-zinc-800">
          <button
            @click="emit('edit', snag)"
            class="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Edit"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>
          <button
            @click="store.deleteSnag(snag.id)"
            class="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Delete"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
