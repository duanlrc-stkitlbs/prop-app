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
  <header class="hidden md:block sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand Logo -->
        <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Building2 class="w-5 h-5 text-white" />
          </div>
          <div>
            <span class="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              PropPulse
            </span>
            <span class="block text-[10px] tracking-wider uppercase font-semibold text-indigo-400 -mt-1">
              Personal Property Manager
            </span>
          </div>
        </div>

        <!-- Desktop Navigation Links -->
        <nav class="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
            :class="[
              route.path === item.path
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span>{{ item.name }}</span>
            <span
              v-if="item.name === 'Dashboard' && urgentSnagsCount > 0"
              class="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40"
            >
              {{ urgentSnagsCount }}
            </span>
          </RouterLink>
        </nav>

        <!-- Right Quick Action Trigger -->
        <div class="relative flex items-center gap-3">
          <!-- Summary Pill -->
          <div class="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
            <div class="flex items-center gap-1.5 text-slate-300">
              <span class="text-slate-400 font-medium">Monthly:</span>
              <span class="font-bold text-slate-100 font-mono">{{ store.formatCurrency(store.totalMonthlySpend) }}</span>
            </div>
            <div class="h-3.5 w-px bg-slate-700"></div>
            <div class="flex items-center gap-1.5" :class="urgentSnagsCount > 0 ? 'text-amber-400' : 'text-emerald-400'">
              <span class="w-2 h-2 rounded-full" :class="urgentSnagsCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'"></span>
              <span>{{ urgentSnagsCount > 0 ? `${urgentSnagsCount} urgent snags` : 'All systems clear' }}</span>
            </div>
          </div>

          <!-- Quick Action Button -->
          <div class="relative">
            <button
              @click="showQuickMenu = !showQuickMenu"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-45': showQuickMenu }" />
              <span>Quick Add</span>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="transform scale-95 opacity-0 -translate-y-2"
              enter-to-class="transform scale-100 opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="transform scale-100 opacity-100 translate-y-0"
              leave-to-class="transform scale-95 opacity-0 -translate-y-2"
            >
              <div
                v-if="showQuickMenu"
                class="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 divide-y divide-slate-800"
              >
                <div class="space-y-1 pb-1.5">
                  <button
                    @click="triggerAction('snag')"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
                  >
                    <div class="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                      <Wrench class="w-4 h-4" />
                    </div>
                    <div>
                      <div>Log Snag / Task</div>
                      <div class="text-[10px] text-slate-400 font-normal">Report urgent repair or task</div>
                    </div>
                  </button>

                  <button
                    @click="triggerAction('expense')"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors text-left"
                  >
                    <div class="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Receipt class="w-4 h-4" />
                    </div>
                    <div>
                      <div>Add Expense / Bill</div>
                      <div class="text-[10px] text-slate-400 font-normal">Rates, levies, insurance</div>
                    </div>
                  </button>
                </div>

                <div class="space-y-1 pt-1.5">
                  <button
                    @click="triggerAction('property')"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors text-left"
                  >
                    <div class="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Building2 class="w-4 h-4" />
                    </div>
                    <div>New Property</div>
                  </button>

                  <button
                    @click="triggerAction('contact')"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-blue-500/10 hover:text-blue-300 transition-colors text-left"
                  >
                    <div class="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <UserPlus class="w-4 h-4" />
                    </div>
                    <div>New Contact</div>
                  </button>

                  <button
                    @click="triggerAction('vault')"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-amber-500/10 hover:text-amber-300 transition-colors text-left"
                  >
                    <div class="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <KeyRound class="w-4 h-4" />
                    </div>
                    <div>Add Key / Meter PIN</div>
                  </button>

                  <button
                    @click="triggerAction('note')"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-700/50 hover:text-slate-100 transition-colors text-left"
                  >
                    <div class="p-1.5 rounded-lg bg-slate-700/50 text-slate-300">
                      <FileText class="w-4 h-4" />
                    </div>
                    <div>Quick Note / Log</div>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Top Minimal Header -->
  <header class="md:hidden sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5" @click="router.push('/')">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Building2 class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-base tracking-tight text-white">PropPulse</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="showQuickMenu = !showQuickMenu"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>Quick Log</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Bottom Action Sheet / Quick Menu Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div
        v-if="showQuickMenu"
        class="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 pb-24"
        @click.self="showQuickMenu = false"
      >
        <div class="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-4 space-y-2">
          <div class="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3"></div>
          <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider px-2">Quick Actions</h3>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <button
              @click="triggerAction('snag')"
              class="flex flex-col items-start p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 active:scale-98"
            >
              <div class="p-2 rounded-xl bg-rose-500/20 text-rose-400 mb-2">
                <Wrench class="w-5 h-5" />
              </div>
              <span class="font-bold text-sm">Log Snag</span>
              <span class="text-[11px] text-rose-300/70">Urgent or repair task</span>
            </button>

            <button
              @click="triggerAction('expense')"
              class="flex flex-col items-start p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 active:scale-98"
            >
              <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mb-2">
                <Receipt class="w-5 h-5" />
              </div>
              <span class="font-bold text-sm">Add Expense</span>
              <span class="text-[11px] text-emerald-300/70">Rates, levies, bills</span>
            </button>

            <button
              @click="triggerAction('property')"
              class="flex flex-col items-start p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 active:scale-98"
            >
              <div class="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mb-2">
                <Building2 class="w-5 h-5" />
              </div>
              <span class="font-bold text-sm">New Property</span>
              <span class="text-[11px] text-indigo-300/70">Units, address, details</span>
            </button>

            <button
              @click="triggerAction('contact')"
              class="flex flex-col items-start p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 active:scale-98"
            >
              <div class="p-2 rounded-xl bg-blue-500/20 text-blue-400 mb-2">
                <UserPlus class="w-5 h-5" />
              </div>
              <span class="font-bold text-sm">New Contact</span>
              <span class="text-[11px] text-blue-300/70">Plumber, tenant, agent</span>
            </button>

            <button
              @click="triggerAction('vault')"
              class="flex flex-col items-start p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 active:scale-98"
            >
              <div class="p-2 rounded-xl bg-amber-500/20 text-amber-400 mb-2">
                <KeyRound class="w-5 h-5" />
              </div>
              <span class="font-bold text-sm">Vault Code</span>
              <span class="text-[11px] text-amber-300/70">Meter #, alarm PIN</span>
            </button>

            <button
              @click="triggerAction('note')"
              class="flex flex-col items-start p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 active:scale-98"
            >
              <div class="p-2 rounded-xl bg-slate-700 text-slate-300 mb-2">
                <FileText class="w-5 h-5" />
              </div>
              <span class="font-bold text-sm">Quick Note</span>
              <span class="text-[11px] text-slate-400">Log history / access</span>
            </button>
          </div>

          <button
            @click="showQuickMenu = false"
            class="w-full mt-2 py-3 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 active:scale-98"
          >
            Cancel
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Mobile Bottom Navigation Bar -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-safe">
    <div class="grid grid-cols-4 items-center justify-around">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-colors relative"
        :class="[
          route.path === item.path
            ? 'text-indigo-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        ]"
      >
        <div class="relative">
          <component
            :is="item.icon"
            class="w-5 h-5 transition-transform"
            :class="route.path === item.path ? 'scale-110' : ''"
          />
          <span
            v-if="item.name === 'Dashboard' && urgentSnagsCount > 0"
            class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900"
          ></span>
        </div>
        <span class="text-[11px] mt-1 tracking-tight">{{ item.name }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
