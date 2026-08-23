<script setup lang="ts">
import { ref } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import {
  Download,
  Upload,
  RefreshCw
} from 'lucide-vue-next'

const store = usePropertyStore()

const fileInput = ref<HTMLInputElement | null>(null)
const importMode = ref<'replace' | 'merge'>('replace')
const isImporting = ref(false)

const currencyOptions = [
  { symbol: 'R', code: 'ZAR', name: 'South African Rand (R)' },
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar (C$)' }
]

function handleCurrencyChange(e: Event) {
  const code = (e.target as HTMLSelectElement).value
  const opt = currencyOptions.find(o => o.code === code)
  if (opt) {
    store.updateSettings({
      currencyCode: opt.code,
      currencySymbol: opt.symbol
    })
  }
}

function handleDownloadBackup() {
  store.downloadBackupFile()
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    if (text) {
      isImporting.value = true
      store.importDataJson(text, importMode.value)
      isImporting.value = false
      if (fileInput.value) fileInput.value.value = ''
    }
  }
  reader.readAsText(file)
}

function confirmResetSeedData() {
  if (confirm('Reset all properties, expenses, snags, contacts, and vault items to default seed data? Any unsaved custom entries will be replaced.')) {
    store.resetToSeedData(true)
  }
}

function handleD1Sync() {
  store.syncWithCloudflareD1()
}
</script>

<template>
  <div class="space-y-8 max-w-4xl mx-auto px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
        Settings & Data
      </h1>
      <p class="text-xs sm:text-sm text-zinc-500">
        Backup, restore, currency preferences, and Cloudflare D1 synchronization
      </p>
    </div>

    <!-- CARD 1: Backup & Export / Import -->
    <div class="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200/90 space-y-6 shadow-xs">
      <div>
        <h2 class="text-base font-semibold text-zinc-950">Backup & Portability</h2>
        <p class="text-xs text-zinc-500 mt-0.5">Export a snapshot of all properties, expenses, snags, and vault codes</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Download Backup -->
        <div class="p-5 rounded-xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center gap-2 text-zinc-900 font-medium text-xs sm:text-sm">
              <Download class="w-4 h-4 text-zinc-700" />
              <span>Export JSON Backup</span>
            </div>
            <p class="text-xs text-zinc-500 mt-1 leading-relaxed">
              Download your complete property database as an offline JSON file.
            </p>
          </div>

          <button
            @click="handleDownloadBackup"
            class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm active:scale-98 transition-all"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>

        <!-- Import Backup -->
        <div class="p-5 rounded-xl bg-zinc-50/80 border border-zinc-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center gap-2 text-zinc-900 font-medium text-xs sm:text-sm">
              <Upload class="w-4 h-4 text-zinc-700" />
              <span>Import JSON Backup</span>
            </div>
            <p class="text-xs text-zinc-500 mt-1 leading-relaxed">
              Restore previously exported data into your browser.
            </p>

            <div class="flex items-center gap-4 mt-2">
              <label class="inline-flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                <input type="radio" v-model="importMode" value="replace" class="text-zinc-900 focus:ring-0" />
                <span>Replace All</span>
              </label>
              <label class="inline-flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                <input type="radio" v-model="importMode" value="merge" class="text-zinc-900 focus:ring-0" />
                <span>Merge</span>
              </label>
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="handleFileUpload"
          />

          <button
            @click="triggerFileInput"
            class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-medium border border-zinc-200/90 active:scale-98 transition-all shadow-xs"
          >
            <Upload class="w-3.5 h-3.5" />
            <span>Select JSON File</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CARD 2: Preferences & Currency -->
    <div class="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200/90 space-y-4 shadow-xs">
      <div>
        <h2 class="text-base font-semibold text-zinc-950">Currency & Formatting</h2>
        <p class="text-xs text-zinc-500 mt-0.5">Select your primary currency symbol</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div class="space-y-1">
          <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Currency</label>
          <select
            :value="store.settings.currencyCode"
            @change="handleCurrencyChange"
            class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 shadow-xs"
          >
            <option v-for="c in currencyOptions" :key="c.code" :value="c.code">
              {{ c.name }}
            </option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-medium uppercase tracking-wider text-zinc-500">Preview</label>
          <div class="px-3.5 py-2.5 rounded-xl bg-zinc-50/80 border border-zinc-200/80 text-zinc-950 font-mono text-sm">
            {{ store.formatCurrency(4500) }} (Sample expense)
          </div>
        </div>
      </div>
    </div>

    <!-- CARD 3: Cloudflare D1 Synchronization -->
    <div class="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200/90 space-y-4 shadow-xs">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-950">Cloudflare D1 Cloud Sync</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Serverless SQLite synchronization layer</p>
        </div>

        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100/80 border border-zinc-200 text-xs font-mono text-zinc-700 font-medium">
          Connected
        </div>
      </div>

      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80">
          <div>
            <div class="text-xs font-medium text-zinc-900">Enable Cloud D1 Synchronization</div>
            <div class="text-[11px] text-zinc-500">Synchronize data changes with remote SQLite table</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="store.settings.enableD1Sync"
              @change="store.updateSettings({ enableD1Sync: store.settings.enableD1Sync })"
              class="sr-only peer"
            />
            <div class="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
          </label>
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-xs text-zinc-500 font-mono">
            Last Sync: {{ store.settings.lastSyncTime ? new Date(store.settings.lastSyncTime).toLocaleString() : 'Never' }}
          </span>
          <button
            @click="handleD1Sync"
            :disabled="store.isSyncing"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-medium border border-zinc-200/90 active:scale-98 transition-all shadow-xs"
          >
            <RefreshCw class="w-3.5 h-3.5 text-zinc-700" :class="{ 'animate-spin': store.isSyncing }" />
            <span>{{ store.isSyncing ? 'Syncing...' : 'Sync Now' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CARD 4: Database Reset -->
    <div class="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200/90 space-y-4 shadow-xs">
      <div>
        <h2 class="text-base font-semibold text-zinc-950">Seed Database Reset</h2>
        <p class="text-xs text-zinc-500 mt-0.5">Reset demo properties, municipal rates, snags & contacts</p>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <p class="text-xs text-zinc-500 max-w-md">
          Restores sample properties (Penthouse, Garden Villa & Family Homestead) with realistic expenses and contractors.
        </p>

        <button
          @click="confirmResetSeedData"
          class="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-700 hover:text-zinc-950 text-xs font-medium active:scale-98 transition-all shrink-0 shadow-xs"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Reset to Seed Data</span>
        </button>
      </div>
    </div>
  </div>
</template>
