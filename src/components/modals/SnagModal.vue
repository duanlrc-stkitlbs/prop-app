<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Snag, SnagSeverity, SnagStatus } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X, Wrench } from 'lucide-vue-next'

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
              <div class="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Wrench class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-white">
                  {{ snag ? 'Edit Snag / Task' : 'Log New Snag / Repair' }}
                </h3>
                <p class="text-xs text-slate-400">Report repairs, maintenance, and punch list tasks</p>
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
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <option v-for="p in store.properties" :key="p.id" :value="p.id">
                  {{ p.name }} ({{ p.address }})
                </option>
              </select>
            </div>

            <!-- Snag Title -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Task / Problem Description</label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="e.g. Geyser valve dripping, Gate remote broken, Fix tile"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>

            <!-- Severity Selector (Pills) -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Severity Level</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="form.severity = 'Urgent'"
                  class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95"
                  :class="form.severity === 'Urgent' ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'"
                >
                  <span class="w-2 h-2 rounded-full bg-rose-400" :class="form.severity === 'Urgent' ? 'animate-pulse' : ''"></span>
                  <span>Urgent</span>
                </button>

                <button
                  type="button"
                  @click="form.severity = 'Normal'"
                  class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95"
                  :class="form.severity === 'Normal' ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'"
                >
                  <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>Normal</span>
                </button>

                <button
                  type="button"
                  @click="form.severity = 'Cosmetic'"
                  class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95"
                  :class="form.severity === 'Cosmetic' ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'"
                >
                  <span class="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>Cosmetic</span>
                </button>
              </div>
            </div>

            <!-- Area / Room -->
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Area / Location</label>
              </div>
              <input
                v-model="form.area"
                type="text"
                list="area-suggestions"
                required
                placeholder="e.g. Kitchen, Master Bath, Balcony"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
              <datalist id="area-suggestions">
                <option v-for="a in commonAreas" :key="a" :value="a" />
              </datalist>
            </div>

            <!-- Status & Assigned Contractor -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
                <select
                  v-model="form.status"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                >
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Assign Contractor</label>
                <select
                  v-model="form.assignedContactId"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
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
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cost Estimate ({{ store.settings.currencySymbol }})
                </label>
                <input
                  v-model.number="form.costEstimate"
                  type="number"
                  step="any"
                  placeholder="Optional"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actual Cost ({{ store.settings.currencySymbol }})
                </label>
                <input
                  v-model.number="form.actualCost"
                  type="number"
                  step="any"
                  placeholder="When completed"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Notes & Diagnostics</label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Details, part numbers, contractor quotes..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-3">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all active:scale-98"
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
