<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Expense, ExpenseCategory, ExpenseFrequency } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X } from 'lucide-vue-next'

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
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-98"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-98"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-zinc-100">
                {{ expense ? 'Edit Expense' : 'Add New Expense' }}
              </h3>
              <p class="text-xs text-zinc-400">Track recurring maintenance, rates, taxes & bills</p>
            </div>
            <button
              @click="emit('close')"
              class="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Property Selector -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Property</label>
              <select
                v-model="form.propertyId"
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
              >
                <option v-for="p in store.properties" :key="p.id" :value="p.id">
                  {{ p.name }} ({{ p.address }})
                </option>
              </select>
            </div>

            <!-- Expense Name -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Expense Title</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g. City Municipal Rates, Body Corporate Levy"
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <!-- Category & Frequency -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Category</label>
                <select
                  v-model="form.category"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Frequency</label>
                <select
                  v-model="form.frequency"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option v-for="freq in frequencies" :key="freq" :value="freq">{{ freq }}</option>
                </select>
              </div>
            </div>

            <!-- Amount & Due Day -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Amount ({{ store.settings.currencySymbol }})
                </label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Due Day</label>
                <input
                  v-model.number="form.dueDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1 - 31"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <!-- Paid Status Toggle -->
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <div class="text-xs font-medium text-zinc-200">Paid for current cycle?</div>
                <div class="text-[11px] text-zinc-500">Toggle if settled this cycle</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="form.isPaid" type="checkbox" class="sr-only peer" />
                <div class="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-200"></div>
              </label>
            </div>

            <!-- Account Reference -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Account / Reference #</label>
              <input
                v-model="form.accountReference"
                type="text"
                placeholder="e.g. CCT-992014881, Levy Acc #402"
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>

            <!-- Notes -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Notes</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="e.g. Direct debit on 1st..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 resize-none"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm transition-all active:scale-98"
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
