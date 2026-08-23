<script setup lang="ts">
import { ref, watch } from 'vue'
import type { VaultItem, VaultCategory } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  vaultItem?: VaultItem | null
  defaultPropertyId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = usePropertyStore()

const categories: VaultCategory[] = ['Meter', 'PIN / Code', 'Account #', 'WiFi', 'Insurance', 'Key Location', 'Other']

const form = ref({
  propertyId: '',
  label: '',
  value: '',
  category: 'Meter' as VaultCategory,
  isSecret: false,
  notes: ''
})

watch(
  () => [props.show, props.vaultItem, props.defaultPropertyId],
  () => {
    if (props.show) {
      if (props.vaultItem) {
        form.value = {
          propertyId: props.vaultItem.propertyId,
          label: props.vaultItem.label,
          value: props.vaultItem.value,
          category: props.vaultItem.category,
          isSecret: !!props.vaultItem.isSecret,
          notes: props.vaultItem.notes || ''
        }
      } else {
        form.value = {
          propertyId: props.defaultPropertyId || store.properties[0]?.id || '',
          label: '',
          value: '',
          category: 'Meter',
          isSecret: false,
          notes: ''
        }
      }
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.label.trim()) {
    store.showToast('Please enter detail label', 'warning')
    return
  }
  if (!form.value.value.trim()) {
    store.showToast('Please enter the code / value', 'warning')
    return
  }
  if (!form.value.propertyId) {
    store.showToast('Please select property', 'warning')
    return
  }

  if (props.vaultItem) {
    store.updateVaultItem(props.vaultItem.id, { ...form.value })
  } else {
    store.addVaultItem({ ...form.value })
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
                {{ vaultItem ? 'Edit Vault Item' : 'Add Key Detail to Vault' }}
              </h3>
              <p class="text-xs text-zinc-400">Meter numbers, gate codes, Wi-Fi keys, account refs</p>
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

            <!-- Label & Category -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Label / Name</label>
                <input
                  v-model="form.label"
                  type="text"
                  required
                  placeholder="e.g. Prepaid Electricity Meter"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Category</label>
                <select
                  v-model="form.category"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <!-- Value / Code -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Value / Code</label>
              <input
                v-model="form.value"
                type="text"
                required
                placeholder="e.g. 04-2198-4921-7 or *7492#"
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <!-- Secret / Masking Toggle -->
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <div class="text-xs font-medium text-zinc-200">Mask as Secret / PIN?</div>
                <div class="text-[11px] text-zinc-500">Hides value by default with eye reveal</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="form.isSecret" type="checkbox" class="sr-only peer" />
                <div class="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-200"></div>
              </label>
            </div>

            <!-- Notes -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Notes / Location</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="e.g. In hallway cupboard..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 resize-none"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm transition-all active:scale-98"
              >
                {{ vaultItem ? 'Update Vault Item' : 'Save to Vault' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
