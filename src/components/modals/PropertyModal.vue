<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Property, PropertyStatus, PropertyType } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X, Plus } from 'lucide-vue-next'

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
  colorTheme: 'zinc',
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
          colorTheme: props.property.colorTheme || 'zinc',
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
          colorTheme: 'zinc',
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
                {{ property ? 'Edit Property' : 'Add New Property' }}
              </h3>
              <p class="text-xs text-zinc-400">Manage units, address, and rental details</p>
            </div>
            <button
              @click="emit('close')"
              class="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Name & Nickname -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Property Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g. Kloof Street Penthouse"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Short Nickname</label>
                <input
                  v-model="form.nickname"
                  type="text"
                  placeholder="e.g. City Penthouse"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <!-- Address -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Address</label>
              <input
                v-model="form.address"
                type="text"
                required
                placeholder="e.g. 42 Kloof St, Gardens, Cape Town"
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <!-- Type & Status -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Property Type</label>
                <select
                  v-model="form.type"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Occupancy Status</label>
                <select
                  v-model="form.status"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>

            <!-- Rental Income -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Monthly Expected Income ({{ store.settings.currencySymbol }})
              </label>
              <input
                v-model.number="form.rentalIncome"
                type="number"
                step="any"
                placeholder="Optional"
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <!-- Units / Sections -->
            <div class="space-y-2">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Units & Sub-Sections (e.g., Main House, Cottage B)
              </label>
              <div class="flex gap-2">
                <input
                  v-model="newUnitInput"
                  @keydown.enter.prevent="addUnit"
                  type="text"
                  placeholder="Add unit (press Enter)"
                  class="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="button"
                  @click="addUnit"
                  class="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-colors"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>

              <!-- Render Units Pills -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span
                  v-for="(unit, index) in form.units"
                  :key="index"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-950 text-zinc-300 border border-zinc-800"
                >
                  <span>{{ unit }}</span>
                  <button
                    type="button"
                    @click="removeUnit(index)"
                    class="text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm transition-all active:scale-98"
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
