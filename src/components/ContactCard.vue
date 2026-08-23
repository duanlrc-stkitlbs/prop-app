<script setup lang="ts">
import { computed } from 'vue'
import type { Contact, Property } from '../types/property'
import { usePropertyStore } from '../stores/propertyStore'
import {
  Phone,
  MessageCircle,
  Mail,
  Building2,
  Star,
  Edit2,
  Trash2
} from 'lucide-vue-next'

const props = defineProps<{
  contact: Contact
}>()

const emit = defineEmits<{
  (e: 'edit', contact: Contact): void
  (e: 'open-whatsapp', contact: Contact): void
}>()

const store = usePropertyStore()

const assignedProperties = computed<Property[]>(() => {
  if (!props.contact.propertyIds || props.contact.propertyIds.length === 0) return []
  return props.contact.propertyIds
    .map(id => store.getPropertyById(id))
    .filter((p): p is Property => p !== undefined)
})
</script>

<template>
  <div
    class="flex flex-col justify-between p-6 rounded-2xl bg-white border transition-colors duration-150 shadow-xs"
    :class="contact.isEmergencyContact ? 'border-amber-200/90 bg-amber-50/10 shadow-xs ring-1 ring-amber-400/20' : 'border-zinc-200 hover:border-zinc-300'"
  >
    <div class="space-y-3">
      <!-- Top header: Role & Priority Flag -->
      <div class="flex items-center justify-between gap-2">
        <span class="px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200/80">
          {{ contact.role }}
        </span>

        <span
          v-if="contact.isEmergencyContact"
          class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
        >
          24/7 Priority
        </span>
      </div>

      <!-- Name & Company -->
      <div>
        <h3 class="text-base font-semibold text-zinc-950 tracking-tight">{{ contact.name }}</h3>
        <p v-if="contact.company" class="text-xs text-zinc-500 font-normal mt-0.5">
          {{ contact.company }}
        </p>
      </div>

      <!-- Rating Stars if present -->
      <div v-if="contact.rating" class="flex items-center gap-1">
        <Star
          v-for="star in 5"
          :key="star"
          class="w-3.5 h-3.5"
          :class="star <= contact.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'"
        />
      </div>

      <!-- Notes -->
      <p v-if="contact.notes" class="text-xs text-zinc-600 leading-relaxed line-clamp-2">
        {{ contact.notes }}
      </p>

      <!-- Assigned Properties -->
      <div v-if="assignedProperties.length > 0" class="flex flex-wrap gap-1.5 pt-1">
        <span
          v-for="prop in assignedProperties"
          :key="prop.id"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-50 text-zinc-700 border border-zinc-200"
        >
          <Building2 class="w-2.5 h-2.5 text-zinc-500" />
          <span>{{ prop.nickname || prop.name }}</span>
        </span>
      </div>
    </div>

    <!-- Communication Actions -->
    <div class="mt-6 pt-4 border-t border-zinc-100">
      <div class="grid grid-cols-2 gap-2">
        <a
          :href="`tel:${contact.phone}`"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 font-medium text-xs transition-all active:scale-98 shadow-xs"
        >
          <Phone class="w-3.5 h-3.5 text-zinc-600" />
          <span>Call</span>
        </a>

        <button
          @click="emit('open-whatsapp', contact)"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 font-medium text-xs transition-all active:scale-98 shadow-xs"
        >
          <MessageCircle class="w-3.5 h-3.5 text-zinc-600" />
          <span>WhatsApp</span>
        </button>
      </div>

      <!-- Secondary Links -->
      <div class="flex items-center justify-between mt-3 text-xs text-zinc-500">
        <a
          v-if="contact.email"
          :href="`mailto:${contact.email}`"
          class="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 transition-colors truncate max-w-[170px]"
        >
          <Mail class="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <span class="truncate">{{ contact.email }}</span>
        </a>
        <div v-else class="text-[11px] text-zinc-400">No email</div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            @click="emit('edit', contact)"
            class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Edit"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>
          <button
            @click="store.deleteContact(contact.id)"
            class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Delete"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
