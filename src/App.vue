<script setup lang="ts">
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import ToastNotification from './components/ToastNotification.vue'
import ExpenseModal from './components/modals/ExpenseModal.vue'
import SnagModal from './components/modals/SnagModal.vue'
import PropertyModal from './components/modals/PropertyModal.vue'
import ContactModal from './components/modals/ContactModal.vue'
import VaultModal from './components/modals/VaultModal.vue'
import NoteModal from './components/modals/NoteModal.vue'

const showExpenseModal = ref(false)
const showSnagModal = ref(false)
const showPropertyModal = ref(false)
const showContactModal = ref(false)
const showVaultModal = ref(false)
const showNoteModal = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <!-- Navigation Bar (Desktop Header + Mobile Bottom Nav) -->
    <Navbar
      @open-expense-modal="showExpenseModal = true"
      @open-snag-modal="showSnagModal = true"
      @open-property-modal="showPropertyModal = true"
      @open-contact-modal="showContactModal = true"
      @open-vault-modal="showVaultModal = true"
      @open-note-modal="showNoteModal = true"
    />

    <!-- Main View Content -->
    <main class="flex-1 pb-12 sm:pb-8">
      <RouterView />
    </main>

    <!-- Global Floating Toast Notification -->
    <ToastNotification />

    <!-- Global Modals triggered from Navigation Bar -->
    <ExpenseModal :show="showExpenseModal" @close="showExpenseModal = false" />
    <SnagModal :show="showSnagModal" @close="showSnagModal = false" />
    <PropertyModal :show="showPropertyModal" @close="showPropertyModal = false" />
    <ContactModal :show="showContactModal" @close="showContactModal = false" />
    <VaultModal :show="showVaultModal" @close="showVaultModal = false" />
    <NoteModal :show="showNoteModal" @close="showNoteModal = false" />
  </div>
</template>
