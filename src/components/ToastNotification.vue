<script setup lang="ts">
import { usePropertyStore } from '../stores/propertyStore'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'

const store = usePropertyStore()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transform ease-out duration-150 transition"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-98"
    >
      <div
        v-if="store.toast"
        class="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-sm z-50 pointer-events-auto"
      >
        <div class="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-zinc-200/90 shadow-xl text-zinc-950">
          <div class="shrink-0">
            <CheckCircle2 v-if="store.toast.type === 'success'" class="w-4 h-4 text-emerald-600" />
            <AlertTriangle v-else-if="store.toast.type === 'warning'" class="w-4 h-4 text-amber-500" />
            <AlertCircle v-else-if="store.toast.type === 'error'" class="w-4 h-4 text-rose-600" />
            <Info v-else class="w-4 h-4 text-sky-600" />
          </div>

          <p class="text-xs font-medium leading-tight flex-1 text-zinc-900">
            {{ store.toast.message }}
          </p>

          <button
            @click="store.toast = null"
            class="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
