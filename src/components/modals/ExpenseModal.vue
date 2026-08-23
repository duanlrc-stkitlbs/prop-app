<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Expense, ExpenseCategory, ExpenseFrequency } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X, Receipt } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  expense?: Expense | null
  defaultPropertyId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = usePropertyStore()

const categories: ExpenseCategory[] = [
  'Rates & Taxes',
  'Water & Electricity',
  'Maintenance',
  'Body Corporate / Levies',
  'Insurance',
  'Internet & Comms',
  'Mortgage / Bond',
  'Garden & Pool',
  'Security',
  'Other'
]

const frequencies: ExpenseFrequency[] = ['Monthly', 'Quarterly', 'Annual', 'One-off']

const form = ref({
  propertyId: '',
  name: '',
  category: 'Rates & Taxes' as ExpenseCategory,
  amount: 0,
  frequency: 'Monthly' as ExpenseFrequency,
  dueDay: 1,
  isPaid: false,
  accountReference: '',
  notes: ''
})

watch(
  () => [props.show, props.expense, props.defaultPropertyId],
  () => {
    if (props.show) {
      if (props.expense) {
        form.value = {
          propertyId: props.expense.propertyId,
          name: props.expense.name,
          category: props.expense.category,
          amount: props.expense.amount,
          frequency: props.expense.frequency,
          dueDay: props.expense.dueDay || 1,
          isPaid: props.expense.isPaid,
          accountReference: props.expense.accountReference || '',
          notes: props.expense.notes || ''
        }
      } else {
        form.value = {
          propertyId: props.defaultPropertyId || store.properties[0]?.id || '',
          name: '',
          category: 'Rates & Taxes',
          amount: 0,
          frequency: 'Monthly',
          dueDay: 1,
          isPaid: false,
          accountReference: '',
          notes: ''
        }
      }
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.name.trim()) {
    store.showToast('Please enter an expense name', 'warning')
    return
  }
  if (!form.value.propertyId) {
    store.showToast('Please select a property', 'warning')
    return
  }

  if (props.expense) {
    store.updateExpense(props.expense.id, {
      ...form.value,
      amount: Number(form.value.amount)
    })
  } else {
    store.addExpense({
      ...form.value,
      amount: Number(form.value.amount)
    })
  }
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:scale-95"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Receipt class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-white">
                  {{ expense ? 'Edit Expense' : 'Add New Expense' }}
                </h3>
                <p class="text-xs text-slate-400">Track recurring maintenance, rates, taxes & bills</p>
              </div>
            </div>
            <button
              @click="emit('close')"
              class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Property Selector -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Property</label>
              <select
                v-model="form.propertyId"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option v-for="p in store.properties" :key="p.id" :value="p.id">
                  {{ p.name }} ({{ p.address }})
                </option>
              </select>
            </div>

            <!-- Expense Name -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Expense / Bill Title</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g. City Municipal Rates, Body Corporate Levy"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <!-- Category & Frequency -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
                <select
                  v-model="form.category"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Frequency</label>
                <select
                  v-model="form.frequency"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option v-for="freq in frequencies" :key="freq" :value="freq">{{ freq }}</option>
                </select>
              </div>
            </div>

            <!-- Amount & Due Day -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Amount ({{ store.settings.currencySymbol }})
                </label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Due Day of Month</label>
                <input
                  v-model.number="form.dueDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1 - 31"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <!-- Paid Status Toggle -->
            <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div class="text-xs font-bold text-slate-200">Paid for current cycle?</div>
                <div class="text-[11px] text-slate-400">Toggle whether this bill has been settled</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="form.isPaid" type="checkbox" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <!-- Account Reference -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Account / Reference #</label>
              <input
                v-model="form.accountReference"
                type="text"
                placeholder="e.g. CCT-992014881, Levy Acc #402"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
              />
            </div>

            <!-- Notes -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Notes / Instructions</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="e.g. Direct debit on 1st, invoice sent via email..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-3">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
              >
                {{ expense ? 'Update Expense' : 'Save Expense' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
