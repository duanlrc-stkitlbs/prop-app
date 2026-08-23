<script setup lang="ts">
import { ref } from 'vue'
import { usePropertyStore } from '../stores/propertyStore'
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Database,
  Cloud,
  Coins,
  FileJson
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
  <div class="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div class="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
        <Settings class="w-6 h-6" />
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings & Data Management
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
          Backup, restore, currency preferences, and Cloudflare D1 integration
        </p>
      </div>
    </div>

    <!-- CARD 1: Backup & Export / Import -->
    <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <FileJson class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-bold text-white">Backup & Portability (Zero Data Loss)</h2>
          <p class="text-xs text-slate-400">Save a complete snapshot of all properties, expenses, snags, and vault codes</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Download Backup -->
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center gap-2 text-white font-bold text-sm">
              <Download class="w-4 h-4 text-emerald-400" />
              <span>Export JSON Backup</span>
            </div>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              Download your complete property database as an offline JSON file for safe-keeping or transfer.
            </p>
          </div>

          <button
            @click="handleDownloadBackup"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
          >
            <Download class="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        <!-- Import Backup -->
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center gap-2 text-white font-bold text-sm">
              <Upload class="w-4 h-4 text-indigo-400" />
              <span>Import JSON Backup</span>
            </div>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              Restore previously exported data into your browser storage.
            </p>

            <div class="flex items-center gap-4 mt-2">
              <label class="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input type="radio" v-model="importMode" value="replace" class="text-indigo-600 focus:ring-0" />
                <span>Replace All</span>
              </label>
              <label class="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input type="radio" v-model="importMode" value="merge" class="text-indigo-600 focus:ring-0" />
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
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-98 transition-all"
          >
            <Upload class="w-4 h-4" />
            <span>Select JSON File to Import</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CARD 2: Preferences & Currency -->
    <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Coins class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-bold text-white">Currency & Display Preferences</h2>
          <p class="text-xs text-slate-400">Configure currency symbol and localization formatting</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Select Currency</label>
          <select
            :value="store.settings.currencyCode"
            @change="handleCurrencyChange"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option v-for="c in currencyOptions" :key="c.code" :value="c.code">
              {{ c.name }}
            </option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Current Symbol Preview</label>
          <div class="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm">
            {{ store.formatCurrency(4200) }} (e.g. Levy or Expense)
          </div>
        </div>
      </div>
    </div>

    <!-- CARD 3: Cloudflare D1 & Pages Backend Integration -->
    <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Cloud class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white">Cloudflare D1 & Pages Functions</h2>
            <p class="text-xs text-slate-400">Serverless SQLite synchronization layer for Cloudflare edge</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-xs font-semibold text-emerald-300">Ready</span>
        </div>
      </div>

      <div class="space-y-3 pt-2">
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-200">Local Primary + Cloud D1 Bridge</span>
            <span class="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Offline-First
            </span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            All property data operates friction-free offline via Pinia + LocalStorage. When deployed to Cloudflare Pages with D1 bindings (<code class="text-indigo-300 font-mono">wrangler.toml</code> and <code class="text-indigo-300 font-mono">/functions/api/sync</code>), changes can be synchronized across devices automatically.
          </p>
        </div>

        <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <div class="text-xs font-bold text-slate-200">Enable Cloudflare D1 Cloud Sync</div>
            <div class="text-[11px] text-slate-400">Push/pull state from Cloudflare D1 SQLite database</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="store.settings.enableD1Sync"
              @change="store.updateSettings({ enableD1Sync: store.settings.enableD1Sync })"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between pt-2">
          <span class="text-xs text-slate-400">
            Last Sync: {{ store.settings.lastSyncTime ? new Date(store.settings.lastSyncTime).toLocaleString() : 'Never' }}
          </span>
          <button
            @click="handleD1Sync"
            :disabled="store.isSyncing"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition-all"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.isSyncing }" />
            <span>{{ store.isSyncing ? 'Syncing...' : 'Sync Now' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CARD 4: Database Reset to Realistic Seed Data -->
    <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Database class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-bold text-white">Reset to Realistic Seed Database</h2>
          <p class="text-xs text-slate-400">Restore default demo properties (Cape Town residences, rates, snags & contacts)</p>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2">
        <p class="text-xs text-slate-400 max-w-md">
          Helpful if you want to test the dashboard with realistic municipal rates, emergency plumbers, and snag tasks.
        </p>

        <button
          @click="confirmResetSeedData"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/40 text-slate-300 text-xs font-semibold border border-slate-700 active:scale-95 transition-all shrink-0"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Reset to Seed Data</span>
        </button>
      </div>
    </div>
  </div>
</template>
