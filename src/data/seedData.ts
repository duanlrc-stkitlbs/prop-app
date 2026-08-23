import type { Property, Expense, Snag, Contact, PropertyNote, VaultItem, AppSettings } from '../types/property'

export const INITIAL_SETTINGS: AppSettings = {
  currencySymbol: 'R',
  currencyCode: 'ZAR',
  theme: 'dark',
  enableD1Sync: false,
  d1ApiEndpoint: '/api',
  lastSyncTime: undefined,
  monthlyBudgetAlertThreshold: 20000
}

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'contact-1',
    name: 'Johan van der Merwe',
    role: 'Plumber',
    company: 'Vanguard Plumbing & Solar Geysers',
    phone: '+27825551201',
    whatsappPhone: '27825551201',
    email: 'johan@vanguardplumbing.co.za',
    rating: 5,
    isEmergencyContact: true,
    notes: 'Primary plumber for geysers, pressure valves, and leak detection. Super responsive.',
    propertyIds: ['prop-1', 'prop-2', 'prop-3']
  },
  {
    id: 'contact-2',
    name: 'Sipho Ndlovu',
    role: 'Electrician',
    company: 'SparkGuard Electrical Services',
    phone: '+27834449812',
    whatsappPhone: '27834449812',
    email: 'sipho@sparkguard.co.za',
    rating: 5,
    isEmergencyContact: true,
    notes: 'Certified master electrician. Handled inverter & solar installations. Issues valid CoCs.',
    propertyIds: ['prop-1', 'prop-2', 'prop-3']
  },
  {
    id: 'contact-3',
    name: 'Dave "The Fixer" Miller',
    role: 'Handyman',
    company: 'Miller Home Repairs',
    phone: '+27712223456',
    whatsappPhone: '27712223456',
    email: 'davefixer@gmail.com',
    rating: 4,
    isEmergencyContact: false,
    notes: 'Great with cabinetry, door alignments, locks, tiling touch-ups, and silicone sealing.',
    propertyIds: ['prop-1', 'prop-2']
  },
  {
    id: 'contact-4',
    name: 'Claremont Body Corporate Management',
    role: 'Body Corporate',
    company: 'First Property Managers',
    phone: '+27214220011',
    whatsappPhone: '27214220011',
    email: 'admin@firstpropmanagers.co.za',
    rating: 4,
    isEmergencyContact: false,
    notes: 'Managing agent for Kloof Street Penthouse. Account manager: Annelize (ext 104).',
    propertyIds: ['prop-1']
  },
  {
    id: 'contact-5',
    name: 'Bay Security Armed Response',
    role: 'Security',
    company: 'Bay Security Control Room',
    phone: '+27214399911',
    email: 'control@baysecurity.co.za',
    rating: 5,
    isEmergencyContact: true,
    notes: '24/7 Rapid response control room. Reference code: BP-8891.',
    propertyIds: ['prop-2']
  },
  {
    id: 'contact-6',
    name: 'Sarah Jenkins',
    role: 'Tenant',
    company: 'Flatlet B Tenant',
    phone: '+27849998877',
    whatsappPhone: '27849998877',
    email: 'sarah.j.creative@outlook.com',
    rating: 5,
    isEmergencyContact: false,
    notes: 'Long-term tenant in Sea Point Garden Flatlet. Lease active through Dec 2025. Pays on 1st.',
    propertyIds: ['prop-2']
  },
  {
    id: 'contact-7',
    name: 'Kevin Brooks',
    role: 'Appliance Repair',
    company: 'CoolBreeze Air & Refrigeration',
    phone: '+27721110099',
    whatsappPhone: '27721110099',
    email: 'service@coolbreezeair.co.za',
    rating: 4,
    isEmergencyContact: false,
    notes: 'Handles split-unit air conditioners and pool heat pumps.',
    propertyIds: ['prop-1', 'prop-2', 'prop-3']
  },
  {
    id: 'contact-8',
    name: 'Markus Botha',
    role: 'Gardener & Landscaper',
    company: 'GreenThumb Cape Landscapes',
    phone: '+27827776655',
    whatsappPhone: '27827776655',
    email: 'markus@greenthumbcape.co.za',
    rating: 5,
    isEmergencyContact: false,
    notes: 'Fortnightly garden maintenance, tree trimming, and automated irrigation checks.',
    propertyIds: ['prop-2', 'prop-3']
  }
]

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Kloof Street Penthouse',
    nickname: 'City Penthouse',
    address: '42 Kloof Street, Gardens, Cape Town, 8001',
    units: ['Unit 402 (Main Penthouse 2-Bed)', 'Private Rooftop Terrace', 'Basement Bay #14 + Storeroom'],
    status: 'Active',
    type: 'Apartment',
    rentalIncome: 32000,
    colorTheme: 'indigo',
    contactIds: ['contact-1', 'contact-2', 'contact-3', 'contact-4', 'contact-7'],
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2025-02-20T11:30:00.000Z'
  },
  {
    id: 'prop-2',
    name: 'Sea Point Garden Villa & Flatlet',
    nickname: 'Sea Point Villa',
    address: '15 Regent Road, Sea Point, Cape Town, 8005',
    units: ['Main Residence (3 Bed / 2.5 Bath)', 'Garden Flatlet Cottage B (1 Bed)', 'Double Garage & Pool'],
    status: 'Rented',
    type: 'Residential',
    rentalIncome: 45000,
    colorTheme: 'emerald',
    contactIds: ['contact-1', 'contact-2', 'contact-3', 'contact-5', 'contact-6', 'contact-8'],
    createdAt: '2023-06-10T10:00:00.000Z',
    updatedAt: '2025-02-18T14:15:00.000Z'
  },
  {
    id: 'prop-3',
    name: 'Durbanville Family Homestead',
    nickname: 'Durbanville Home',
    address: '8 Protea Way, Durbanville, Cape Town, 7550',
    units: ['Main Villa (4 Bed / 3 Bath)', 'Workshop & Storage Shed', 'Lapa & Heated Pool'],
    status: 'Maintenance',
    type: 'Residential',
    rentalIncome: 0,
    colorTheme: 'amber',
    contactIds: ['contact-1', 'contact-2', 'contact-7', 'contact-8'],
    createdAt: '2023-11-01T09:00:00.000Z',
    updatedAt: '2025-02-22T08:45:00.000Z'
  }
]

export const INITIAL_EXPENSES: Expense[] = [
  // Prop 1 - Kloof Street Penthouse
  {
    id: 'exp-1',
    propertyId: 'prop-1',
    name: 'Body Corporate Levy (Gardens Crest)',
    category: 'Body Corporate / Levies',
    amount: 4200,
    frequency: 'Monthly',
    dueDay: 1,
    isPaid: true,
    lastPaidDate: '2025-02-01',
    accountReference: 'UNIT-402-LEVIES',
    notes: 'Includes building insurance, exterior maintenance, lift fund, and security intercom.'
  },
  {
    id: 'exp-2',
    propertyId: 'prop-1',
    name: 'City of Cape Town Municipal Rates',
    category: 'Rates & Taxes',
    amount: 2850,
    frequency: 'Monthly',
    dueDay: 20,
    isPaid: true,
    lastPaidDate: '2025-02-20',
    accountReference: 'CCT-992014881',
    notes: 'Property valuation rate + refuse collection.'
  },
  {
    id: 'exp-3',
    propertyId: 'prop-1',
    name: 'Octotel Fibre 200/200 Mbps',
    category: 'Internet & Comms',
    amount: 899,
    frequency: 'Monthly',
    dueDay: 1,
    isPaid: true,
    lastPaidDate: '2025-02-01',
    accountReference: 'OCT-GARDENS-402',
    notes: 'Uncapped symmetric fiber on debit order.'
  },
  {
    id: 'exp-4',
    propertyId: 'prop-1',
    name: 'Prepaid Electricity Top-up (Est)',
    category: 'Water & Electricity',
    amount: 1750,
    frequency: 'Monthly',
    dueDay: 15,
    isPaid: false,
    accountReference: 'METER-04219849217',
    notes: 'Purchase token via EasyPay / Banking App.'
  },
  {
    id: 'exp-5',
    propertyId: 'prop-1',
    name: 'Contents & Liability Insurance',
    category: 'Insurance',
    amount: 1450,
    frequency: 'Monthly',
    dueDay: 1,
    isPaid: true,
    lastPaidDate: '2025-02-01',
    accountReference: 'OM-PROP-88912',
    notes: 'Includes short-stay host liability coverage.'
  },

  // Prop 2 - Sea Point Villa
  {
    id: 'exp-6',
    propertyId: 'prop-2',
    name: 'City of Cape Town Rates & Sewerage',
    category: 'Rates & Taxes',
    amount: 3400,
    frequency: 'Monthly',
    dueDay: 22,
    isPaid: true,
    lastPaidDate: '2025-02-22',
    accountReference: 'CCT-774011299'
  },
  {
    id: 'exp-7',
    propertyId: 'prop-2',
    name: 'Bay Security Armed Response & CCTV',
    category: 'Security',
    amount: 780,
    frequency: 'Monthly',
    dueDay: 1,
    isPaid: true,
    lastPaidDate: '2025-02-01',
    accountReference: 'BAY-SP-8891'
  },
  {
    id: 'exp-8',
    propertyId: 'prop-2',
    name: 'GreenThumb Garden & Pool Service',
    category: 'Garden & Pool',
    amount: 1200,
    frequency: 'Monthly',
    dueDay: 28,
    isPaid: false,
    accountReference: 'GT-SEAPOINT-15',
    notes: 'Fortnightly garden service and pool chemical balancing.'
  },
  {
    id: 'exp-9',
    propertyId: 'prop-2',
    name: 'Comprehensive Homeowners Insurance',
    category: 'Insurance',
    amount: 1890,
    frequency: 'Monthly',
    dueDay: 1,
    isPaid: true,
    lastPaidDate: '2025-02-01',
    accountReference: 'SANT-SP-33921'
  },
  {
    id: 'exp-10',
    propertyId: 'prop-2',
    name: 'Solar Inverter Cloud Monitoring & SLA',
    category: 'Maintenance',
    amount: 450,
    frequency: 'Monthly',
    dueDay: 10,
    isPaid: true,
    lastPaidDate: '2025-02-10',
    accountReference: 'SUN-SYNC-009'
  },

  // Prop 3 - Durbanville Family Homestead
  {
    id: 'exp-11',
    propertyId: 'prop-3',
    name: 'City Rates, Water & Waste',
    category: 'Rates & Taxes',
    amount: 2150,
    frequency: 'Monthly',
    dueDay: 18,
    isPaid: false,
    accountReference: 'CCT-551029411',
    notes: 'Awaiting water meter reconciliation.'
  },
  {
    id: 'exp-12',
    propertyId: 'prop-3',
    name: 'Protea Glen HOA Levy',
    category: 'Body Corporate / Levies',
    amount: 950,
    frequency: 'Monthly',
    dueDay: 1,
    isPaid: true,
    lastPaidDate: '2025-02-01',
    accountReference: 'PG-HOA-08'
  },
  {
    id: 'exp-13',
    propertyId: 'prop-3',
    name: 'Garden Care & Lawn Mowing',
    category: 'Garden & Pool',
    amount: 1400,
    frequency: 'Monthly',
    dueDay: 30,
    isPaid: false,
    accountReference: 'GT-DURB-08'
  },
  {
    id: 'exp-14',
    propertyId: 'prop-3',
    name: 'Building Structure Insurance',
    category: 'Insurance',
    amount: 2100,
    frequency: 'Monthly',
    dueDay: 1,
    isPaid: true,
    lastPaidDate: '2025-02-01',
    accountReference: 'MOM-DURB-114'
  }
]

export const INITIAL_SNAGS: Snag[] = [
  // Kloof St
  {
    id: 'snag-1',
    propertyId: 'prop-1',
    title: 'Geyser overflow pressure valve dripping onto balcony',
    area: 'Rooftop / Balcony',
    severity: 'Urgent',
    status: 'In Progress',
    assignedContactId: 'contact-1',
    costEstimate: 850,
    createdAt: '2025-02-18T09:00:00.000Z',
    notes: 'Johan inspected yesterday. Requires standard 400kPa pressure control valve replacement.'
  },
  {
    id: 'snag-2',
    propertyId: 'prop-1',
    title: 'Kitchen island pop-up power tower stuck flush with granite',
    area: 'Kitchen',
    severity: 'Normal',
    status: 'Open',
    assignedContactId: 'contact-3',
    costEstimate: 350,
    createdAt: '2025-02-19T14:20:00.000Z',
    notes: 'Mechanism spring is jammed with dust. Dave to look when in the area.'
  },
  {
    id: 'snag-3',
    propertyId: 'prop-1',
    title: 'Master en-suite shower door magnetic seal replacement',
    area: 'Main Bathroom',
    severity: 'Cosmetic',
    status: 'Resolved',
    assignedContactId: 'contact-3',
    costEstimate: 450,
    actualCost: 420,
    createdAt: '2025-02-10T10:00:00.000Z',
    resolvedAt: '2025-02-14T16:00:00.000Z',
    notes: 'Replaced with 8mm transparent magnetic strip. No more water splashing.'
  },

  // Sea Point
  {
    id: 'snag-4',
    propertyId: 'prop-2',
    title: 'Pool circulation pump grinding noise on timer startup',
    area: 'Pool & Garden',
    severity: 'Urgent',
    status: 'Open',
    assignedContactId: 'contact-7',
    costEstimate: 1400,
    createdAt: '2025-02-21T07:45:00.000Z',
    notes: 'Bearing noise detected. Needs pump bearing replacement before motor seizes.'
  },
  {
    id: 'snag-5',
    propertyId: 'prop-2',
    title: 'Flatlet B bathroom extractor fan rattling loudly',
    area: 'Flatlet B Bathroom',
    severity: 'Normal',
    status: 'In Progress',
    assignedContactId: 'contact-2',
    costEstimate: 600,
    createdAt: '2025-02-16T11:00:00.000Z',
    notes: 'Reported by Sarah. Sipho ordered a low-noise 100mm inline ceiling fan.'
  },
  {
    id: 'snag-6',
    propertyId: 'prop-2',
    title: 'Side pedestrian gate latch stiff when humid',
    area: 'Entrance / Perimeter',
    severity: 'Cosmetic',
    status: 'Open',
    assignedContactId: 'contact-3',
    costEstimate: 150,
    createdAt: '2025-02-15T15:30:00.000Z',
    notes: 'Needs graphite lubricant or slight bracket filing.'
  },

  // Durbanville
  {
    id: 'snag-7',
    propertyId: 'prop-3',
    title: 'Borehole booster pump tripping earth leakage breaker',
    area: 'Utility Room / Garden',
    severity: 'Urgent',
    status: 'Open',
    assignedContactId: 'contact-2',
    costEstimate: 1200,
    createdAt: '2025-02-22T08:15:00.000Z',
    notes: 'Trips main board as soon as irrigation controller calls for water.'
  },
  {
    id: 'snag-8',
    propertyId: 'prop-3',
    title: 'Double garage sectional door top roller off track',
    area: 'Garage',
    severity: 'Normal',
    status: 'Open',
    assignedContactId: 'contact-3',
    costEstimate: 500,
    createdAt: '2025-02-20T16:00:00.000Z',
    notes: 'Door still opens manually but motor disengaged for safety.'
  }
]

export const INITIAL_VAULT: VaultItem[] = [
  // Prop 1
  {
    id: 'vlt-1',
    propertyId: 'prop-1',
    label: 'Prepaid Electricity Meter #',
    value: '04-2198-4921-7',
    category: 'Meter',
    isSecret: false,
    notes: 'City of Cape Town Conlog meter in hallway cupboard.'
  },
  {
    id: 'vlt-2',
    propertyId: 'prop-1',
    label: 'Main Gate & Intercom PIN',
    value: '*7492#',
    category: 'PIN / Code',
    isSecret: true,
    notes: 'Visitor keypad code. Dial 402 for intercom ring.'
  },
  {
    id: 'vlt-3',
    propertyId: 'prop-1',
    label: 'Fibre Wi-Fi Network & Key',
    value: 'GardensPenthouse-5G | TableMountain#2024',
    category: 'WiFi',
    isSecret: true,
    notes: 'Router located on shelf next to Smart TV.'
  },
  {
    id: 'vlt-4',
    propertyId: 'prop-1',
    label: 'Water Sub-Meter Serial',
    value: 'WM-CT-88301-A',
    category: 'Meter',
    isSecret: false,
    notes: 'Located in service duct opposite unit front door.'
  },
  {
    id: 'vlt-5',
    propertyId: 'prop-1',
    label: 'Insurance Policy Reference',
    value: 'OM-PROP-88912-SA',
    category: 'Insurance',
    isSecret: false,
    notes: 'Old Mutual Insure 24/7 claims: 0860 22 55 63'
  },
  {
    id: 'vlt-6',
    propertyId: 'prop-1',
    label: 'Main Water Stopcock Location',
    value: 'Under kitchen sink - Brass lever valve behind bin',
    category: 'Key Location',
    isSecret: false,
    notes: 'Quarter-turn clockwise shuts off entire apartment supply.'
  },

  // Prop 2
  {
    id: 'vlt-7',
    propertyId: 'prop-2',
    label: 'Main House Alarm Master Code',
    value: '9148',
    category: 'PIN / Code',
    isSecret: true,
    notes: 'Bay Security keypads at front door and master bed.'
  },
  {
    id: 'vlt-8',
    propertyId: 'prop-2',
    label: 'Flatlet B Prepaid Electricity Meter',
    value: '14-8839-2041-0',
    category: 'Meter',
    isSecret: false,
    notes: 'Hexing keypad inside Flatlet B kitchenette.'
  },
  {
    id: 'vlt-9',
    propertyId: 'prop-2',
    label: 'Sunsynk Inverter Master WiFi PIN',
    value: 'Inverter-Admin-8821',
    category: 'WiFi',
    isSecret: true,
    notes: 'Direct connection IP 10.10.100.254'
  },
  {
    id: 'vlt-10',
    propertyId: 'prop-2',
    label: 'Council Water Meter Serial',
    value: 'CCT-WM-990142',
    category: 'Meter',
    isSecret: false,
    notes: 'Sidewalk pavement box next to driveway pillar.'
  },

  // Prop 3
  {
    id: 'vlt-11',
    propertyId: 'prop-3',
    label: 'Electric Fence CoC Certificate #',
    value: 'EFC-2024-9912-DBN',
    category: 'Account #',
    isSecret: false,
    notes: 'NEMTEK energizer in workshop. Tested Nov 2024.'
  },
  {
    id: 'vlt-12',
    propertyId: 'prop-3',
    label: 'Gate & Garage Remote Frequency Channel',
    value: 'Ch 1: Main Sliding Gate | Ch 2: Garage Door',
    category: 'PIN / Code',
    isSecret: false,
    notes: 'Centurion 433MHz Nova remotes.'
  }
]

export const INITIAL_NOTES: PropertyNote[] = [
  {
    id: 'note-1',
    propertyId: 'prop-1',
    title: 'Annual Building Valuation & Levy Notice',
    content: 'Body corporate approved 4.5% levy increase for 2025 financial year to fund lift modernization project. Insurance replacement value raised to R 4,800,000.',
    category: 'Inspection',
    createdAt: '2025-01-20T10:00:00.000Z'
  },
  {
    id: 'note-2',
    propertyId: 'prop-1',
    title: 'Short-Stay Linen & Spare Key Stash',
    content: 'Full set of backup master keys and linen sets stored in basement storeroom lockbox (Code: 4402). Cleaners have their own tag.',
    category: 'Access & Keys',
    createdAt: '2025-02-02T14:30:00.000Z'
  },
  {
    id: 'note-3',
    propertyId: 'prop-2',
    title: 'Sarah Jenkins Lease Extension Agreed',
    content: 'Sarah renewed lease for Flatlet B for another 12 months at R 11,500/mo. Deposit R 17,250 held in interest-bearing account. Inspection completed with zero issues.',
    category: 'Tenant Interaction',
    createdAt: '2025-01-10T16:00:00.000Z'
  },
  {
    id: 'note-4',
    propertyId: 'prop-2',
    title: 'Solar & Battery Annual Health Check',
    content: 'SparkGuard tested 8kW Sunsynk and 2x 5.12kWh lithium batteries. SOH (State of Health) tested at 96.8%. Firmware updated to v4.38.',
    category: 'Maintenance Log',
    createdAt: '2025-02-05T09:15:00.000Z'
  },
  {
    id: 'note-5',
    propertyId: 'prop-3',
    title: 'Municipal Water Meter Discrepancy Note',
    content: 'Logged dispute with City of Cape Town for Jan estimate. Submitted photo reading of 1,429 kL. Waiting for account credit adjustment.',
    category: 'General',
    createdAt: '2025-02-12T11:00:00.000Z'
  }
]
