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
    class="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900 border transition-colors duration-150"
    :class="contact.isEmergencyContact ? 'border-zinc-500 shadow-sm' : 'border-zinc-800 hover:border-zinc-700'"
  >
    <div class="space-y-3">
      <!-- Top header: Role & Priority Flag -->
      <div class="flex items-center justify-between gap-2">
        <span class="px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
          {{ contact.role }}
        </span>

        <span
          v-if="contact.isEmergencyContact"
          class="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-950"
        >
          24/7 Priority
        </span>
      </div>

      <!-- Name & Company -->
      <div>
        <h3 class="text-base font-semibold text-zinc-100 tracking-tight">{{ contact.name }}</h3>
        <p v-if="contact.company" class="text-xs text-zinc-400 font-normal mt-0.5">
          {{ contact.company }}
        </p>
      </div>

      <!-- Rating Stars if present -->
      <div v-if="contact.rating" class="flex items-center gap-1">
        <Star
          v-for="star in 5"
          :key="star"
          class="w-3.5 h-3.5"
          :class="star <= contact.rating ? 'fill-zinc-300 text-zinc-300' : 'text-zinc-700'"
        />
      </div>

      <!-- Notes -->
      <p v-if="contact.notes" class="text-xs text-zinc-400 leading-relaxed line-clamp-2">
        {{ contact.notes }}
      </p>

      <!-- Assigned Properties -->
      <div v-if="assignedProperties.length > 0" class="flex flex-wrap gap-1.5 pt-1">
        <span
          v-for="prop in assignedProperties"
          :key="prop.id"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-950 text-zinc-400 border border-zinc-800"
        >
          <Building2 class="w-2.5 h-2.5 text-zinc-500" />
          <span>{{ prop.nickname || prop.name }}</span>
        </span>
      </div>
    </div>

    <!-- Communication Actions -->
    <div class="mt-6 pt-4 border-t border-zinc-800">
      <div class="grid grid-cols-2 gap-2">
        <a
          :href="`tel:${contact.phone}`"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 font-medium text-xs transition-all active:scale-98"
        >
          <Phone class="w-3.5 h-3.5" />
          <span>Call</span>
        </a>

        <button
          @click="emit('open-whatsapp', contact)"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 font-medium text-xs transition-all active:scale-98"
        >
          <MessageCircle class="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>
      </div>

      <!-- Secondary Links -->
      <div class="flex items-center justify-between mt-3 text-xs text-zinc-500">
        <a
          v-if="contact.email"
          :href="`mailto:${contact.email}`"
          class="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors truncate max-w-[170px]"
        >
          <Mail class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ contact.email }}</span>
        </a>
        <div v-else class="text-[11px] text-zinc-600">No email</div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            @click="emit('edit', contact)"
            class="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Edit"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>
          <button
            @click="store.deleteContact(contact.id)"
            class="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Delete"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
