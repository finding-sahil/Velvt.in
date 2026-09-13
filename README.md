# VELVT.in — Official Experience & Operations Platform

<p align="center">
  <img src="public/icon.png" alt="VELVT Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 0 40px rgba(200, 16, 46, 0.4);" />
</p>

<p align="center">
  <em>"It starts as a thought, ends as a memory."</em>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react" alt="React 19" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS v4" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-6.4.1-2D3748?style=flat-square&logo=prisma" alt="Prisma ORM" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" alt="Supabase PostgreSQL" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5" /></a>
  <a href="#"><img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License" /></a>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
  - [1. Public Event & Storytelling Portal](#1-public-event--storytelling-portal)
  - [2. Live Ticketing & Anti-Fraud Scanner](#2-live-ticketing--anti-fraud-scanner)
  - [3. Crew & Volunteer Credentialing](#3-crew--volunteer-credentialing)
  - [4. Personal Portfolio CMS for Directors](#4-personal-portfolio-cms-for-directors)
  - [5. Granular Section Switchboard](#5-granular-section-switchboard)
  - [6. Adaptive Editorial Theming Engine](#6-adaptive-editorial-theming-engine)
  - [7. Hardened Security & RBAC](#7-hardened-security--rbac)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Local Setup](#installation--local-setup)
  - [Environment Configuration](#environment-configuration)
  - [Database Push & Seeding](#database-push--seeding)
  - [Running the Development Server](#running-the-development-server)
- [Administrative Portal & Workflows](#-administrative-portal--workflows)
  - [Role-Based Access Control (RBAC) Matrix](#role-based-access-control-rbac-matrix)
  - [Gateman Live Scanner](#gateman-live-scanner)
  - [Section Visibility Controls](#section-visibility-controls)
- [Security & Quality Assurance](#-security--quality-assurance)
- [Production Deployment Checklist](#-production-deployment-checklist)
- [Detailed Technical Documentation](#-detailed-technical-documentation)

---

## 🏛 Overview

**VELVT.in** is a production-grade, full-stack digital platform engineered for **VELVT**, an elite nightlife experience and event organization based in India. Built around the flagship production **VELVT CURSE 2.O**, the platform represents VELVT as an enduring, high-production cultural institution.

Combining a **cinematic Gothic aesthetic** with **mission-critical operational infrastructure**, the system manages the complete lifecycle of experiential events: from high-conversion ticketing and brand storytelling to volunteer badge verification, camera-based gate check-in, and granular site governance.

---

## ⚡ System Architecture

```
                                  ┌───────────────────────────┐
                                  │      Client Browsers      │
                                  │ (Desktop / Mobile / PWA)  │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │    Next.js Edge Runtime   │
                                  │   (CSP / HSTS / Decoys)   │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
   ┌───────────────────────────┐                                 ┌───────────────────────────┐
   │    Public Experience      │                                 │   Admin Management Portal │
   │  (/, /events, /tickets)   │                                 │    (/velvt-management/*)  │
   ├───────────────────────────┤                                 ├───────────────────────────┤
   │ • 13 Dynamic Sections     │                                 │ • RBAC: 4 Permission Tiers│
   │ • Adaptive Theming Engine │                                 │ • Real-time Gate Scanner  │
   │ • 180ms Hysteresis Loaders│                                 │ • Section Switchboard     │
   │ • Zero-Lag Navigation     │                                 │ • Immutable Audit Logs    │
   └─────────────┬─────────────┘                                 └─────────────┬─────────────┘
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                ▼
                                  ┌───────────────────────────┐
                                  │ Server Actions & Auth API │
                                  │ (PBKDF2 100k, SubtleCrypto│
                                  │  Rate Limit, Atomic C&S)  │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │      Prisma 6.4.1 ORM     │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Supabase PostgreSQL     │
                                  │ (Pooled: 6543 / Direct: 5432)│
                                  └───────────────────────────┘
```

---

## 🌟 Key Features

### 1. Public Event & Storytelling Portal
- **Cinematic Atmosphere**: Gothic typography (Barlow Condensed & Inter), fluid glassmorphism, responsive ambient glows, and optional thematic blood drips.
- **Dynamic Event Routing**: Dynamic routing (`/events/[slug]`) featuring chronological schedules, interactive FAQ accordions, and venue access guides.
- **Visual Archive**: Interactive high-resolution media gallery with year/type filtering and modal lightboxes.

### 2. Live Ticketing & Anti-Fraud Scanner
- **Dual-Token Security**: Every pass features a public serial code (`VLT-2026-XXXXXX`) paired with a secret high-entropy UUIDv4 security token embedded in the QR payload.
- **Atomic Compare-and-Swap Check-in**: Eliminates double-entry fraud and race conditions through atomic SQL updates (`isCheckedIn: false`).
- **Camera-Based Gate Scanner**: Fullscreen mobile web scanner (`/velvt-management/gate`) with instant audio-haptic feedback, manual token fallback, and offline check sheets.
- **Mass Generator & Exports**: Rapid sheet generation, CSV gate export, and printable physical check-in rosters.

### 3. Crew & Volunteer Credentialing
- **Application & Onboarding**: Public application flow with anti-spam honeypot traps, photo upload, and role preferences.
- **Live Self-Service Status Tracker**: Candidates track application progress using their email with zero account setup.
- **Digital ID Passes**: Automated generation of official IDs (`VEL-2026-XXXXX`) and printable holographic passes at `/verify/[volunteerId]`.

### 4. Personal Portfolio CMS for Directors
- **Self-Service Portfolios**: Dedicated dashboard for Core Team directors (`/velvt-management/portfolio`) scoped strictly to their personal record.
- **Rich Biographical Storytelling**: Directors manage narrative bios, verified career achievements, skill sets, and production timelines.
- **Visibility Toggles**: Individual controls to hide or reveal sections on their public profile (`/team/[id]`).

### 5. Granular Section Switchboard
- **Minute Component Control**: Toggle any of the 13+ homepage sections on or off in real-time from the admin settings.
- **Master Curtain Gates**: Instant kill-switches for entire pages (`tickets`, `volunteers`, `gallery`, `press`) with branded maintenance screens.
- **Tactile UI Switches**: Custom-engineered physical-style toggle switches (`ToggleSwitch.tsx`) with animated state transitions.

### 6. Adaptive Editorial Theming Engine
Switch between 6 bespoke visual themes on the fly via root HTML `data-theme`:
- 🩸 **Legacy Velvt**: Signature obsidian black with velvet crimson accents.
- 🌕 **Blood Moon (Vampire Curse)**: Arterial crimson glows with animated blood drips.
- 🎃 **Wicked Pumpkin**: Harvest twilight, glowing embers, and warm candle hues.
- 👻 **Phantom Ghost**: Spectral crypt with icy ectoplasm cyan radiance.
- 🔮 **Witch Coven**: Midnight amethyst with toxic violet luminescence.
- ⚡ **Halloween Mix**: Grand multi-spectral fusion.

### 7. Hardened Security & RBAC
- **Native PBKDF2 Password Hashing**: 100,000 SHA-256 iterations via WebCrypto `SubtleCrypto` with constant-time verification.
- **Signed HMAC-SHA256 Sessions**: Tamper-proof HTTP-only cookie authentication.
- **Route Decoy**: Obfuscated management portal (`ADMIN_ROUTE_PREFIX`); requests to `/admin` return a clean `404`.
- **Sliding-Window Rate Limiting**: In-memory IP caps on logins, volunteer applications, inquiries, and public verifications.
- **PII Redaction**: Public verification endpoints mask attendee emails and phone numbers.
- **Immutable Audit Logging**: Every administrative mutation is permanently recorded in the `AuditLog` table.

---

## 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.4 (App Router) | Turbopack dev/build, Server Components, Server Actions |
| **UI Library** | React 19.2.8 | Latest concurrent features and transitions |
| **Styling** | Tailwind CSS v4 | CSS-first inline themes, zero runtime CSS overhead |
| **Database** | PostgreSQL via Supabase | Cloud PostgreSQL with PgBouncer connection pooling |
| **ORM** | Prisma 6.4.1 | Type-safe database queries, schema migrations |
| **Image Pipeline** | Sharp 0.35.4 | Server-side image optimization, WebP compression |
| **QR Engine** | `qrcode` & `html5-qrcode` | Pass generation and real-time camera decoding |
| **Security** | WebCrypto SubtleCrypto | Native PBKDF2 hashing, HMAC signing |
| **Language** | TypeScript 5 (Strict) | End-to-end type safety |

---

## 📁 Directory Structure

```
velvet-web/
├── docs/
│   └── SYSTEM_ARCHITECTURE.md       # Comprehensive architectural specification
├── prisma/
│   ├── schema.prisma                # 19 Prisma data models & relations
│   └── seed.ts                      # Database seeding script
├── public/
│   ├── uploads/                     # Local asset storage directory
│   ├── favicon.ico
│   ├── icon.png
│   └── apple-icon.png
├── scripts/
│   ├── audit-check.ts               # Quick administrative audit diagnostic
│   ├── security-audit-test.ts       # Security & penetration test suite
│   ├── stress-test.mjs              # Load & concurrency testing script
│   └── test-volunteer-flow.ts       # Volunteer onboarding smoke test
├── src/
│   ├── app/
│   │   ├── about/                   # About & mission page
│   │   ├── actions.ts               # Complete Server Actions backend (80+ actions)
│   │   ├── api/                     # Public REST & upload endpoints
│   │   ├── contact/                 # General inquiries & contact form
│   │   ├── events/                  # Event listings & dynamic [slug] pages
│   │   ├── founder/                 # Founder spotlight
│   │   ├── gallery/                 # High-resolution media archive
│   │   ├── globals.css              # Tailwind v4 theme, tokens & dark mode
│   │   ├── layout.tsx               # Root layout & atmospheric ambient layers
│   │   ├── page.tsx                 # Dynamic modular homepage
│   │   ├── press/                   # Press mentions & media kit
│   │   ├── sections/                # 13 modular homepage sections
│   │   ├── sponsors/                # Sponsorship portal & inquiry form
│   │   ├── team/                    # Core team directory & [id] portfolios
│   │   ├── tickets/                 # Ticket booking & pass selection
│   │   ├── velvt-management/        # Obfuscated admin management portal
│   │   │   ├── AdminNav.tsx         # Responsive admin navigation
│   │   │   ├── audit/               # Immutable audit log viewer
│   │   │   ├── events/              # Event production & schedules
│   │   │   ├── gallery/             # Visual archive curator
│   │   │   ├── gate/                # Live camera QR scanner
│   │   │   ├── gatemen/             # Gate staff account provisioning
│   │   │   ├── inquiries/           # Contact & sponsor inquiry management
│   │   │   ├── media/               # Media library with asset deletion
│   │   │   ├── portfolio/           # Personal portfolio CMS
│   │   │   ├── settings/            # Switchboard, theming & kill-switches
│   │   │   ├── team/                # Executive team & role management
│   │   │   ├── tickets/             # Pass issuance & batch generator
│   │   │   └── volunteers/          # Volunteer review & badge approval
│   │   ├── verify/                  # Public verification routes (pass & volunteer)
│   │   └── volunteers/              # Volunteer recruitment & application tracker
│   ├── components/
│   │   ├── layout/                  # Navigation, Footer, AppShell
│   │   └── ui/                      # ToggleSwitch, EventCard, Lightbox, etc.
│   ├── lib/
│   │   ├── admin-path.ts            # Route obfuscation helper
│   │   ├── audit.ts                 # Audit logging helper
│   │   ├── auth.ts                  # PBKDF2 hashing, sessions & RBAC
│   │   ├── db.ts                    # Prisma client singleton
│   │   ├── page-status.ts           # Master kill-switch check
│   │   ├── rate-limit.ts            # Sliding-window IP rate limiter
│   │   ├── section-switchboard.ts   # Minute section toggle registry
│   │   ├── ticket-generator.ts      # Anti-tamper ticket & QR builder
│   │   └── validations.ts           # Zod schema definitions
│   └── middleware.ts                # Edge security, CSP & route decoys
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `18.17.0` or higher
- **npm** or **yarn**
- **Supabase Account** (or local PostgreSQL instance)

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/finding-sahil/Velvt.in.git
   cd Velvt.in/velvet-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in `velvet-web/` by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Database Connections (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Keys (Optional for direct DB usage)
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Cryptographic Session Secret (Min 32 characters)
NEXTAUTH_SECRET="generate-a-secure-random-secret-key-32-chars-min"
NEXTAUTH_URL="http://localhost:3000"

# Admin Route Prefix (Obfuscated management path)
ADMIN_ROUTE_PREFIX="/velvt-management"

# Initial Seed Credentials
ADMIN_EMAIL="admin@velvt.in"
ADMIN_PASSWORD="ChooseAStrongPassword123!"

# Public Canonical Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Database Push & Seeding

Sync your database schema and seed the initial event and admin account:

```bash
# Push schema to Supabase PostgreSQL
npx prisma db push

# Seed initial admin user, flagship event, ticket tiers, and crew
npx tsx prisma/seed.ts
```

### Running the Development Server

Start the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Administrative Portal & Workflows

To access the management portal, navigate to your configured prefix:  
👉 **`http://localhost:3000/velvt-management`** *(or your custom `ADMIN_ROUTE_PREFIX`)*

### Role-Based Access Control (RBAC) Matrix

| Portal Module | Founder | Admin | Core Team | Gateman |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard Metrics** | ✅ | ✅ | ❌ | ❌ |
| **Events & Schedules** | ✅ | ✅ | ❌ | ❌ |
| **Ticket Issuance & Batches** | ✅ | ✅ | ❌ | ❌ |
| **Live Camera Gate Scanner** | ✅ | ✅ | ❌ | ✅ |
| **Gatemen Staff Accounts** | ✅ | ✅ | ❌ | ❌ |
| **Volunteer Approvals & Badges**| ✅ | ✅ | ❌ | ❌ |
| **Personal Portfolio CMS** | ✅ | ✅ | ✅ *(Scoped)* | ❌ |
| **Media Library & Asset Deletion**| ✅ | ✅ | ❌ | ❌ |
| **Site Settings & Switchboard** | ✅ | ✅ | ❌ | ❌ |
| **Theming & Emergency Curtains**| ✅ | ✅ | ❌ | ❌ |
| **Immutable Audit Logs** | ✅ | ✅ | ❌ | ❌ |
| **Superuser Privileges (Founders)**| ✅ | ❌ | ❌ | ❌ |

### Gateman Live Scanner
1. Login with a staff account with `role === 'gateman'`.
2. The interface automatically directs to `/velvt-management/gate`.
3. Point the device camera at attendee passes. Valid passes trigger a green success screen; duplicate passes immediately show a red conflict warning with check-in timestamp and staff ID.

### Section Visibility Controls
1. Navigate to `/velvt-management/settings`.
2. Scroll to **Granular Section Switchboard**.
3. Toggle any homepage section or master page curtain off/on using the tactile switches. Changes take effect across public views instantly.

---

## 🛡 Security & Quality Assurance

Run the automated test and diagnostic suites:

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run Security & Penetration Audit
npx tsx scripts/security-audit-test.ts

# Run Load & Concurrency Stress Test
node scripts/stress-test.mjs

# Run Diagnostic Verification
npx tsx scripts/audit-check.ts
```

---

## 📦 Production Deployment Checklist

1. **Database Connection Pooling**: Ensure `DATABASE_URL` targets port `6543` with `?pgbouncer=true` and `DIRECT_URL` targets port `5432`.
2. **Environment Secrets**: Generate a high-entropy string for `NEXTAUTH_SECRET` (`openssl rand -base64 32`).
3. **Admin Route Prefix**: Change `ADMIN_ROUTE_PREFIX` in production to an unguessable path (e.g. `/sys-vlt-ops-772`).
4. **Build & Verify**:
   ```bash
   npm run build
   ```
5. **Vercel / Cloud Run**: Connect repository, set environment variables, and deploy with zero downtime.

---

## 📚 Detailed Technical Documentation

For the exhaustive engineering specification, data models, cryptographic proofs, and operational runbooks, refer to:  
👉 **[`docs/SYSTEM_ARCHITECTURE.md`](docs/SYSTEM_ARCHITECTURE.md)**

---

<p align="center">
  <strong>VELVT India</strong> · Designed for the Night · Engineered for Eternity
</p>
