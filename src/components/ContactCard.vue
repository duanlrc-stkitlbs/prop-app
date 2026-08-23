<script setup lang="ts">
import { computed } from 'vue'
import type { Contact, Property } from '../types/property'
import { usePropertyStore } from '../stores/propertyStore'
import {
  Phone,
  MessageCircle,
  Mail,
  Building2,
  ShieldAlert,
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

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'Plumber': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
    case 'Electrician': return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    case 'Handyman': return 'bg-orange-500/15 text-orange-300 border-orange-500/30'
    case 'Tenant': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'Body Corporate': return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    case 'Security': return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    case 'Gardener & Landscaper': return 'bg-lime-500/15 text-lime-300 border-lime-500/30'
    case 'Appliance Repair': return 'bg-sky-500/15 text-sky-300 border-sky-500/30'
    case 'Insurance Broker': return 'bg-teal-500/15 text-teal-300 border-teal-500/30'
    default: return 'bg-slate-800 text-slate-300 border-slate-700'
  }
}
</script>

<template>
  <div
    class="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/90 border transition-all duration-200 shadow-md"
    :class="contact.isEmergencyContact ? 'border-rose-500/40 shadow-rose-950/20' : 'border-slate-800 hover:border-slate-700'"
  >
    <div>
      <!-- Top header: Role & Emergency Badge -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <span
          :class="[
            'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
            getRoleBadgeColor(contact.role)
          ]"
        >
          {{ contact.role }}
        </span>

        <span
          v-if="contact.isEmergencyContact"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40"
        >
          <ShieldAlert class="w-3 h-3 text-rose-400" />
          <span>24/7 Priority</span>
        </span>
      </div>

      <!-- Name & Company -->
      <h3 class="text-base sm:text-lg font-bold text-white tracking-tight">{{ contact.name }}</h3>
      <p v-if="contact.company" class="text-xs text-slate-400 font-medium -mt-0.5 mb-2">
        {{ contact.company }}
      </p>

      <!-- Rating Stars if present -->
      <div v-if="contact.rating" class="flex items-center gap-0.5 my-1.5">
        <Star
          v-for="star in 5"
          :key="star"
          class="w-3.5 h-3.5"
          :class="star <= contact.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'"
        />
      </div>

      <!-- Notes / Info -->
      <p v-if="contact.notes" class="text-xs text-slate-400 leading-relaxed my-2 line-clamp-2">
        {{ contact.notes }}
      </p>

      <!-- Assigned Properties -->
      <div v-if="assignedProperties.length > 0" class="flex flex-wrap gap-1.5 my-2">
        <span
          v-for="prop in assignedProperties"
          :key="prop.id"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
        >
          <Building2 class="w-2.5 h-2.5 text-indigo-400" />
          <span>{{ prop.nickname || prop.name }}</span>
        </span>
      </div>
    </div>

    <!-- Quick Communication Actions (Large touch targets for mobile) -->
    <div class="mt-4 pt-3.5 border-t border-slate-800">
      <div class="grid grid-cols-2 gap-2">
        <!-- Direct Phone Dial Button -->
        <a
          :href="`tel:${contact.phone}`"
          class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 font-semibold text-xs transition-all active:scale-95"
        >
          <Phone class="w-4 h-4" />
          <span>Call</span>
        </a>

        <!-- WhatsApp Action Button -->
        <button
          @click="emit('open-whatsapp', contact)"
          class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-all active:scale-95"
        >
          <MessageCircle class="w-4 h-4" />
          <span>WhatsApp</span>
        </button>
      </div>

      <!-- Secondary Links: Email, Edit, Delete -->
      <div class="flex items-center justify-between mt-3 text-xs text-slate-400">
        <a
          v-if="contact.email"
          :href="`mailto:${contact.email}`"
          class="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors truncate max-w-[170px]"
        >
          <Mail class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ contact.email }}</span>
        </a>
        <div v-else class="text-[11px] text-slate-600">No email stored</div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            @click="emit('edit', contact)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Edit Contact"
          >
            <Edit2 class="w-3.5 h-3.5" />
          </button>
          <button
            @click="store.deleteContact(contact.id)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Contact"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
