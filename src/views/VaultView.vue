<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import type { VaultItem } from '../types/property'
import KeyDetailBadge from '../components/KeyDetailBadge.vue'
import VaultModal from '../components/modals/VaultModal.vue'
import {
  KeyRound,
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
  <div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <KeyRound class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Key Details & Meter Vault
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
            Prepaid meters, gate PINs, Wi-Fi keys, and utility references with 1-tap copy
          </p>
        </div>
      </div>

      <button
        @click="openNewVaultModal"
        class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/30 transition-all active:scale-95 shrink-0"
      >
        <Plus class="w-4 h-4" />
        <span>Add Key Detail</span>
      </button>
    </div>

    <!-- Search & Filter Controls -->
    <div class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Search Input -->
        <div class="relative sm:col-span-2">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search meters, gate codes, WiFi passwords, account numbers..."
            class="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
          />
        </div>

        <!-- Property Filter Selector -->
        <select
          v-model="selectedPropertyId"
          class="w-full px-3.5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="All">All Properties ({{ store.properties.length }})</option>
          <option v-for="p in store.properties" :key="p.id" :value="p.id">
            {{ p.nickname || p.name }}
          </option>
        </select>
      </div>

      <!-- Category Filter Chips -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border"
          :class="[
            selectedCategory === cat
              ? 'bg-amber-600 text-white border-amber-500 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
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
      class="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center max-w-md mx-auto"
    >
      <KeyRound class="w-10 h-10 text-slate-500 mx-auto mb-3" />
      <h3 class="text-base font-bold text-slate-200">No Vault Items Found</h3>
      <p class="text-xs text-slate-400 mt-1">Try changing your search term or category filter.</p>
      <button
        @click="searchQuery = ''; selectedCategory = 'All'; selectedPropertyId = 'All'"
        class="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
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
