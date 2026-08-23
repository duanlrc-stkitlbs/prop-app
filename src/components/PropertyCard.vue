<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Property } from '../types/property'
import { usePropertyStore } from '../stores/propertyStore'
import {
  MapPin,
  Layers,
  ChevronRight
} from 'lucide-vue-next'

const props = defineProps<{
  property: Property
}>()

const router = useRouter()
const store = usePropertyStore()

const monthlySpend = computed(() => store.getPropertyMonthlySpend(props.property.id))
const openSnags = computed(() => store.getOpenSnagsByProperty(props.property.id))
const urgentSnags = computed(() => openSnags.value.filter(s => s.severity === 'Urgent'))
</script>

<template>
  <div
    @click="router.push(`/properties/${property.id}`)"
    class="group cursor-pointer flex flex-col justify-between p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all duration-150 active:scale-[0.99] shadow-xs"
  >
    <div class="space-y-3">
      <!-- Top Row: Type & Status -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
            {{ property.type }}
          </span>
          <span class="text-xs font-medium px-2.5 py-0.5 rounded bg-zinc-50 text-zinc-600 border border-zinc-200">
            {{ property.status }}
          </span>
        </div>

        <div class="p-1 rounded text-zinc-400 group-hover:text-zinc-950 transition-colors">
          <ChevronRight class="w-4 h-4" />
        </div>
      </div>

      <!-- Property Name & Address -->
      <div>
        <h3 class="text-base font-semibold text-zinc-950 group-hover:text-black transition-colors tracking-tight">
          {{ property.name }}
        </h3>
        <p class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1 truncate">
          <MapPin class="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <span class="truncate">{{ property.address }}</span>
        </p>
      </div>

      <!-- Units / Sections -->
      <div v-if="property.units && property.units.length > 0" class="pt-1">
        <div class="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5 font-medium">
          <Layers class="w-3.5 h-3.5 text-zinc-400" />
          <span>{{ property.units.length }} Units / Sections</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(unit, idx) in property.units.slice(0, 2)"
            :key="idx"
            class="text-[11px] px-2 py-0.5 rounded bg-zinc-50 text-zinc-700 border border-zinc-200 truncate max-w-[200px]"
          >
            {{ unit }}
          </span>
          <span
            v-if="property.units.length > 2"
            class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium"
          >
            +{{ property.units.length - 2 }} more
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom Stat Row -->
    <div class="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-3 mt-4">
      <!-- Monthly Spend -->
      <div class="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
        <div class="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Monthly Spend</div>
        <div class="text-xs font-semibold text-zinc-950 font-mono mt-0.5 truncate">
          {{ store.formatCurrency(monthlySpend) }}
        </div>
      </div>

      <!-- Snag indicator -->
      <div class="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
        <div class="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Tasks & Snags</div>
        <div class="text-xs font-semibold text-zinc-900 mt-0.5 truncate">
          {{ openSnags.length > 0 ? `${openSnags.length} Open (${urgentSnags.length} Urgent)` : 'All Clear' }}
        </div>
      </div>
    </div>
  </div>
</template>
