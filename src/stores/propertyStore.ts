import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Property,
  Expense,
  Snag,
  Contact,
  PropertyNote,
  VaultItem,
  AppSettings
} from '../types/property'
import {
  INITIAL_SETTINGS,
  INITIAL_PROPERTIES,
  INITIAL_EXPENSES,
  INITIAL_SNAGS,
  INITIAL_CONTACTS,
  INITIAL_VAULT,
  INITIAL_NOTES
} from '../data/seedData'

const STORAGE_KEY = 'proppulse_data_v1'

export interface AppStatePayload {
  version: number
  exportedAt: string
  settings: AppSettings
  properties: Property[]
  expenses: Expense[]
  snags: Snag[]
  contacts: Contact[]
  vault: VaultItem[]
  notes: PropertyNote[]
}

export const usePropertyStore = defineStore('property', () => {
  // State
  const settings = ref<AppSettings>(INITIAL_SETTINGS)
  const properties = ref<Property[]>([])
  const expenses = ref<Expense[]>([])
  const snags = ref<Snag[]>([])
  const contacts = ref<Contact[]>([])
  const vault = ref<VaultItem[]>([])
  const notes = ref<PropertyNote[]>([])

  const isHydrated = ref(false)
  const isSyncing = ref(false)
  const toast = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error'; id: number } | null>(null)

  // Toast Notification helper
  let toastTimer: ReturnType<typeof setTimeout> | null = null
  function showToast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') {
    if (toastTimer) clearTimeout(toastTimer)
    toast.value = { message, type, id: Date.now() }
    toastTimer = setTimeout(() => {
      toast.value = null
    }, 3200)
  }

  // Persistence
  function saveToLocalStorage() {
    try {
      const payload: AppStatePayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings: settings.value,
        properties: properties.value,
        expenses: expenses.value,
        snags: snags.value,
        contacts: contacts.value,
        vault: vault.value,
        notes: notes.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      console.error('Failed to save to localStorage:', err)
    }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as AppStatePayload
        settings.value = { ...INITIAL_SETTINGS, ...(data.settings || {}) }
        properties.value = data.properties || []
        expenses.value = data.expenses || []
        snags.value = data.snags || []
        contacts.value = data.contacts || []
        vault.value = data.vault || []
        notes.value = data.notes || []
        isHydrated.value = true
        return
      }
    } catch (err) {
      console.warn('Error reading from localStorage, loading seed data:', err)
    }
    resetToSeedData(false)
    isHydrated.value = true
  }

  function resetToSeedData(notify = true) {
    settings.value = { ...INITIAL_SETTINGS }
    properties.value = JSON.parse(JSON.stringify(INITIAL_PROPERTIES))
    expenses.value = JSON.parse(JSON.stringify(INITIAL_EXPENSES))
    snags.value = JSON.parse(JSON.stringify(INITIAL_SNAGS))
    contacts.value = JSON.parse(JSON.stringify(INITIAL_CONTACTS))
    vault.value = JSON.parse(JSON.stringify(INITIAL_VAULT))
    notes.value = JSON.parse(JSON.stringify(INITIAL_NOTES))
    saveToLocalStorage()
    if (notify) {
      showToast('Database reset to realistic seed properties', 'info')
    }
  }

  // Export / Import JSON
  function exportDataJson(): string {
    const payload: AppStatePayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: settings.value,
      properties: properties.value,
      expenses: expenses.value,
      snags: snags.value,
      contacts: contacts.value,
      vault: vault.value,
      notes: notes.value
    }
    return JSON.stringify(payload, null, 2)
  }

  function downloadBackupFile() {
    const jsonStr = exportDataJson()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dateStr = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `proppulse_backup_${dateStr}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Backup JSON downloaded successfully', 'success')
  }

  function importDataJson(jsonString: string, mode: 'replace' | 'merge' = 'replace'): boolean {
    try {
      const data = JSON.parse(jsonString) as Partial<AppStatePayload>
      if (!data.properties || !Array.isArray(data.properties)) {
        throw new Error('Invalid backup file: missing properties array')
      }

      if (mode === 'replace') {
        settings.value = { ...INITIAL_SETTINGS, ...(data.settings || {}) }
        properties.value = data.properties || []
        expenses.value = data.expenses || []
        snags.value = data.snags || []
        contacts.value = data.contacts || []
        vault.value = data.vault || []
        notes.value = data.notes || []
      } else {
        // Merge mode
        const existingPropIds = new Set(properties.value.map(p => p.id))
        const newProps = (data.properties || []).filter(p => !existingPropIds.has(p.id))
        properties.value.push(...newProps)

        const existingExpIds = new Set(expenses.value.map(e => e.id))
        expenses.value.push(...(data.expenses || []).filter(e => !existingExpIds.has(e.id)))

        const existingSnagIds = new Set(snags.value.map(s => s.id))
        snags.value.push(...(data.snags || []).filter(s => !existingSnagIds.has(s.id)))

        const existingContactIds = new Set(contacts.value.map(c => c.id))
        contacts.value.push(...(data.contacts || []).filter(c => !existingContactIds.has(c.id)))

        const existingVaultIds = new Set(vault.value.map(v => v.id))
        vault.value.push(...(data.vault || []).filter(v => !existingVaultIds.has(v.id)))

        const existingNoteIds = new Set(notes.value.map(n => n.id))
        notes.value.push(...(data.notes || []).filter(n => !existingNoteIds.has(n.id)))
      }

      saveToLocalStorage()
      showToast(`Data imported successfully (${mode === 'replace' ? 'replaced' : 'merged'})`, 'success')
      return true
    } catch (err: any) {
      console.error('Import failed:', err)
      showToast(`Import failed: ${err.message || 'Invalid JSON file'}`, 'error')
      return false
    }
  }

  // Cloudflare D1 Sync
  async function syncWithCloudflareD1() {
    if (!settings.value.enableD1Sync) {
      showToast('Cloudflare D1 Sync is disabled in settings', 'warning')
      return
    }
    isSyncing.value = true
    try {
      const endpoint = settings.value.d1ApiEndpoint || '/api'
      const response = await fetch(`${endpoint}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: exportDataJson()
      })
      if (!response.ok) {
        throw new Error(`D1 sync failed with status ${response.status}`)
      }
      const resData = await response.json()
      settings.value.lastSyncTime = new Date().toISOString()
      saveToLocalStorage()
      showToast('Synced with Cloudflare D1 database', 'success')
      return resData
    } catch (err: any) {
      console.warn('D1 Sync error (falling back to localStorage):', err)
      showToast('Cloudflare D1 offline / demo mode. LocalStorage is primary.', 'info')
    } finally {
      isSyncing.value = false
    }
  }

  // Formatting Helpers
  function formatCurrency(val: number): string {
    const symbol = settings.value.currencySymbol || 'R'
    return `${symbol} ${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }

  // Normalize frequency to monthly equivalent
  function getMonthlyAmount(expense: Expense): number {
    switch (expense.frequency) {
      case 'Annual':
        return expense.amount / 12
      case 'Quarterly':
        return expense.amount / 3
      case 'One-off':
        return 0
      case 'Monthly':
      default:
        return expense.amount
    }
  }

  // Computed / Getters
  const totalMonthlySpend = computed(() => {
    return expenses.value.reduce((acc, exp) => acc + getMonthlyAmount(exp), 0)
  })

  const totalPaidMonthlySpend = computed(() => {
    return expenses.value
      .filter(exp => exp.isPaid)
      .reduce((acc, exp) => acc + getMonthlyAmount(exp), 0)
  })

  const totalPendingMonthlySpend = computed(() => {
    return expenses.value
      .filter(exp => !exp.isPaid)
      .reduce((acc, exp) => acc + getMonthlyAmount(exp), 0)
  })

  const spendPaidProgress = computed(() => {
    if (totalMonthlySpend.value <= 0) return 0
    return Math.min(100, Math.round((totalPaidMonthlySpend.value / totalMonthlySpend.value) * 100))
  })

  const spendByCategory = computed(() => {
    const map: Record<string, number> = {}
    for (const exp of expenses.value) {
      const cat = exp.category
      const monthly = getMonthlyAmount(exp)
      map[cat] = (map[cat] || 0) + monthly
    }
    return Object.entries(map)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  })

  const openSnags = computed(() => {
    return snags.value.filter(s => s.status !== 'Resolved')
  })

  const urgentSnags = computed(() => {
    return snags.value.filter(s => s.severity === 'Urgent' && s.status !== 'Resolved')
  })

  const resolvedSnags = computed(() => {
    return snags.value.filter(s => s.status === 'Resolved')
  })

  const emergencyContacts = computed(() => {
    return contacts.value.filter(c => c.isEmergencyContact)
  })

  // Per-property Getters
  function getPropertyById(id: string): Property | undefined {
    return properties.value.find(p => p.id === id)
  }

  function getExpensesByProperty(propertyId: string): Expense[] {
    return expenses.value.filter(e => e.propertyId === propertyId)
  }

  function getPropertyMonthlySpend(propertyId: string): number {
    return getExpensesByProperty(propertyId).reduce((acc, exp) => acc + getMonthlyAmount(exp), 0)
  }

  function getPropertyPaidMonthlySpend(propertyId: string): number {
    return getExpensesByProperty(propertyId)
      .filter(e => e.isPaid)
      .reduce((acc, exp) => acc + getMonthlyAmount(exp), 0)
  }

  function getSnagsByProperty(propertyId: string): Snag[] {
    return snags.value.filter(s => s.propertyId === propertyId)
  }

  function getOpenSnagsByProperty(propertyId: string): Snag[] {
    return snags.value.filter(s => s.propertyId === propertyId && s.status !== 'Resolved')
  }

  function getVaultByProperty(propertyId: string): VaultItem[] {
    return vault.value.filter(v => v.propertyId === propertyId)
  }

  function getNotesByProperty(propertyId: string): PropertyNote[] {
    return notes.value
      .filter(n => n.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  function getContactsByProperty(propertyId: string): Contact[] {
    const prop = getPropertyById(propertyId)
    if (!prop) return []
    const explicitIds = new Set(prop.contactIds || [])
    return contacts.value.filter(c => explicitIds.has(c.id) || (c.propertyIds && c.propertyIds.includes(propertyId)))
  }

  function getContactById(contactId?: string): Contact | undefined {
    if (!contactId) return undefined
    return contacts.value.find(c => c.id === contactId)
  }

  // Property Actions
  function addProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property {
    const id = `prop-${Date.now()}`
    const now = new Date().toISOString()
    const newProperty: Property = {
      ...propertyData,
      id,
      createdAt: now,
      updatedAt: now,
      contactIds: propertyData.contactIds || []
    }
    properties.value.unshift(newProperty)
    saveToLocalStorage()
    showToast(`Property "${newProperty.name}" created`, 'success')
    return newProperty
  }

  function updateProperty(id: string, updates: Partial<Property>) {
    const idx = properties.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      properties.value[idx] = {
        ...properties.value[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveToLocalStorage()
      showToast('Property details updated', 'success')
    }
  }

  function deleteProperty(id: string) {
    const prop = getPropertyById(id)
    const name = prop?.name || 'Property'
    properties.value = properties.value.filter(p => p.id !== id)
    expenses.value = expenses.value.filter(e => e.propertyId !== id)
    snags.value = snags.value.filter(s => s.propertyId !== id)
    vault.value = vault.value.filter(v => v.propertyId !== id)
    notes.value = notes.value.filter(n => n.propertyId !== id)
    saveToLocalStorage()
    showToast(`Deleted "${name}" and all associated records`, 'info')
  }

  // Expense Actions
  function addExpense(expenseData: Omit<Expense, 'id'>): Expense {
    const id = `exp-${Date.now()}`
    const newExpense: Expense = {
      ...expenseData,
      id
    }
    expenses.value.push(newExpense)
    saveToLocalStorage()
    showToast(`Expense "${newExpense.name}" added`, 'success')
    return newExpense
  }

  function updateExpense(id: string, updates: Partial<Expense>) {
    const idx = expenses.value.findIndex(e => e.id === id)
    if (idx !== -1) {
      expenses.value[idx] = { ...expenses.value[idx], ...updates }
      saveToLocalStorage()
      showToast('Expense updated', 'success')
    }
  }

  function toggleExpensePaid(id: string) {
    const exp = expenses.value.find(e => e.id === id)
    if (exp) {
      exp.isPaid = !exp.isPaid
      if (exp.isPaid) {
        exp.lastPaidDate = new Date().toISOString().slice(0, 10)
        showToast(`Marked "${exp.name}" as Paid`, 'success')
      } else {
        showToast(`Marked "${exp.name}" as Unpaid`, 'info')
      }
      saveToLocalStorage()
    }
  }

  function markAllExpensesPaid(propertyId?: string) {
    const list = propertyId ? expenses.value.filter(e => e.propertyId === propertyId) : expenses.value
    const today = new Date().toISOString().slice(0, 10)
    list.forEach(e => {
      e.isPaid = true
      e.lastPaidDate = today
    })
    saveToLocalStorage()
    showToast('All matching monthly expenses marked as paid', 'success')
  }

  function deleteExpense(id: string) {
    expenses.value = expenses.value.filter(e => e.id !== id)
    saveToLocalStorage()
    showToast('Expense deleted', 'info')
  }

  // Snag Actions
  function addSnag(snagData: Omit<Snag, 'id' | 'createdAt' | 'resolvedAt'>): Snag {
    const id = `snag-${Date.now()}`
    const newSnag: Snag = {
      ...snagData,
      id,
      createdAt: new Date().toISOString(),
      resolvedAt: snagData.status === 'Resolved' ? new Date().toISOString() : undefined
    }
    snags.value.unshift(newSnag)
    saveToLocalStorage()
    showToast(`Snag "${newSnag.title}" logged`, 'success')
    return newSnag
  }

  function updateSnag(id: string, updates: Partial<Snag>) {
    const idx = snags.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      const wasResolved = snags.value[idx].status === 'Resolved'
      const isNowResolved = updates.status === 'Resolved'
      let resolvedAt = snags.value[idx].resolvedAt
      if (!wasResolved && isNowResolved) {
        resolvedAt = new Date().toISOString()
      } else if (updates.status && updates.status !== 'Resolved') {
        resolvedAt = undefined
      }

      snags.value[idx] = {
        ...snags.value[idx],
        ...updates,
        resolvedAt
      }
      saveToLocalStorage()
      showToast('Snag updated', 'success')
    }
  }

  function quickResolveSnag(id: string) {
    const snag = snags.value.find(s => s.id === id)
    if (snag) {
      const isResolved = snag.status === 'Resolved'
      snag.status = isResolved ? 'Open' : 'Resolved'
      snag.resolvedAt = !isResolved ? new Date().toISOString() : undefined
      saveToLocalStorage()
      showToast(
        !isResolved ? `Resolved: "${snag.title}"` : `Reopened: "${snag.title}"`,
        !isResolved ? 'success' : 'info'
      )
    }
  }

  function cycleSnagStatus(id: string) {
    const snag = snags.value.find(s => s.id === id)
    if (snag) {
      if (snag.status === 'Open') {
        snag.status = 'In Progress'
        snag.resolvedAt = undefined
      } else if (snag.status === 'In Progress') {
        snag.status = 'Resolved'
        snag.resolvedAt = new Date().toISOString()
      } else {
        snag.status = 'Open'
        snag.resolvedAt = undefined
      }
      saveToLocalStorage()
      showToast(`Snag status changed to ${snag.status}`, 'info')
    }
  }

  function deleteSnag(id: string) {
    snags.value = snags.value.filter(s => s.id !== id)
    saveToLocalStorage()
    showToast('Snag task removed', 'info')
  }

  // Contact Actions
  function addContact(contactData: Omit<Contact, 'id'>): Contact {
    const id = `contact-${Date.now()}`
    const newContact: Contact = {
      ...contactData,
      id
    }
    contacts.value.push(newContact)
    saveToLocalStorage()
    showToast(`Contact "${newContact.name}" added to directory`, 'success')
    return newContact
  }

  function updateContact(id: string, updates: Partial<Contact>) {
    const idx = contacts.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      contacts.value[idx] = { ...contacts.value[idx], ...updates }
      saveToLocalStorage()
      showToast('Contact updated', 'success')
    }
  }

  function deleteContact(id: string) {
    const c = getContactById(id)
    contacts.value = contacts.value.filter(item => item.id !== id)
    // Remove from properties
    properties.value.forEach(p => {
      if (p.contactIds) {
        p.contactIds = p.contactIds.filter(cid => cid !== id)
      }
    })
    saveToLocalStorage()
    showToast(`Contact "${c?.name || 'Contact'}" removed`, 'info')
  }

  // Vault Actions
  function addVaultItem(itemData: Omit<VaultItem, 'id'>): VaultItem {
    const id = `vlt-${Date.now()}`
    const newItem: VaultItem = { ...itemData, id }
    vault.value.push(newItem)
    saveToLocalStorage()
    showToast(`Key detail "${newItem.label}" saved to vault`, 'success')
    return newItem
  }

  function updateVaultItem(id: string, updates: Partial<VaultItem>) {
    const idx = vault.value.findIndex(v => v.id === id)
    if (idx !== -1) {
      vault.value[idx] = { ...vault.value[idx], ...updates }
      saveToLocalStorage()
      showToast('Vault item updated', 'success')
    }
  }

  function deleteVaultItem(id: string) {
    vault.value = vault.value.filter(v => v.id !== id)
    saveToLocalStorage()
    showToast('Vault item deleted', 'info')
  }

  // Note Actions
  function addNote(noteData: Omit<PropertyNote, 'id' | 'createdAt'>): PropertyNote {
    const id = `note-${Date.now()}`
    const newNote: PropertyNote = {
      ...noteData,
      id,
      createdAt: new Date().toISOString()
    }
    notes.value.unshift(newNote)
    saveToLocalStorage()
    showToast('Note added to property log', 'success')
    return newNote
  }

  function updateNote(id: string, updates: Partial<PropertyNote>) {
    const idx = notes.value.findIndex(n => n.id === id)
    if (idx !== -1) {
      notes.value[idx] = { ...notes.value[idx], ...updates }
      saveToLocalStorage()
      showToast('Note updated', 'success')
    }
  }

  function deleteNote(id: string) {
    notes.value = notes.value.filter(n => n.id !== id)
    saveToLocalStorage()
    showToast('Note deleted', 'info')
  }

  // Settings Actions
  function updateSettings(updates: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...updates }
    saveToLocalStorage()
    showToast('Settings saved', 'success')
  }

  // Initialize store on load
  loadFromLocalStorage()

  return {
    // State
    settings,
    properties,
    expenses,
    snags,
    contacts,
    vault,
    notes,
    isHydrated,
    isSyncing,
    toast,

    // Toast
    showToast,

    // Computed stats
    totalMonthlySpend,
    totalPaidMonthlySpend,
    totalPendingMonthlySpend,
    spendPaidProgress,
    spendByCategory,
    openSnags,
    urgentSnags,
    resolvedSnags,
    emergencyContacts,

    // Property getters
    getPropertyById,
    getExpensesByProperty,
    getPropertyMonthlySpend,
    getPropertyPaidMonthlySpend,
    getSnagsByProperty,
    getOpenSnagsByProperty,
    getVaultByProperty,
    getNotesByProperty,
    getContactsByProperty,
    getContactById,
    getMonthlyAmount,

    // Helpers
    formatCurrency,

    // CRUD Actions
    addProperty,
    updateProperty,
    deleteProperty,

    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpensePaid,
    markAllExpensesPaid,

    addSnag,
    updateSnag,
    quickResolveSnag,
    cycleSnagStatus,
    deleteSnag,

    addContact,
    updateContact,
    deleteContact,

    addVaultItem,
    updateVaultItem,
    deleteVaultItem,

    addNote,
    updateNote,
    deleteNote,

    updateSettings,

    // Backup & Sync
    exportDataJson,
    downloadBackupFile,
    importDataJson,
    resetToSeedData,
    syncWithCloudflareD1
  }
})
