-- Cloudflare D1 Database Schema for PropPulse

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  address TEXT NOT NULL,
  units TEXT, -- JSON array of strings
  status TEXT NOT NULL DEFAULT 'Active',
  type TEXT NOT NULL DEFAULT 'Residential',
  rental_income REAL,
  color_theme TEXT,
  contact_ids TEXT, -- JSON array of contact IDs
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'Monthly',
  due_day INTEGER NOT NULL DEFAULT 1,
  is_paid INTEGER NOT NULL DEFAULT 0,
  last_paid_date TEXT,
  account_reference TEXT,
  notes TEXT,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS snags (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'Normal',
  status TEXT NOT NULL DEFAULT 'Open',
  assigned_contact_id TEXT,
  cost_estimate REAL,
  actual_cost REAL,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  notes TEXT,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_phone TEXT,
  email TEXT,
  company TEXT,
  notes TEXT,
  rating INTEGER DEFAULT 5,
  is_emergency_contact INTEGER DEFAULT 0,
  property_ids TEXT -- JSON array of property IDs
);

CREATE TABLE IF NOT EXISTS vault_items (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Meter',
  is_secret INTEGER DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TEXT NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'app_settings',
  currency_symbol TEXT DEFAULT 'R',
  currency_code TEXT DEFAULT 'ZAR',
  theme TEXT DEFAULT 'dark',
  enable_d1_sync INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);
