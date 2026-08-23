<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Property, PropertyStatus, PropertyType } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X, Building2, Plus } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  property?: Property | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = usePropertyStore()

const statuses: PropertyStatus[] = ['Active', 'Rented', 'Maintenance', 'Vacant']
const types: PropertyType[] = ['Residential', 'Apartment', 'Commercial', 'Holiday Let', 'Mixed Use']

const form = ref({
  name: '',
  nickname: '',
  address: '',
  type: 'Residential' as PropertyType,
  status: 'Active' as PropertyStatus,
  units: [] as string[],
  rentalIncome: undefined as number | undefined,
  colorTheme: 'indigo',
  contactIds: [] as string[]
})

const newUnitInput = ref('')

function addUnit() {
  const val = newUnitInput.value.trim()
  if (val && !form.value.units.includes(val)) {
    form.value.units.push(val)
    newUnitInput.value = ''
  }
}

function removeUnit(index: number) {
  form.value.units.splice(index, 1)
}

watch(
  () => [props.show, props.property],
  () => {
    if (props.show) {
      if (props.property) {
        form.value = {
          name: props.property.name,
          nickname: props.property.nickname || '',
          address: props.property.address,
          type: props.property.type,
          status: props.property.status,
          units: props.property.units ? [...props.property.units] : [],
          rentalIncome: props.property.rentalIncome,
          colorTheme: props.property.colorTheme || 'indigo',
          contactIds: props.property.contactIds ? [...props.property.contactIds] : []
        }
      } else {
        form.value = {
          name: '',
          nickname: '',
          address: '',
          type: 'Residential',
          status: 'Active',
          units: ['Main Unit'],
          rentalIncome: undefined,
          colorTheme: 'indigo',
          contactIds: []
        }
      }
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.name.trim()) {
    store.showToast('Please enter property name', 'warning')
    return
  }
  if (!form.value.address.trim()) {
    store.showToast('Please enter physical address', 'warning')
    return
  }

  if (props.property) {
    store.updateProperty(props.property.id, {
      ...form.value,
      rentalIncome: form.value.rentalIncome ? Number(form.value.rentalIncome) : undefined
    })
  } else {
    store.addProperty({
      ...form.value,
      rentalIncome: form.value.rentalIncome ? Number(form.value.rentalIncome) : undefined
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
              <div class="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Building2 class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-white">
                  {{ property ? 'Edit Property' : 'Add New Property' }}
                </h3>
                <p class="text-xs text-slate-400">Manage units, address, and rental configuration</p>
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
            <!-- Property Name & Nickname -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Full Property Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g. Kloof Street Penthouse"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Short Nickname</label>
                <input
                  v-model="form.nickname"
                  type="text"
                  placeholder="e.g. Kloof Flat"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <!-- Address -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Physical Address</label>
              <input
                v-model="form.address"
                type="text"
                required
                placeholder="e.g. 42 Kloof St, Gardens, Cape Town, 8001"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <!-- Type & Status -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Property Type</label>
                <select
                  v-model="form.type"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Occupancy Status</label>
                <select
                  v-model="form.status"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>

            <!-- Rental Income -->
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Monthly Rental / Expected Income ({{ store.settings.currencySymbol }})
              </label>
              <input
                v-model.number="form.rentalIncome"
                type="number"
                step="any"
                placeholder="Optional (e.g. 25000)"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <!-- Units / Sections Tag List -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Units & Sub-Sections (e.g., Main House, Cottage, Garage, Flatlet B)
              </label>
              <div class="flex gap-2">
                <input
                  v-model="newUnitInput"
                  @keydown.enter.prevent="addUnit"
                  type="text"
                  placeholder="Add unit / room section (press Enter)"
                  class="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  @click="addUnit"
                  class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>

              <!-- Render Units Pills -->
              <div class="flex flex-wrap gap-2 pt-1">
                <span
                  v-for="(unit, index) in form.units"
                  :key="index"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                >
                  <span>{{ unit }}</span>
                  <button
                    type="button"
                    @click="removeUnit(index)"
                    class="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-3">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
              >
                {{ property ? 'Update Property' : 'Save Property' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
