<script setup lang="ts">
import { usePropertyStore } from '../stores/propertyStore'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'

const store = usePropertyStore()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="store.toast"
        class="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 pointer-events-auto"
      >
        <div
          class="flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all"
          :class="{
            'bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40': store.toast.type === 'success',
            'bg-slate-900/95 border-amber-500/40 text-amber-100 shadow-amber-950/40': store.toast.type === 'warning',
            'bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-950/40': store.toast.type === 'error',
            'bg-slate-900/95 border-indigo-500/40 text-indigo-100 shadow-indigo-950/40': store.toast.type === 'info',
          }"
        >
          <div class="shrink-0">
            <CheckCircle2 v-if="store.toast.type === 'success'" class="w-5 h-5 text-emerald-400" />
            <AlertTriangle v-else-if="store.toast.type === 'warning'" class="w-5 h-5 text-amber-400" />
            <AlertCircle v-else-if="store.toast.type === 'error'" class="w-5 h-5 text-rose-400" />
            <Info v-else class="w-5 h-5 text-indigo-400" />
          </div>

          <p class="text-sm font-medium leading-tight flex-1">
            {{ store.toast.message }}
          </p>

          <button
            @click="store.toast = null"
            class="p-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
