<script setup lang="ts">
import { ref } from 'vue'
import type { VaultItem } from '../types/property'
import { usePropertyStore } from '../stores/propertyStore'
import { Copy, Check, Eye, EyeOff, Key, Zap, Shield, Wifi, Hash, MapPin } from 'lucide-vue-next'

const props = defineProps<{
  item: VaultItem
  propertyName?: string
  showPropertyBadge?: boolean
}>()

const store = usePropertyStore()
const copied = ref(false)
const revealed = ref(!props.item.isSecret)

async function copyValue() {
  try {
    await navigator.clipboard.writeText(props.item.value)
    copied.value = true
    store.showToast(`Copied ${props.item.label} to clipboard!`, 'success')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Fallback copy
    const textarea = document.createElement('textarea')
    textarea.value = props.item.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    store.showToast(`Copied ${props.item.label} to clipboard!`, 'success')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'Meter': return Zap
    case 'PIN / Code': return Key
    case 'WiFi': return Wifi
    case 'Insurance': return Shield
    case 'Key Location': return MapPin
    default: return Hash
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'Meter': return 'text-amber-400 bg-amber-400/10 border-amber-500/20'
    case 'PIN / Code': return 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20'
    case 'WiFi': return 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20'
    case 'Insurance': return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20'
    case 'Key Location': return 'text-rose-400 bg-rose-400/10 border-rose-500/20'
    default: return 'text-slate-400 bg-slate-800 border-slate-700'
  }
}
</script>

<template>
  <div class="group relative flex flex-col justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-md">
    <div>
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <div :class="['p-1.5 rounded-lg border', getCategoryColor(item.category)]">
            <component :is="getCategoryIcon(item.category)" class="w-4 h-4" />
          </div>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {{ item.category }}
          </span>
        </div>

        <span
          v-if="showPropertyBadge && propertyName"
          class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[140px]"
        >
          {{ propertyName }}
        </span>
      </div>

      <h4 class="text-sm font-bold text-slate-100 tracking-tight mb-1">{{ item.label }}</h4>
      <p v-if="item.notes" class="text-xs text-slate-400 mb-3 line-clamp-2">{{ item.notes }}</p>
    </div>

    <!-- Value & Copy Actions -->
    <div class="mt-2 flex items-center justify-between gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono text-sm">
      <div class="truncate text-slate-200 font-medium select-all">
        <span v-if="revealed">{{ item.value }}</span>
        <span v-else class="tracking-widest text-slate-500">••••••••••••</span>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <!-- Reveal Toggle for Secrets -->
        <button
          v-if="item.isSecret"
          @click="revealed = !revealed"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          :title="revealed ? 'Hide' : 'Reveal'"
        >
          <EyeOff v-if="revealed" class="w-4 h-4" />
          <Eye v-else class="w-4 h-4" />
        </button>

        <!-- Copy Button -->
        <button
          @click="copyValue"
          class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95"
          :class="copied ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30'"
        >
          <Check v-if="copied" class="w-3.5 h-3.5" />
          <Copy v-else class="w-3.5 h-3.5" />
          <span>{{ copied ? 'Copied' : 'Copy' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
