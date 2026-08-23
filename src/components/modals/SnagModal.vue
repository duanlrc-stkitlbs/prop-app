<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Snag, SnagSeverity, SnagStatus } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  snag?: Snag | null
  defaultPropertyId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = usePropertyStore()

const statuses: SnagStatus[] = ['Open', 'In Progress', 'Resolved']
const commonAreas = ['Kitchen', 'Main Bathroom', 'En-Suite Bathroom', 'Bedroom 1', 'Bedroom 2', 'Living Area', 'Balcony / Patio', 'Roof / Gutters', 'Garden / Pool', 'Garage', 'Entrance Gate', 'Geyser / Utility']

const form = ref({
  propertyId: '',
  title: '',
  area: 'Kitchen',
  severity: 'Normal' as SnagSeverity,
  status: 'Open' as SnagStatus,
  assignedContactId: '',
  costEstimate: undefined as number | undefined,
  actualCost: undefined as number | undefined,
  notes: ''
})

watch(
  () => [props.show, props.snag, props.defaultPropertyId],
  () => {
    if (props.show) {
      if (props.snag) {
        form.value = {
          propertyId: props.snag.propertyId,
          title: props.snag.title,
          area: props.snag.area,
          severity: props.snag.severity,
          status: props.snag.status,
          assignedContactId: props.snag.assignedContactId || '',
          costEstimate: props.snag.costEstimate,
          actualCost: props.snag.actualCost,
          notes: props.snag.notes || ''
        }
      } else {
        form.value = {
          propertyId: props.defaultPropertyId || store.properties[0]?.id || '',
          title: '',
          area: 'Kitchen',
          severity: 'Normal',
          status: 'Open',
          assignedContactId: '',
          costEstimate: undefined,
          actualCost: undefined,
          notes: ''
        }
      }
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.title.trim()) {
    store.showToast('Please enter a snag description', 'warning')
    return
  }
  if (!form.value.propertyId) {
    store.showToast('Please select a property', 'warning')
    return
  }

  if (props.snag) {
    store.updateSnag(props.snag.id, {
      ...form.value,
      costEstimate: form.value.costEstimate ? Number(form.value.costEstimate) : undefined,
      actualCost: form.value.actualCost ? Number(form.value.actualCost) : undefined
    })
  } else {
    store.addSnag({
      ...form.value,
      costEstimate: form.value.costEstimate ? Number(form.value.costEstimate) : undefined,
      actualCost: form.value.actualCost ? Number(form.value.actualCost) : undefined
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
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/30 backdrop-blur-xs overflow-y-auto"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white border border-zinc-200/90 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-zinc-950">
                {{ snag ? 'Edit Snag / Task' : 'Log New Snag / Repair' }}
              </h3>
              <p class="text-xs text-zinc-500">Report repairs, maintenance, and punch list tasks</p>
            </div>
            <button
              @click="emit('close')"
              class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Property Selector -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Property</label>
              <select
                v-model="form.propertyId"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 shadow-xs"
              >
                <option v-for="p in store.properties" :key="p.id" :value="p.id">
                  {{ p.name }} ({{ p.address }})
                </option>
              </select>
            </div>

            <!-- Snag Title -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Task Description</label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="e.g. Geyser valve dripping, Gate remote broken"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900 shadow-xs"
              />
            </div>

            <!-- Severity Selector (Pills) -->
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Severity Level</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="form.severity = 'Urgent'"
                  class="py-2 px-3 rounded-lg border text-xs font-medium transition-all"
                  :class="form.severity === 'Urgent' ? 'bg-rose-50 text-rose-700 border-rose-200 font-semibold shadow-xs' : 'bg-zinc-50/80 text-zinc-700 border-zinc-200 hover:bg-zinc-100'"
                >
                  Urgent
                </button>

                <button
                  type="button"
                  @click="form.severity = 'Normal'"
                  class="py-2 px-3 rounded-lg border text-xs font-medium transition-all"
                  :class="form.severity === 'Normal' ? 'bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs' : 'bg-zinc-50/80 text-zinc-700 border-zinc-200 hover:bg-zinc-100'"
                >
                  Normal
                </button>

                <button
                  type="button"
                  @click="form.severity = 'Cosmetic'"
                  class="py-2 px-3 rounded-lg border text-xs font-medium transition-all"
                  :class="form.severity === 'Cosmetic' ? 'bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs' : 'bg-zinc-50/80 text-zinc-700 border-zinc-200 hover:bg-zinc-100'"
                >
                  Cosmetic
                </button>
              </div>
            </div>

            <!-- Area / Location -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Area / Location</label>
              <input
                v-model="form.area"
                type="text"
                list="area-suggestions"
                required
                placeholder="e.g. Kitchen, Master Bath, Balcony"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900 shadow-xs"
              />
              <datalist id="area-suggestions">
                <option v-for="a in commonAreas" :key="a" :value="a" />
              </datalist>
            </div>

            <!-- Status & Assigned Contractor -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Status</label>
                <select
                  v-model="form.status"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 shadow-xs"
                >
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Assign Contractor</label>
                <select
                  v-model="form.assignedContactId"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 shadow-xs"
                >
                  <option value="">-- None assigned --</option>
                  <option v-for="c in store.contacts" :key="c.id" :value="c.id">
                    {{ c.name }} ({{ c.role }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Cost Estimates -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Cost Estimate ({{ store.settings.currencySymbol }})
                </label>
                <input
                  v-model.number="form.costEstimate"
                  type="number"
                  step="any"
                  placeholder="Optional"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 font-mono text-sm focus:outline-none focus:border-zinc-900 shadow-xs"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Actual Cost ({{ store.settings.currencySymbol }})
                </label>
                <input
                  v-model.number="form.actualCost"
                  type="number"
                  step="any"
                  placeholder="When completed"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 font-mono text-sm focus:outline-none focus:border-zinc-900 shadow-xs"
                />
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Notes & Diagnostics</label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Details, part numbers, quotes..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-950 text-sm focus:outline-none focus:border-zinc-900 resize-none shadow-xs"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm transition-all active:scale-98 shadow-sm"
              >
                {{ snag ? 'Update Snag' : 'Save Snag' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
