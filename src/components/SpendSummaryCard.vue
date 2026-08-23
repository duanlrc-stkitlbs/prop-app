<script setup lang="ts">
import { computed } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import { Receipt, CheckCircle, AlertCircle, CheckCheck } from 'lucide-vue-next'

const props = defineProps<{
  propertyId?: string // Optional, if empty will calculate across all properties
  compact?: boolean
}>()

const store = usePropertyStore()

const totalSpend = computed(() => {
  if (props.propertyId) {
    return store.getPropertyMonthlySpend(props.propertyId)
  }
  return store.totalMonthlySpend
})

const paidSpend = computed(() => {
  if (props.propertyId) {
    return store.getPropertyPaidMonthlySpend(props.propertyId)
  }
  return store.totalPaidMonthlySpend
})

const pendingSpend = computed(() => {
  return Math.max(0, totalSpend.value - paidSpend.value)
})

const paidProgress = computed(() => {
  if (totalSpend.value <= 0) return 0
  return Math.min(100, Math.round((paidSpend.value / totalSpend.value) * 100))
})

const pendingExpensesCount = computed(() => {
  const list = props.propertyId
    ? store.getExpensesByProperty(props.propertyId)
    : store.expenses
  return list.filter(e => !e.isPaid).length
})

function markAllPaid() {
  store.markAllExpensesPaid(props.propertyId)
}
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-5 sm:p-6 shadow-xl">
    <!-- Background Glow Accent -->
    <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Receipt class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
              {{ propertyId ? 'Property Monthly Spend' : 'Committed Monthly Spend' }}
            </h3>
            <div class="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {{ store.formatCurrency(totalSpend) }}
              <span class="text-xs text-slate-400 font-sans font-normal">/ mo</span>
            </div>
          </div>
        </div>

        <button
          v-if="pendingExpensesCount > 0"
          @click="markAllPaid"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all active:scale-95 shrink-0"
        >
          <CheckCheck class="w-4 h-4" />
          <span class="hidden sm:inline">Mark All Paid</span>
          <span class="sm:hidden">All Paid</span>
        </button>
      </div>

      <!-- Paid vs Pending Progress Bar -->
      <div class="space-y-2 mt-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
        <div class="flex items-center justify-between text-xs font-semibold">
          <div class="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle class="w-3.5 h-3.5" />
            <span>Paid: {{ store.formatCurrency(paidSpend) }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-amber-400">
            <AlertCircle class="w-3.5 h-3.5" />
            <span>Pending: {{ store.formatCurrency(pendingSpend) }}</span>
          </div>
        </div>

        <!-- Progress Track -->
        <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
            :style="{ width: `${paidProgress}%` }"
          ></div>
        </div>

        <div class="flex justify-between items-center text-[11px] text-slate-400">
          <span>{{ paidProgress }}% paid for this cycle</span>
          <span v-if="pendingExpensesCount > 0" class="text-amber-400 font-medium">
            {{ pendingExpensesCount }} bill{{ pendingExpensesCount === 1 ? '' : 's' }} pending
          </span>
          <span v-else class="text-emerald-400 font-medium">
            All bills settled
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
