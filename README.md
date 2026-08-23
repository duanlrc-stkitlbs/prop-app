# PropPulse — Personal Property & Maintenance Manager

A clean, high-clarity, mobile-first admin dashboard for personal property management built with **Vue 3 (Composition API + `<script setup>`)**, **Vite**, **Tailwind CSS**, and **Pinia**. Designed specifically for homeowners and property investors who want zero friction, large touch targets, clear visual indicators, 1-tap communications, and seamless offline-first capability with Cloudflare D1 database support.

---

## 🌟 Key Features

### 1. 📊 Committed Monthly Spend & Expense Tracking
- **High-Level Spend Summary Card:** Displays total monthly committed spend across all properties or per property.
- **Paid vs. Pending Progress Bar:** Visual indicator showing settled vs pending bills for the current month.
- **1-Tap Payment Toggle:** Mark expenses as paid or unpaid with a single tap.
- **1-Tap "Mark All Paid":** Settle recurring monthly bills instantly at the start of a cycle.
- **Categorization:** Rates & Taxes, Water & Electricity, Maintenance, Body Corporate / Levies, Insurance, Internet, Mortgage / Bond, Security, and Garden/Pool.

### 2. 🛠️ One-Click Snag List & Repair Manager
- **One-Click Resolution:** Instant toggle or cycle (`Open` → `In Progress` → `Resolved`) directly from snag cards without digging into menus.
- **Severity Visual Hierarchy:** Glowing pulse badges for `Urgent` repairs, clean pills for `Normal` and `Cosmetic` tasks.
- **Direct Contractor Dispatch:** Assigned contractors have direct WhatsApp and Call shortcuts attached to the snag card.
- **Cost Tracking:** Estimated cost vs actual repair cost recording.

### 3. 🔑 Key Details & Utility Meter Vault
- **1-Tap Clipboard Copy:** Instant copy for prepaid electricity meter numbers, gate codes, intercom PINs, Wi-Fi credentials, and council account numbers with animated feedback toast.
- **Secret PIN Masking:** Eye toggle to reveal or conceal sensitive security codes and passwords.
- **Category Grouping:** Meters, PINs/Codes, Wi-Fi, Account Numbers, Insurance Policies, and Key Locations.

### 4. 📇 Global Service Directory & Direct Actions
- **1-Tap Phone Dialing:** Direct `tel:` links to call plumbers, electricians, handymen, and tenants.
- **Pre-Composed WhatsApp Actions:** 1-tap WhatsApp messenger with smart pre-composed templates (e.g., snag repair details, quote requests, rent confirmations).
- **24/7 Priority Emergency Pinning:** Highlight and pin master plumbers, electricians, and armed response to the top.
- **Rating Stars:** 1–5 star trust rating for contractors.

### 5. 🏠 Comprehensive Property Hub (`/properties/:id`)
- Tabbed/sectioned view for each property:
  1. **Key Vault:** All access codes and meter numbers specific to the property.
  2. **Expenses & Spend:** Monthly commitments, due dates, and paid toggles.
  3. **Snags & Tasks:** Active defect punch list and repair progress.
  4. **Contacts:** Filtered contractors and tenants linked to the property.
  5. **Notes & History:** Timestamped inspection reports, lease renewals, and maintenance logs.

### 6. 💾 Zero Data Loss & Cloudflare D1 Backend
- **Offline-First:** LocalStorage primary persistence via Pinia.
- **Export / Backup:** Instant 1-click `Download JSON backup`.
- **Import / Restore:** Replace or merge existing records from JSON backup files.
- **Seed Data Reset:** One-click restore of realistic Cape Town properties, municipal rates, and contractors.
- **Cloudflare Pages SPA Routing:** Configured `public/_redirects` (`/* /index.html 200`).
- **Cloudflare D1 SQLite & Pages Functions:** Full SQL schema in `d1/schema.sql`, backend endpoints in `functions/api/sync.ts` & `functions/api/properties.ts`, and `wrangler.toml` configuration.

---

## 🏗️ Project Structure

```
prop-app/
├── d1/
│   └── schema.sql                  # Cloudflare D1 SQLite schema
├── functions/
│   └── api/
│       ├── properties.ts           # Cloudflare Pages Function for properties
│       └── sync.ts                 # Cloudflare Pages Function for D1 database sync
├── public/
│   ├── _redirects                  # Cloudflare Pages SPA rewrite rule (/* /index.html 200)
│   └── favicon.svg                 # Application icon
├── src/
│   ├── components/
│   │   ├── modals/
│   │   │   ├── ContactModal.vue    # Add/Edit Contact drawer form
│   │   │   ├── ExpenseModal.vue    # Add/Edit Expense modal
│   │   │   ├── NoteModal.vue       # Add/Edit Property Note modal
│   │   │   ├── PropertyModal.vue   # Add/Edit Property modal
│   │   │   ├── SnagModal.vue       # Add/Edit Snag defect modal
│   │   │   └── VaultModal.vue      # Add/Edit Key Detail / PIN modal
│   │   ├── ContactCard.vue         # Contact card with 1-tap dial & WhatsApp
│   │   ├── KeyDetailBadge.vue      # 1-tap copy meter/PIN badge
│   │   ├── Navbar.vue              # Mobile bottom nav + Desktop top header
│   │   ├── PropertyCard.vue        # Dashboard property overview card
│   │   ├── SnagCard.vue            # Snag card with 1-click status cycling
│   │   ├── SpendSummaryCard.vue    # Monthly spend & progress bar
│   │   ├── ToastNotification.vue   # Animated feedback toasts
│   │   └── WhatsAppMessageModal.vue# Smart WhatsApp template composer
│   ├── data/
│   │   └── seedData.ts             # Realistic seed database
│   ├── router/
│   │   └── index.ts                # Vue Router SPA route definitions
│   ├── stores/
│   │   └── propertyStore.ts        # Pinia store + LocalStorage & D1 sync
│   ├── types/
│   │   └── property.ts             # TypeScript domain models
│   ├── App.vue                     # Root application component
│   ├── main.ts                     # Vue 3 entry point
│   └── style.css                   # Tailwind CSS setup & glassmorphism theme
├── index.html                      # HTML root template
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite + Tailwind plugins
└── wrangler.toml                   # Cloudflare Pages & D1 database configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- NPM

### Development Server
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```
Build output is generated in the `dist/` directory with `_redirects` included.

---

## ☁️ Cloudflare Pages & D1 Deployment

### Option 1: Direct Cloudflare Pages Git Integration
1. Connect your Git repository to **Cloudflare Pages**.
2. Set build settings:
   - **Framework preset:** `Vue` / `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Under **Settings → Functions → D1 database bindings**:
   - Variable name: `DB`
   - Select your Cloudflare D1 database.

### Option 2: Wrangler CLI Deployment
```bash
# 1. Create your Cloudflare D1 database
npx wrangler d1 create proppulse_d1

# 2. Apply the SQL schema
npx wrangler d1 execute proppulse_d1 --file=d1/schema.sql

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name prop-app
```
