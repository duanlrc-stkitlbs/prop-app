<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import type { VaultItem } from '../types/property'
import KeyDetailBadge from '../components/KeyDetailBadge.vue'
import VaultModal from '../components/modals/VaultModal.vue'
import {
  Search,
  Plus
} from 'lucide-vue-next'

const store = usePropertyStore()

const searchQuery = ref('')
const selectedCategory = ref<string>('All')
const selectedPropertyId = ref<string>('All')

const categories = ['All', 'Meter', 'PIN / Code', 'WiFi', 'Account #', 'Insurance', 'Key Location', 'Other']

const showVaultModal = ref(false)
const activeVaultItem = ref<VaultItem | null>(null)

function openNewVaultModal() {
  activeVaultItem.value = null
  showVaultModal.value = true
}

const filteredVaultItems = computed(() => {
  let list = store.vault

  if (selectedCategory.value !== 'All') {
    list = list.filter(v => v.category === selectedCategory.value)
  }

  if (selectedPropertyId.value !== 'All') {
    list = list.filter(v => v.propertyId === selectedPropertyId.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(v =>
      v.label.toLowerCase().includes(q) ||
      v.value.toLowerCase().includes(q) ||
      (v.notes && v.notes.toLowerCase().includes(q))
    )
  }

  return list
})
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Key Details & Meter Vault
        </h1>
        <p class="text-xs sm:text-sm text-zinc-400">
          Prepaid meters, gate PINs, Wi-Fi keys, and utility references with 1-tap copy
        </p>
      </div>

      <button
        @click="openNewVaultModal"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-all active:scale-98 shrink-0 self-start sm:self-center"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Key Detail</span>
      </button>
    </div>

    <!-- Search & Filter Controls -->
    <div class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Search Input -->
        <div class="relative sm:col-span-2">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search meters, gate codes, WiFi passwords, account numbers..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        <!-- Property Filter Selector -->
        <select
          v-model="selectedPropertyId"
          class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-zinc-500"
        >
          <option value="All">All Properties ({{ store.properties.length }})</option>
          <option v-for="p in store.properties" :key="p.id" :value="p.id">
            {{ p.nickname || p.name }}
          </option>
        </select>
      </div>

      <!-- Category Filter Chips -->
      <div class="flex gap-1.5 overflow-x-auto pb-1">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border"
          :class="[
            selectedCategory === cat
              ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800/60 hover:text-zinc-200'
          ]"
        >
          <span>{{ cat }}</span>
        </button>
      </div>
    </div>

    <!-- Vault Grid -->
    <div v-if="filteredVaultItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <KeyDetailBadge
        v-for="item in filteredVaultItems"
        :key="item.id"
        :item="item"
        :property-name="store.getPropertyById(item.propertyId)?.nickname || store.getPropertyById(item.propertyId)?.name"
        :show-property-badge="true"
      />
    </div>

    <div
      v-else
      class="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center max-w-md mx-auto"
    >
      <h3 class="text-sm font-semibold text-zinc-200">No Vault Items Found</h3>
      <p class="text-xs text-zinc-400 mt-1">Try changing your search term or category filter.</p>
      <button
        @click="searchQuery = ''; selectedCategory = 'All'; selectedPropertyId = 'All'"
        class="mt-4 px-3.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-medium hover:bg-zinc-700"
      >
        Clear Filters
      </button>
    </div>

    <!-- Modal -->
    <VaultModal
      :show="showVaultModal"
      :vault-item="activeVaultItem"
      @close="showVaultModal = false"
    />
  </div>
</template>
