<script setup lang="ts">
import { computed } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import { CheckCheck } from 'lucide-vue-next'

const props = defineProps<{
  propertyId?: string
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
  <div class="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {{ propertyId ? 'Property Monthly Spend' : 'Committed Monthly Spend' }}
          </span>
        </div>
        <div class="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-mono">
          {{ store.formatCurrency(totalSpend) }}
          <span class="text-sm font-normal text-zinc-400 font-sans">/ month</span>
        </div>
      </div>

      <button
        v-if="pendingExpensesCount > 0"
        @click="markAllPaid"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 transition-all active:scale-98 shrink-0 self-start sm:self-center"
      >
        <CheckCheck class="w-4 h-4 text-zinc-300" />
        <span>Mark Cycle as Settled</span>
      </button>
    </div>

    <!-- Progress & Metrics -->
    <div class="space-y-3 pt-4 border-t border-zinc-800/80">
      <div class="flex items-center justify-between text-xs font-medium">
        <div class="text-zinc-300 font-mono">
          Settled: <span class="text-white">{{ store.formatCurrency(paidSpend) }}</span>
        </div>
        <div class="text-zinc-400 font-mono">
          Pending: <span class="text-zinc-200">{{ store.formatCurrency(pendingSpend) }}</span>
        </div>
      </div>

      <!-- Minimal Track -->
      <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex">
        <div
          class="h-full bg-zinc-200 transition-all duration-300 ease-out"
          :style="{ width: `${paidProgress}%` }"
        ></div>
      </div>

      <div class="flex justify-between items-center text-xs text-zinc-500">
        <span>{{ paidProgress }}% of monthly commitments paid</span>
        <span v-if="pendingExpensesCount > 0" class="text-zinc-300 font-medium">
          {{ pendingExpensesCount }} payment{{ pendingExpensesCount === 1 ? '' : 's' }} outstanding
        </span>
        <span v-else class="text-zinc-400">
          All accounts reconciled
        </span>
      </div>
    </div>
  </div>
</template>
