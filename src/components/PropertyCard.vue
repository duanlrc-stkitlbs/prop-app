<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Property } from '../types/property'
import { usePropertyStore } from '../stores/propertyStore'
import {
  MapPin,
  Wrench,
  Receipt,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-vue-next'

const props = defineProps<{
  property: Property
}>()

const router = useRouter()
const store = usePropertyStore()

const monthlySpend = computed(() => store.getPropertyMonthlySpend(props.property.id))
const openSnags = computed(() => store.getOpenSnagsByProperty(props.property.id))
const urgentSnags = computed(() => openSnags.value.filter(s => s.severity === 'Urgent'))

function getStatusColor(status: string) {
  switch (status) {
    case 'Active': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'Rented': return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    case 'Maintenance': return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    case 'Vacant': return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    default: return 'bg-slate-800 text-slate-300 border-slate-700'
  }
}
</script>

<template>
  <div
    @click="router.push(`/properties/${property.id}`)"
    class="group cursor-pointer flex flex-col justify-between p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-200 shadow-lg hover:shadow-indigo-950/20 active:scale-[0.99]"
  >
    <div>
      <!-- Top Row: Type, Status, & Arrow -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            {{ property.type }}
          </span>
          <span :class="['text-xs font-semibold px-2.5 py-0.5 rounded-full border', getStatusColor(property.status)]">
            {{ property.status }}
          </span>
        </div>

        <div class="p-1.5 rounded-xl bg-slate-800/60 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
          <ChevronRight class="w-4 h-4" />
        </div>
      </div>

      <!-- Property Name & Address -->
      <h3 class="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors tracking-tight">
        {{ property.name }}
      </h3>
      <p class="flex items-center gap-1.5 text-xs text-slate-400 mt-1 mb-3 truncate">
        <MapPin class="w-3.5 h-3.5 shrink-0 text-slate-500" />
        <span class="truncate">{{ property.address }}</span>
      </p>

      <!-- Units / Sections preview -->
      <div v-if="property.units && property.units.length > 0" class="mb-4">
        <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
          <Layers class="w-3.5 h-3.5 text-slate-500" />
          <span class="font-medium">{{ property.units.length }} Unit{{ property.units.length === 1 ? '' : 's' }} / Sections:</span>
        </div>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="(unit, idx) in property.units.slice(0, 2)"
            :key="idx"
            class="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 truncate max-w-[200px]"
          >
            {{ unit }}
          </span>
          <span
            v-if="property.units.length > 2"
            class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-semibold"
          >
            +{{ property.units.length - 2 }} more
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom Stat Pill Row -->
    <div class="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 mt-2">
      <!-- Monthly Spend -->
      <div class="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
        <div class="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Receipt class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <div class="text-[10px] text-slate-400 font-semibold uppercase">Monthly</div>
          <div class="text-xs font-bold text-slate-100 font-mono truncate">
            {{ store.formatCurrency(monthlySpend) }}
          </div>
        </div>
      </div>

      <!-- Snag indicator -->
      <div
        class="flex items-center gap-2 p-2.5 rounded-2xl border transition-colors"
        :class="[
          urgentSnags.length > 0
            ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            : openSnags.length > 0
            ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            : 'bg-slate-950/70 border-slate-800 text-emerald-400'
        ]"
      >
        <div
          class="p-1.5 rounded-xl"
          :class="[
            urgentSnags.length > 0
              ? 'bg-rose-500/20 text-rose-400 animate-pulse'
              : openSnags.length > 0
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-emerald-500/20 text-emerald-400'
          ]"
        >
          <AlertTriangle v-if="urgentSnags.length > 0" class="w-4 h-4" />
          <Wrench v-else-if="openSnags.length > 0" class="w-4 h-4" />
          <ShieldCheck v-else class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <div class="text-[10px] font-semibold uppercase opacity-80">Snags</div>
          <div class="text-xs font-bold truncate">
            {{ openSnags.length > 0 ? `${openSnags.length} Open (${urgentSnags.length} Urgent)` : 'All Clear' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
