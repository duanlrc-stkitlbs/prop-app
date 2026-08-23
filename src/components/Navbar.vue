<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertyStore } from '../stores/propertyStore'
import {
  Building2,
  Users,
  KeyRound,
  Settings,
  Plus,
  Receipt,
  Wrench,
  UserPlus,
  FileText
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = usePropertyStore()

const showQuickMenu = ref(false)

const navItems = [
  { name: 'Dashboard', path: '/', icon: Building2 },
  { name: 'Contacts', path: '/contacts', icon: Users },
  { name: 'Vault', path: '/vault', icon: KeyRound },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const urgentSnagsCount = computed(() => store.urgentSnags.length)

const emit = defineEmits<{
  (e: 'open-expense-modal'): void
  (e: 'open-snag-modal'): void
  (e: 'open-property-modal'): void
  (e: 'open-contact-modal'): void
  (e: 'open-vault-modal'): void
  (e: 'open-note-modal'): void
}>()

function triggerAction(action: 'expense' | 'snag' | 'property' | 'contact' | 'vault' | 'note') {
  showQuickMenu.value = false
  if (action === 'expense') emit('open-expense-modal')
  else if (action === 'snag') emit('open-snag-modal')
  else if (action === 'property') emit('open-property-modal')
  else if (action === 'contact') emit('open-contact-modal')
  else if (action === 'vault') emit('open-vault-modal')
  else if (action === 'note') emit('open-note-modal')
}
</script>

<template>
  <!-- Desktop Top Header -->
  <header class="hidden md:block sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand Logo -->
        <div class="flex items-center gap-3 cursor-pointer select-none" @click="router.push('/')">
          <div class="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold">
            <Building2 class="w-4 h-4 text-white" />
          </div>
          <div>
            <span class="text-base font-semibold tracking-tight text-zinc-950">
              PropPulse
            </span>
            <span class="block text-[10px] tracking-wider uppercase font-medium text-zinc-500 -mt-0.5">
              Property Management
            </span>
          </div>
        </div>

        <!-- Desktop Navigation Links -->
        <nav class="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="[
              route.path === item.path
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200 font-semibold'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
            ]"
          >
            <component :is="item.icon" class="w-3.5 h-3.5" />
            <span>{{ item.name }}</span>
            <span
              v-if="item.name === 'Dashboard' && urgentSnagsCount > 0"
              class="px-1.5 py-0.2 text-[10px] font-mono rounded bg-zinc-200 text-zinc-900 font-semibold"
            >
              {{ urgentSnagsCount }}
            </span>
          </RouterLink>
        </nav>

        <!-- Right Action Trigger -->
        <div class="flex items-center gap-4">
          <!-- Summary Pill -->
          <div class="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs shadow-xs">
            <div class="flex items-center gap-1.5 text-zinc-700">
              <span class="text-zinc-500">Monthly:</span>
              <span class="font-semibold text-zinc-950 font-mono">{{ store.formatCurrency(store.totalMonthlySpend) }}</span>
            </div>
            <div class="h-3 w-px bg-zinc-200"></div>
            <div class="text-zinc-600 font-medium">
              {{ urgentSnagsCount > 0 ? `${urgentSnagsCount} urgent tasks` : 'All tasks clear' }}
            </div>
          </div>

          <!-- Quick Action Button -->
          <div class="relative">
            <button
              @click="showQuickMenu = !showQuickMenu"
              class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition-all active:scale-98 shadow-sm"
            >
              <Plus class="w-3.5 h-3.5 transition-transform duration-150" :class="{ 'rotate-45': showQuickMenu }" />
              <span>Quick Add</span>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0 -translate-y-1"
              enter-to-class="transform scale-100 opacity-100 translate-y-0"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100 translate-y-0"
              leave-to-class="transform scale-95 opacity-0 -translate-y-1"
            >
              <div
                v-if="showQuickMenu"
                class="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-zinc-200 shadow-xl p-1.5 z-50 divide-y divide-zinc-100"
              >
                <div class="space-y-0.5 pb-1">
                  <button
                    @click="triggerAction('snag')"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-left"
                  >
                    <Wrench class="w-3.5 h-3.5 text-zinc-500" />
                    <span>Log Snag / Repair</span>
                  </button>

                  <button
                    @click="triggerAction('expense')"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-left"
                  >
                    <Receipt class="w-3.5 h-3.5 text-zinc-500" />
                    <span>Add Expense / Bill</span>
                  </button>
                </div>

                <div class="space-y-0.5 pt-1">
                  <button
                    @click="triggerAction('property')"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-left"
                  >
                    <Building2 class="w-3.5 h-3.5 text-zinc-500" />
                    <span>New Property</span>
                  </button>

                  <button
                    @click="triggerAction('contact')"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-left"
                  >
                    <UserPlus class="w-3.5 h-3.5 text-zinc-500" />
                    <span>New Contact</span>
                  </button>

                  <button
                    @click="triggerAction('vault')"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-left"
                  >
                    <KeyRound class="w-3.5 h-3.5 text-zinc-500" />
                    <span>Add Key / Meter Code</span>
                  </button>

                  <button
                    @click="triggerAction('note')"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-left"
                  >
                    <FileText class="w-3.5 h-3.5 text-zinc-500" />
                    <span>Quick Note</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Top Header -->
  <header class="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 py-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5" @click="router.push('/')">
        <div class="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center">
          <Building2 class="w-3.5 h-3.5 text-white" />
        </div>
        <span class="font-semibold text-sm tracking-tight text-zinc-950">PropPulse</span>
      </div>

      <button
        @click="showQuickMenu = !showQuickMenu"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold active:scale-95 transition-all shadow-xs"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Action</span>
      </button>
    </div>
  </header>

  <!-- Mobile Action Drawer -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div
        v-if="showQuickMenu"
        class="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs p-4 pb-24"
        @click.self="showQuickMenu = false"
      >
        <div class="w-full max-w-sm rounded-2xl bg-white border border-zinc-200 shadow-2xl p-4 space-y-3">
          <div class="w-8 h-1 bg-zinc-300 rounded-full mx-auto mb-1"></div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1">Quick Action</h3>

          <div class="grid grid-cols-2 gap-2">
            <button
              @click="triggerAction('snag')"
              class="flex flex-col items-start p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 active:scale-98 hover:bg-zinc-100"
            >
              <Wrench class="w-4 h-4 text-zinc-600 mb-2" />
              <span class="font-semibold text-xs text-zinc-950">Log Snag</span>
              <span class="text-[10px] text-zinc-500">Repairs & tasks</span>
            </button>

            <button
              @click="triggerAction('expense')"
              class="flex flex-col items-start p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 active:scale-98 hover:bg-zinc-100"
            >
              <Receipt class="w-4 h-4 text-zinc-600 mb-2" />
              <span class="font-semibold text-xs text-zinc-950">Add Expense</span>
              <span class="text-[10px] text-zinc-500">Rates, levies, bills</span>
            </button>

            <button
              @click="triggerAction('property')"
              class="flex flex-col items-start p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 active:scale-98 hover:bg-zinc-100"
            >
              <Building2 class="w-4 h-4 text-zinc-600 mb-2" />
              <span class="font-semibold text-xs text-zinc-950">New Property</span>
              <span class="text-[10px] text-zinc-500">Add listing</span>
            </button>

            <button
              @click="triggerAction('contact')"
              class="flex flex-col items-start p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 active:scale-98 hover:bg-zinc-100"
            >
              <UserPlus class="w-4 h-4 text-zinc-600 mb-2" />
              <span class="font-semibold text-xs text-zinc-950">New Contact</span>
              <span class="text-[10px] text-zinc-500">Service directory</span>
            </button>

            <button
              @click="triggerAction('vault')"
              class="flex flex-col items-start p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 active:scale-98 hover:bg-zinc-100"
            >
              <KeyRound class="w-4 h-4 text-zinc-600 mb-2" />
              <span class="font-semibold text-xs text-zinc-950">Vault Code</span>
              <span class="text-[10px] text-zinc-500">Meter # / PIN</span>
            </button>

            <button
              @click="triggerAction('note')"
              class="flex flex-col items-start p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 active:scale-98 hover:bg-zinc-100"
            >
              <FileText class="w-4 h-4 text-zinc-600 mb-2" />
              <span class="font-semibold text-xs text-zinc-950">Quick Note</span>
              <span class="text-[10px] text-zinc-500">Inspection / log</span>
            </button>
          </div>

          <button
            @click="showQuickMenu = false"
            class="w-full py-2.5 rounded-xl bg-zinc-100 text-zinc-700 font-medium text-xs hover:bg-zinc-200 active:scale-98"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Mobile Bottom Navigation Bar -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-2 py-1 pb-safe shadow-md">
    <div class="grid grid-cols-4 items-center justify-around">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors relative"
        :class="[
          route.path === item.path
            ? 'text-zinc-950 font-semibold'
            : 'text-zinc-500 hover:text-zinc-800'
        ]"
      >
        <div class="relative">
          <component
            :is="item.icon"
            class="w-4 h-4 transition-transform"
            :class="route.path === item.path ? 'scale-110 text-zinc-950' : 'text-zinc-500'"
          />
          <span
            v-if="item.name === 'Dashboard' && urgentSnagsCount > 0"
            class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-zinc-950"
          ></span>
        </div>
        <span class="text-[10px] mt-1 tracking-tight">{{ item.name }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
