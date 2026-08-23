<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropertyNote, NoteCategory } from '../../types/property'
import { usePropertyStore } from '../../stores/propertyStore'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  note?: PropertyNote | null
  defaultPropertyId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = usePropertyStore()

const categories: NoteCategory[] = ['General', 'Inspection', 'Maintenance Log', 'Tenant Interaction', 'Access & Keys']

const form = ref({
  propertyId: '',
  title: '',
  content: '',
  category: 'General' as NoteCategory
})

watch(
  () => [props.show, props.note, props.defaultPropertyId],
  () => {
    if (props.show) {
      if (props.note) {
        form.value = {
          propertyId: props.note.propertyId,
          title: props.note.title,
          content: props.note.content,
          category: props.note.category
        }
      } else {
        form.value = {
          propertyId: props.defaultPropertyId || store.properties[0]?.id || '',
          title: '',
          content: '',
          category: 'General'
        }
      }
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.title.trim()) {
    store.showToast('Please enter note title', 'warning')
    return
  }
  if (!form.value.content.trim()) {
    store.showToast('Please enter note content', 'warning')
    return
  }
  if (!form.value.propertyId) {
    store.showToast('Please select property', 'warning')
    return
  }

  if (props.note) {
    store.updateNote(props.note.id, { ...form.value })
  } else {
    store.addNote({ ...form.value })
  }
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-98"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-98"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-zinc-100">
                {{ note ? 'Edit Note' : 'Add Property Note' }}
              </h3>
              <p class="text-xs text-zinc-400">Inspections, tenant notes, key logs, history</p>
            </div>
            <button
              @click="emit('close')"
              class="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Property & Category -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Property</label>
                <select
                  v-model="form.propertyId"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option v-for="p in store.properties" :key="p.id" :value="p.id">
                    {{ p.name }} ({{ p.address }})
                  </option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Category</label>
                <select
                  v-model="form.category"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <!-- Title -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Note Title</label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="e.g. Annual Body Corporate Valuation, Lease Update"
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <!-- Content -->
            <div class="space-y-1">
              <label class="block text-xs font-medium uppercase tracking-wider text-zinc-400">Note Content</label>
              <textarea
                v-model="form.content"
                rows="5"
                required
                placeholder="Type log details, agreements, observations..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 resize-none"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm transition-all active:scale-98"
              >
                {{ note ? 'Update Note' : 'Save Note' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
