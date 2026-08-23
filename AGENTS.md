# AGENTS.md — Developer & Agent Reference

## 1. Project Overview & Tech Stack
**PropPulse** is a clean, mobile-first personal property & maintenance manager designed for high clarity, fast interaction, and zero-friction communication.

- **Frontend Framework:** Vue 3.5+ (Composition API with `<script setup>`) + Vite 6
- **Language:** TypeScript 5.7+ (Strict mode: `noUnusedLocals`, `noUnusedParameters`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons:** `lucide-vue-next`
- **State Management:** Pinia 2.3+ with `localStorage` primary persistence (`proppulse_data_v1`)
- **Theme:** Clean, spacious, high-contrast monochrome white (`bg-white`, `bg-zinc-50`, `border-zinc-200`, `text-zinc-950`)
- **Deployment & Edge Infrastructure:** Cloudflare Pages (SPA routing) + Cloudflare D1 (Serverless SQLite) + Pages Functions

---

## 2. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                              │
│                                                                         │
│   Vue 3 SPA (Vue Router) ──> Pinia Store (propertyStore.ts)             │
│                                     │                                   │
│                        ┌────────────┴────────────┐                      │
│                        ▼                         ▼                      │
│               LocalStorage (Offline)    Cloudflare D1 Sync              │
│               Key: proppulse_data_v1   (POST /api/sync)                 │
└──────────────────────────────────────────────────┬──────────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Cloudflare Edge Infrastructure                        │
│                                                                         │
│   Pages Static Hosting        Pages Functions (Serverless)              │
│   (public/_redirects)    ───> /api/sync & /api/properties               │
│                                           │                             │
│                                           ▼                             │
│                              Cloudflare D1 SQLite Database              │
│                              Binding: DB (proppulse_d1)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### State Store Structure (`src/stores/propertyStore.ts`)
- **`properties`:** List of `Property` objects (address, units, rental income, occupancy status).
- **`expenses`:** List of `Expense` objects (category, amount, frequency, due date, `isPaid` toggle, reference).
- **`snags`:** List of `Snag` objects (area, severity: `Urgent` | `Normal` | `Cosmetic`, status: `Open` | `In Progress` | `Resolved`, cost estimates, assigned contractor).
- **`contacts`:** Directory of `Contact` objects (phone, WhatsApp, email, role, 24/7 priority flag, rating).
- **`vault`:** List of `VaultItem` objects (meters, PINs, Wi-Fi keys, account numbers with 1-tap copy & secret masking).
- **`notes`:** Timestamped inspection and maintenance log history.
- **`settings`:** Currency preferences (`ZAR`, `USD`, `EUR`, `GBP`), D1 sync toggles, and last sync timestamp.

---

## 3. Cloudflare Bindings & Backend Endpoints

### Cloudflare Configuration (`wrangler.toml`)
```toml
name = "prop-app"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "proppulse_d1"
database_id = "b0e6f4c4-ea63-4f62-b28f-045f65d38af1"
migrations_dir = "d1"
```

### Database Tables (`d1/schema.sql`)
1. `properties` — ID, name, nickname, address, units (JSON), type, status, rental_income, contact_ids.
2. `expenses` — ID, property_id, name, category, amount, frequency, due_day, is_paid, account_reference, last_paid_date.
3. `snags` — ID, property_id, title, area, severity, status, assigned_contact_id, cost_estimate, actual_cost, resolved_at.
4. `contacts` — ID, name, role, company, phone, whatsapp_phone, email, rating, is_emergency_contact, property_ids.
5. `vault_items` — ID, property_id, label, value, category, is_secret, notes.
6. `property_notes` — ID, property_id, title, content, category, created_at.
7. `app_settings` — Single-row settings with currency and sync status.

### Pages Functions Endpoints (`functions/api/`)
- **`POST /api/sync`:** Ingests the full client state JSON payload and executes a transactional D1 batch upsert.
- **`GET /api/sync`:** Queries all tables from Cloudflare D1 and returns hydrated state.
- **`GET /api/properties`:** Returns a JSON list of properties with calculated monthly spend aggregates.

---

## 4. File Structure

```
prop-app/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # GitHub Actions CI/CD to Cloudflare Pages
├── d1/
│   └── schema.sql                 # D1 SQLite schema (7 tables)
├── functions/
│   └── api/
│       ├── properties.ts          # Pages Function for property queries
│       └── sync.ts                # Pages Function for D1 database sync
├── public/
│   ├── _redirects                 # SPA client routing rule (/* /index.html 200)
│   └── favicon.svg                # Application icon
├── src/
│   ├── components/
│   │   ├── modals/
│   │   │   ├── ContactModal.vue   # Add/Edit Contact form
│   │   │   ├── ExpenseModal.vue   # Add/Edit Expense form
│   │   │   ├── NoteModal.vue      # Add/Edit Note form
│   │   │   ├── PropertyModal.vue  # Add/Edit Property form
│   │   │   ├── SnagModal.vue      # Add/Edit Snag defect form
│   │   │   └── VaultModal.vue     # Add/Edit Key Detail / PIN form
│   │   ├── ContactCard.vue        # 1-tap Phone dial & WhatsApp launch
│   │   ├── KeyDetailBadge.vue     # 1-tap clipboard copy & secret reveal
│   │   ├── Navbar.vue             # Responsive Desktop top & Mobile bottom nav
│   │   ├── PropertyCard.vue       # Property overview card
│   │   ├── SnagCard.vue           # 1-click status cycle & contractor dispatch
│   │   ├── SpendSummaryCard.vue   # Monthly committed spend & progress bar
│   │   ├── ToastNotification.vue  # Floating feedback toast
│   │   └── WhatsAppMessageModal.vue # Pre-composed template messenger
│   ├── data/
│   │   └── seedData.ts            # Realistic default seed database
│   ├── router/
│   │   └── index.ts               # Vue Router configuration
│   ├── stores/
│   │   └── propertyStore.ts       # Pinia store + LocalStorage + D1 sync
│   ├── types/
│   │   └── property.ts            # Domain TypeScript models
│   ├── App.vue                    # Root application component
│   ├── main.ts                    # App entry & initialization
│   └── style.css                  # Tailwind styles & scrollbars
├── AGENTS.md                      # Developer & AI Agent Reference
├── index.html                     # HTML root template
├── package.json                   # NPM dependencies & scripts
├── README.md                      # Project overview & deployment guide
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite + Vue + Tailwind plugin config
└── wrangler.toml                  # Cloudflare Pages & D1 binding configuration
```

---

## 5. Completed Tasks & Features

- [x] **Full Domain Model:** Properties, Expenses, Snags, Contacts, Vault Items, Notes, Settings.
- [x] **Committed Spend Manager:** Real-time calculation of committed spend, progress bar, 1-tap bill reconciler.
- [x] **One-Click Snag Tracker:** Quick toggle / cycle status (`Open` → `In Progress` → `Resolved`), urgent indicator pills, direct contractor action triggers.
- [x] **Key Details & Meter Vault:** 1-click copy with animated toast, secret masking/reveal for PINs and passwords.
- [x] **Service Directory & Fast Dispatch:** Direct `tel:` links, pre-composed WhatsApp message templates (service request, quote, rent receipt).
- [x] **Property Hub (`/properties/:id`):** 5-tab dedicated property dashboard (Vault, Spend, Snags, Contacts, Logs).
- [x] **Backup & Portability:** Instant 1-click JSON export, JSON import (Replace/Merge), and 1-click seed reset.
- [x] **Clean White Theme Redesign:** Minimalist white theme (`bg-white`, `bg-zinc-50`, `border-zinc-200`, `text-zinc-950`).
- [x] **Cloudflare D1 & Pages Backend:** Remote D1 database created (`proppulse_d1`), schema executed, sync endpoints built.
- [x] **GitHub & CI/CD Setup:** Clean git repository on `main` branch with GitHub Actions deploy workflow.

---

## 6. Developer Commands

```bash
# Start local development server
npm run dev

# Run TypeScript type check and compile production bundle
npm run build

# Preview production build locally
npm run preview

# Deploy dist to Cloudflare Pages (via Wrangler)
npx wrangler pages deploy dist --project-name prop-app

# Execute schema on remote Cloudflare D1 database
npx wrangler d1 execute proppulse_d1 --remote --file=d1/schema.sql
```
