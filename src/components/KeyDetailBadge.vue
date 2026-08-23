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
    store.showToast(`Copied ${props.item.label}`, 'success')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = props.item.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    store.showToast(`Copied ${props.item.label}`, 'success')
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
</script>

<template>
  <div class="flex flex-col justify-between p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
          <component :is="getCategoryIcon(item.category)" class="w-3 h-3 text-zinc-400" />
          <span>{{ item.category }}</span>
        </div>

        <span
          v-if="showPropertyBadge && propertyName"
          class="text-xs text-zinc-400 font-medium truncate max-w-[140px]"
        >
          {{ propertyName }}
        </span>
      </div>

      <h4 class="text-sm font-semibold text-zinc-100 tracking-tight">{{ item.label }}</h4>
      <p v-if="item.notes" class="text-xs text-zinc-400 line-clamp-2">{{ item.notes }}</p>
    </div>

    <!-- Value & Copy Actions -->
    <div class="mt-4 flex items-center justify-between gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 font-mono text-xs">
      <div class="truncate text-zinc-200 font-medium select-all">
        <span v-if="revealed">{{ item.value }}</span>
        <span v-else class="tracking-widest text-zinc-500">••••••••••••</span>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <button
          v-if="item.isSecret"
          @click="revealed = !revealed"
          class="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          :title="revealed ? 'Hide' : 'Reveal'"
        >
          <EyeOff v-if="revealed" class="w-3.5 h-3.5" />
          <Eye v-else class="w-3.5 h-3.5" />
        </button>

        <button
          @click="copyValue"
          class="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all active:scale-95"
          :class="copied ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700/60'"
        >
          <Check v-if="copied" class="w-3 h-3" />
          <Copy v-else class="w-3 h-3" />
          <span>{{ copied ? 'Copied' : 'Copy' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
