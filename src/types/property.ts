export type PropertyStatus = 'Active' | 'Rented' | 'Maintenance' | 'Vacant'
export type PropertyType = 'Residential' | 'Apartment' | 'Commercial' | 'Holiday Let' | 'Mixed Use'

export type ExpenseCategory = 
  | 'Rates & Taxes'
  | 'Water & Electricity'
  | 'Maintenance'
  | 'Body Corporate / Levies'
  | 'Insurance'
  | 'Internet & Comms'
  | 'Mortgage / Bond'
  | 'Garden & Pool'
  | 'Security'
  | 'Other'

export type ExpenseFrequency = 'Monthly' | 'Quarterly' | 'Annual' | 'One-off'

export interface Expense {
  id: string
  propertyId: string
  name: string
  category: ExpenseCategory
  amount: number
  frequency: ExpenseFrequency
  dueDay: number // 1 - 31
  isPaid: boolean
  lastPaidDate?: string
  accountReference?: string
  notes?: string
}

export type SnagSeverity = 'Urgent' | 'Normal' | 'Cosmetic'
export type SnagStatus = 'Open' | 'In Progress' | 'Resolved'

export interface Snag {
  id: string
  propertyId: string
  title: string
  area: string
  severity: SnagSeverity
  status: SnagStatus
  assignedContactId?: string
  costEstimate?: number
  actualCost?: number
  createdAt: string
  resolvedAt?: string
  notes?: string
}

export type ContactRole = 
  | 'Plumber'
  | 'Electrician'
  | 'Handyman'
  | 'Tenant'
  | 'Body Corporate'
  | 'Locksmith'
  | 'Painter'
  | 'Appliance Repair'
  | 'Security'
  | 'Gardener & Landscaper'
  | 'Insurance Broker'
  | 'Property Manager'
  | 'Other'

export interface Contact {
  id: string
  name: string
  role: ContactRole
  phone: string
  whatsappPhone?: string
  email?: string
  company?: string
  notes?: string
  rating?: number
  isEmergencyContact?: boolean
  propertyIds?: string[]
}

export type NoteCategory = 'General' | 'Inspection' | 'Maintenance Log' | 'Tenant Interaction' | 'Access & Keys'

export interface PropertyNote {
  id: string
  propertyId: string
  title: string
  content: string
  category: NoteCategory
  createdAt: string
}

export type VaultCategory = 'Meter' | 'PIN / Code' | 'Account #' | 'WiFi' | 'Insurance' | 'Key Location' | 'Other'

export interface VaultItem {
  id: string
  propertyId: string
  label: string
  value: string
  category: VaultCategory
  isSecret?: boolean
  notes?: string
}

export interface Property {
  id: string
  name: string
  nickname?: string
  address: string
  units: string[]
  status: PropertyStatus
  type: PropertyType
  rentalIncome?: number
  colorTheme?: string
  contactIds: string[]
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  currencySymbol: string
  currencyCode: string
  theme: 'dark' | 'light' | 'system'
  enableD1Sync: boolean
  d1ApiEndpoint: string
  lastSyncTime?: string
  monthlyBudgetAlertThreshold?: number
}
