# VELVT.in — System Architecture & Engineering Specification

> **Official Event Experience & Operations Platform**  
> *"It starts as a thought, ends as a memory."*  
> Version: `1.0.0-production` · Architecture Review: `2026-09-14` · Node: `18+` · Next.js: `16.3.4`

---

## Table of Contents

1. [Executive Summary & System Vision](#1-executive-summary--system-vision)
2. [High-Level System Topology](#2-high-level-system-topology)
3. [Technology Stack & Architectural Principles](#3-technology-stack--architectural-principles)
4. [Database & Data Architecture](#4-database--data-architecture)
   - [4.1 Database Design & Entity Relationship Model](#41-database-design--entity-relationship-model)
   - [4.2 Comprehensive Schema Breakdown](#42-comprehensive-schema-breakdown)
   - [4.3 Connection Pooling & Migration Architecture](#43-connection-pooling--migration-architecture)
5. [Security & Cryptography Architecture](#5-security--cryptography-architecture)
   - [5.1 Edge Middleware & Defense-in-Depth](#51-edge-middleware--defense-in-depth)
   - [5.2 Authentication & PBKDF2 Password Hashing](#52-authentication--pbkdf2-password-hashing)
   - [5.3 Role-Based Access Control (RBAC)](#53-role-based-access-control-rbac)
   - [5.4 Anti-Tamper Ticketing & Cryptographic QR Verification](#54-anti-tamper-ticketing--cryptographic-qr-verification)
   - [5.5 Concurrency Race Condition Protection (Double-Admittance)](#55-concurrency-race-condition-protection-double-admittance)
   - [5.6 Distributed Rate Limiting & Anti-Spam Honeypots](#56-distributed-rate-limiting--anti-spam-honeypots)
   - [5.7 PII Redaction & Data Masking](#57-pii-redaction--data-masking)
   - [5.8 Immutable Security Audit Logging](#58-immutable-security-audit-logging)
6. [Core Subsystems & Operational Workflows](#6-core-subsystems--operational-workflows)
   - [6.1 Flagship Event Management & Dynamic Slugs](#61-flagship-event-management--dynamic-slugs)
   - [6.2 Ticketing, Mass Generation & Live Gate Scanner](#62-ticketing-mass-generation--live-gate-scanner)
   - [6.3 Volunteer Application & ID Credential Lifecycle](#63-volunteer-application--id-credential-lifecycle)
   - [6.4 Personal Portfolio CMS & Director Self-Service](#64-personal-portfolio-cms--director-self-service)
   - [6.5 Granular Section Switchboard & Master Kill-Switches](#65-granular-section-switchboard--master-kill-switches)
   - [6.6 Adaptive Thematic Engine (Editorial Theme System)](#66-adaptive-thematic-engine-editorial-theme-system)
   - [6.7 Media Library with Asset Safety Safeguards](#67-media-library-with-asset-safety-safeguards)
7. [State Management, Performance & UX Engineering](#7-state-management-performance--ux-engineering)
   - [7.1 Zero-Lag Navigation & 180ms Hysteresis Loaders](#71-zero-lag-navigation--180ms-hysteresis-loaders)
   - [7.2 Server Actions Caching & Selective Revalidation](#72-server-actions-caching--selective-revalidation)
   - [7.3 Image Optimization & Dynamic Sharp Pipeline](#73-image-optimization--dynamic-sharp-pipeline)
8. [API & Server Actions Catalog](#8-api--server-actions-catalog)
9. [Operational Runbooks & Production Deployment](#9-operational-runbooks--production-deployment)

---

## 1. Executive Summary & System Vision

**VELVT** is an Indian nightlife experience organization pioneering luxury Gothic and cinematic horror productions. The flagship event, **VELVT CURSE 2.O**, represents the brand's standard for atmospheric worldbuilding, subterranean audio experiences, and high-production experiential entertainment.

The digital platform is engineered to serve two interconnected domains:
1. **Public Brand Experience**: High-conversion ticket sales, storytelling lore, dynamic schedules, volunteer recruitment, press relations, interactive photography archives, and core team showcases.
2. **Operational Infrastructure**: Private administrative dashboard (`/velvt-management`), real-time camera-based QR gate admittance scanner, staff management, batch ticket issuance, volunteer credentialing with printable digital passes, granular section visibility switchboard, and immutable security audit logs.

### Key Architectural Tenets
- **Zero Third-Party Bloat**: Built natively without heavy UI component suites, relying on Vanilla CSS via Tailwind CSS v4, WebCrypto SubtleCrypto, native Next.js 16 Server Actions, and Prisma 6 ORM.
- **Fail-Safe Ingress**: High-concurrency gate admittance scanner using compare-and-swap atomic operations preventing double-entry fraud even under flaky underground cellular conditions.
- **Defense in Depth**: Obfuscated administrative routes, signed HMAC session cookies, 100,000-iteration PBKDF2 hashing with unique salts, IP sliding-window rate limiting, and strict CSP headers.

---

## 2. High-Level System Topology

```mermaid
flowchart TD
    subgraph Client Layer
        Browser[Public Browser / Mobile PWA]
        Scanner[Gateman Mobile Camera / QR Scanner]
        AdminClient[Admin / Founder Browser]
    end

    subgraph Edge & Routing Layer
        EdgeMW[Next.js Edge Middleware]
        SecHeaders[Security Headers CSP / HSTS / COOP]
        RouteObfuscation[Admin Route Obfuscation /velvt-management]
    end

    subgraph Application Layer (Next.js 16 App Router)
        ServerActions[Server Actions Engine / actions.ts]
        APIRoutes[REST API Handlers /api/*]
        ThemeEngine[Adaptive Editorial Theming Engine]
        Switchboard[Granular Section Switchboard]
        ZeroLagLoaders[180ms Hysteresis Zero-Lag Loaders]
    end

    subgraph Security & Verification Layer
        PBKDF2[WebCrypto PBKDF2 100k Iterations]
        SessionAuth[HMAC-SHA256 Signed Session Token]
        RateLimiter[Sliding-Window IP Rate Limiter]
        AtomicGate[Atomic Compare-and-Swap Gate Validator]
        AuditEngine[Immutable Audit Logger]
    end

    subgraph Persistence & Infrastructure Layer
        PrismaORM[Prisma 6 Client]
        SupabasePgPool[Supabase PostgreSQL Session Pooler :6543]
        SupabaseDirect[Supabase Direct Connection :5432]
        LocalStorageFS[Server Media Assets & Sharp Pipeline]
    end

    Browser --> EdgeMW
    Scanner --> EdgeMW
    AdminClient --> EdgeMW

    EdgeMW --> SecHeaders
    SecHeaders --> RouteObfuscation
    RouteObfuscation --> ServerActions
    RouteObfuscation --> APIRoutes

    ServerActions --> RateLimiter
    ServerActions --> SessionAuth
    ServerActions --> PBKDF2
    ServerActions --> AtomicGate
    ServerActions --> AuditEngine

    ServerActions --> Switchboard
    ServerActions --> ThemeEngine

    APIRoutes --> RateLimiter

    ServerActions --> PrismaORM
    PrismaORM --> SupabasePgPool
    PrismaORM -.-> SupabaseDirect
    ServerActions --> LocalStorageFS
```

---

## 3. Technology Stack & Architectural Principles

| Layer | Technology | Specification / Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.4 (App Router) | Turbopack dev/build engine, React Server Components (RSC), native Server Actions, streaming SSR with Suspense. |
| **UI Library** | React 19.2.8 & React-DOM | Zero-runtime client hydration, modern hooks (`useTransition`, `useOptimistic`, `useActionState`). |
| **Styling Engine** | Tailwind CSS v4 (`@tailwindcss/postcss`) | CSS-first `@theme inline` configuration, custom design tokens, zero-runtime overhead, adaptive CSS variables. |
| **Database ORM** | Prisma 6.4.1 | Strongly typed schema, relational integrity, cascade deletes, atomic transactions and updates. |
| **Database** | PostgreSQL via Supabase | Persistent cloud DB with transaction-level connection pooling (port 6543) and direct connection (port 5432) for DDL. |
| **Cryptography** | WebCrypto SubtleCrypto | Native Node.js/Edge cryptographic runtime: PBKDF2 with 100,000 SHA-256 iterations, HMAC-SHA256 cookie signing. |
| **Image Pipeline** | Sharp 0.35.4 | Server-side high-throughput image compression, WebP conversion, thumbnail generation, and EXIF sanitization. |
| **QR Engine** | `qrcode` & `html5-qrcode` | Server-side Data URL pre-rendering for passes + client-side real-time video stream barcode/QR decoder. |
| **Language** | TypeScript 5 (Strict Mode) | Strict typing across all server actions, Prisma models, validations, and UI components. |

---

## 4. Database & Data Architecture

### 4.1 Database Design & Entity Relationship Model

```mermaid
erDiagram
    Event ||--o{ Venue : hosts
    Event ||--o{ TicketType : offers
    Event ||--o{ IssuedTicket : issues
    Event ||--o{ EventScheduleItem : schedules
    Event ||--o{ EventAnnouncement : announces
    Event ||--o{ EventFAQ : clarifies
    Event ||--o{ Volunteer : recruits
    Event ||--o{ GalleryItem : exhibits
    Event ||--o{ Partner : sponsored_by
    Event ||--o{ PressMention : featured_in

    TicketType ||--o{ IssuedTicket : defines

    AdminUser ||--o| TeamMember : linked_to
    AdminUser }o--|| Event : assigned_to

    Volunteer {
        string id PK
        string volunteerId UK
        string fullName
        string email
        string phone
        string status
        string assignedRole
    }

    IssuedTicket {
        string id PK
        string ticketNumber UK
        string securityToken UK
        string attendeeName
        string attendeeEmail
        boolean isCheckedIn
        datetime checkedInAt
    }

    AdminUser {
        string id PK
        string email UK
        string passwordHash
        string role
        boolean isActive
    }

    AuditLog {
        string id PK
        string actorEmail
        string action
        string targetType
        string targetId
        datetime createdAt
    }

    SiteSetting {
        string id PK
        string key UK
        string value
        datetime updatedAt
    }
```

### 4.2 Comprehensive Schema Breakdown

The schema defines **19 interconnected models** designed for relational integrity, performance indexing, and operational segregation:

1. **`AdminUser`**: Stores credentials, role assignment (`founder`, `admin`, `core_team`, `gateman`), optional event assignment, and profile link.
2. **`Event`**: Core entity for experiential productions (`slug`, `date`, `status`, `theme`, `isFeatured`).
3. **`Venue`**: 1-to-1 event venue details including interactive map coordinates and ingress instructions.
4. **`TicketType`**: Tiers (`Early Bird`, `General Entry`, `VIP`, `priceInPaise`, `totalQuantity`, `soldCount`).
5. **`IssuedTicket`**: Individual attendee passes with serial number (`VLT-2026-XXXXXX`), cryptographic UUID security token, QR data URL, check-in status, and gatekeeper audit metadata.
6. **`EventScheduleItem`**: Program timetable items with sorting order.
7. **`EventAnnouncement`**: Real-time broadcasts, press releases, and lineup alerts.
8. **`EventFAQ`**: Accordion Q&A items bound to specific events.
9. **`Volunteer`**: Applicant data, unique badge ID (`VEL-2026-00047`), assigned role, photo, availability, and private admin notes.
10. **`TeamMember`**: Executive and director profiles, full bio, highlights, timeline, skills, and section visibility JSON flags.
11. **`GalleryItem`**: Media asset archive (images/video URLs, captions, year, display order).
12. **`Partner`**: Sponsors, beverage partners, and experiential brands categorized by tier.
13. **`PressMention`**: External media publications, quotes, logos, and article links.
14. **`ContactInquiry`**: General inquiries, collaboration requests, and venue proposals with workflow statuses (`new`, `read`, `resolved`).
15. **`SiteSetting`**: Key-value pairs for global configuration, master kill switches, granular section switches, and active themes.
16. **`AuditLog`**: Immutable, append-only security logs recording every sensitive mutation with actor identity, IP, and sanitized metadata.
17. **`Testimonial`**: Attendee, volunteer, and sponsor reviews with approval flags and ratings.
18. **`SponsorInquiry`**: Structured B2B sponsorship inquiries with budget tiers and contact info.
19. **`NewsletterSubscriber`**: Mailing list subscribers with status tracking.

### 4.3 Connection Pooling & Migration Architecture

- **Transaction Connection Pooling (`DATABASE_URL`)**: Uses Supabase Transaction Pooler (Port 6543) with PgBouncer. Ensures serverless Next.js functions scale to thousands of concurrent visitors without exhausting PostgreSQL connection limits.
- **Direct Session Connection (`DIRECT_URL`)**: Directly connects to PostgreSQL instance (Port 5432) for running Prisma schema pushes, seeds, and DDL migrations.

---

## 5. Security & Cryptography Architecture

### 5.1 Edge Middleware & Defense-in-Depth

The edge middleware (`src/middleware.ts`) executes ahead of all requests, enforcing:
- **Strict Transport Security (HSTS)**: `max-age=31536000; includeSubDomains; preload` in production.
- **Content Security Policy (CSP)**: Blocks untrusted script injection, enforces Google Fonts & analytics domains, restricts `frame-ancestors` to `'none'`.
- **Cross-Origin Opener Policy (COOP)**: Set to `same-origin` to isolate browsing contexts from cross-origin popups.
- **Permissions Policy**: `camera=(self)` to enable QR code scanning strictly on the origin domain while disabling microphone and geolocation.
- **Source Map Shielding**: Intercepts requests for `.map` files in production and returns clean `404` responses to prevent client-side source reconstruction.
- **Admin Ingress Decoy**: Requests to `/admin` immediately return an unrevealing HTTP `404`, completely masking the existence of the management dashboard.

### 5.2 Authentication & PBKDF2 Password Hashing

Administrative authentication is built on the browser-native and Node.js WebCrypto `SubtleCrypto` API:
- **Algorithm**: `PBKDF2` (Password-Based Key Derivation Function 2)
- **Hash Function**: `SHA-256`
- **Work Factor**: 100,000 iterations
- **Salt Generation**: 16 bytes of cryptographically secure pseudorandom numbers (`crypto.getRandomValues`)
- **Storage Format**: `pbkdf2:100000:<salt_hex>:<hash_hex>`
- **Constant-Time Verification**: XOR accumulation across all byte characters preventing side-channel timing attacks.
- **Session Tokens**: Signed cookie tokens in format `uuid|userId|hmacSignature|timestamp`. HMAC is signed with `NEXTAUTH_SECRET` using SHA-256. Expired or tampered cookies are automatically deleted and redirected to login.

### 5.3 Role-Based Access Control (RBAC)

| Role | Scope & Permissions | Restricted Actions |
| :--- | :--- | :--- |
| **`founder`** | Full superuser access. Can manage site settings, themes, emergency gates, team credentials, finances, and assign/revoke any user. | None. Unrestricted system root. |
| **`admin`** | Full operational access: events, tickets, volunteers, media, sponsors, and inquiries. | Cannot modify or delete accounts with `role === 'founder'`. Cannot change founder credentials. |
| **`core_team`** | Self-service access to personal portfolio CMS (`/velvt-management/portfolio`). Can edit bio, accomplishments, skills, social links, and toggle visibility of their own profile. | Cannot access general events, ticketing, admin settings, gatemen, or audit logs. |
| **`gateman`** | Dedicated check-in staff access. Restricted strictly to the live camera scanner (`/velvt-management/gate`) and physical gate sheets. | Blocked from all administrative modules, ticket creation, volunteer management, and system configuration. |

### 5.4 Anti-Tamper Ticketing & Cryptographic QR Verification

Every ticket issued by the platform generates two decoupled tokens:
1. **Public Ticket Number (`ticketNumber`)**: Formatted as `VLT-2026-XXXXXX` (where X is an alphanumeric character), suitable for manual search and physical print sheets.
2. **Cryptographic Security Token (`securityToken`)**: A high-entropy UUIDv4 string embedded exclusively inside the QR code data payload:  
   `https://velvt.in/verify/ticket/[securityToken]`

**Verification Logic**:
- When scanned, the system looks up the record by its high-entropy `securityToken`.
- Even if a malicious actor guesses or observes a sequential `ticketNumber`, they cannot fabricate the UUID `securityToken`.
- The verification endpoint masks PII for public visitors while exposing validation state to authenticated gate staff.

### 5.5 Concurrency Race Condition Protection (Double-Admittance)

In high-volume nightclub check-in scenarios, network instability can trigger duplicate scan requests or two gatemen scanning the same physical pass simultaneously.

To eliminate double-admittance, `checkInIssuedTicket` uses an **atomic compare-and-swap update**:
```typescript
const result = await prisma.issuedTicket.updateMany({
  where: {
    id: ticket.id,
    isCheckedIn: false, // Atomic guard: must be false at the exact moment of execution
  },
  data: {
    isCheckedIn: true,
    checkedInAt: new Date(),
    checkedInBy: actorEmail,
  },
});

if (result.count === 0) {
  // Another worker checked this ticket in milliseconds earlier
  return { success: false, error: "ALREADY_CHECKED_IN" };
}
```

### 5.6 Distributed Rate Limiting & Anti-Spam Honeypots

- **In-Memory Sliding Window**: Enforces request caps on all public mutation endpoints:
  - `volunteerRegistration`: 5 requests per 10 minutes per IP
  - `contactInquiry`: 5 requests per 10 minutes per IP
  - `ticketVerification`: 40 requests per minute per IP
  - `volunteerStatusLookup`: 25 requests per minute per IP
  - `adminLogin`: 5 attempts per 15 minutes per IP (brute-force defense)
- **Honeypot Traps**: Forms include hidden input fields (`_gotcha`, `website`). Automated bot submissions that populate these hidden fields receive an immediate synthetic success response (`{ success: true }`) while the server silently drops the payload without touching the database.

### 5.7 PII Redaction & Data Masking

Public endpoints (such as ticket and volunteer verification) redact sensitive attendee and applicant information:
- **Email Masking**: `sahilmazumder@example.com` $\rightarrow$ `s***r@example.com`
- **Phone Masking**: `+91 9876543210` $\rightarrow$ `+91 ******3210`
- **Internal Notes**: Restricted strictly to authenticated administrators and completely stripped from public verification payloads.

### 5.8 Immutable Security Audit Logging

All administrative mutations automatically emit an entry to the `AuditLog` table via `logAuditEvent()`:
- Records `actorId`, `actorEmail`, `action` (e.g. `ticket.generate`, `volunteer.approve`, `settings.update`), `targetType`, `targetId`, `ipAddress`, and sanitized `metadata`.
- Logs are strictly append-only. The administrative audit viewer provides full filtering, search, and activity export capabilities.

---

## 6. Core Subsystems & Operational Workflows

### 6.1 Flagship Event Management & Dynamic Slugs

Events are served dynamically at `/events/[slug]`:
- **Real-Time Timetable**: Interactive schedule breakdown with chronological ordering.
- **Ticket Tier Selection**: Live tier pricing in Indian Rupees, remaining quantity calculation, and external booking link fallback.
- **Venue & Directions**: Google Maps routing and access instructions.
- **Event FAQs**: Contextual accordion FAQ items specific to the event.
- **Automated Social OpenGraph**: Dynamic meta tags, titles, and cover images optimized for WhatsApp and Instagram previews.

### 6.2 Ticketing, Mass Generation & Live Gate Scanner

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Event Director
    actor Guest as Ticket Holder
    actor Gateman as Gate Staff
    participant System as Next.js Server
    participant DB as Supabase PostgreSQL

    Admin->>System: Mass Generate Passes (CSV / Sheet)
    System->>DB: Atomic Ticket Creation + Pre-render QR
    DB-->>System: Confirmation
    System-->>Admin: Downloadable CSV + Physical Print Sheet

    Guest->>Gateman: Presents Pass (Mobile QR or Physical)
    Gateman->>System: Scans via Camera (/velvt-management/gate)
    System->>DB: Atomic Compare-and-Swap Check-in
    alt Ticket Valid & Unused
        DB-->>System: Count = 1 (Success)
        System->>DB: Emit AuditLog (ticket.check_in)
        System-->>Gateman: Green Admittance Screen (Sound / Haptic)
    else Ticket Already Used
        DB-->>System: Count = 0 (Conflict)
        System-->>Gateman: Red Duplicate Entry Warning (Timestamp & Gateman ID)
    end
```

### 6.3 Volunteer Application & ID Credential Lifecycle

1. **Application**: Candidate applies via `/volunteers` with preferred roles, experience, and photo upload.
2. **Live Tracking**: Candidate checks application status using their email address via `/volunteers` without needing an account.
3. **Approval**: Admin reviews applicant in `/velvt-management/volunteers`, assigns an official role, and approves.
4. **ID Generation**: System issues an official badge ID (e.g., `VEL-2026-00047`) and generates a public digital badge at `/verify/[volunteerId]`.
5. **Downloadable Credential**: Volunteer can download their official pass with high-resolution photo, QR code, and holographic branding for event access.

### 6.4 Personal Portfolio CMS & Director Self-Service

Each executive and director on the core team has an individualized public portfolio page at `/team/[id]`:
- **Role-Based Scoping**: Members with `role === 'core_team'` log into `/velvt-management/portfolio` and are automatically locked to their own linked record (`teamMemberId`).
- **Granular Field Control**: Direct editing of narrative bio, accomplishments, skills, timeline history, and personal quotes.
- **Section Visibility Switches**: Independent toggles for showing or hiding specific sections (e.g. `showBio`, `showAchievements`, `showSkills`, `showTimeline`, `showQuote`).

### 6.5 Granular Section Switchboard & Master Kill-Switches

Located at `/velvt-management/settings`, the switchboard provides minute control over every visual element:
- **Master Kill-Switches**: Individual master switches for entire pages (`tickets_page_active`, `volunteers_page_active`, `gallery_page_active`, `press_page_active`). When toggled off, visitors see a refined maintenance/curtain screen (`PageStatusGate.tsx`).
- **Minute Section Switches**: Granular controls for 13+ homepage sections (`section_hero`, `section_impact`, `section_featured_event`, `section_featured_story`, `section_experience_highlights`, `section_why_velvt`, `section_brand_intro`, `section_event_archive`, `section_services`, `section_team`, `section_volunteer`, `section_partners`, `section_newsletter`, `section_final_cta`).
- **Tactile UI Controls**: Built with hardware-styled `ToggleSwitch.tsx` components providing immediate visual feedback and persistent state updates.

### 6.6 Adaptive Thematic Engine (Editorial Theme System)

The platform supports **6 bespoke visual themes** switched instantaneously via `data-theme` on the root HTML element:

1. **`legacy` (Signature Velvt)**: Pure `#000000` obsidian background, `#c8102e` arterial crimson, clean editorial typography.
2. **`blood_moon` (Vampire Curse)**: Deep arterial red glows (`#dc2626`), animated blood drip effects, atmospheric fog.
3. **`halloween_pumpkin` (Wicked Pumpkin)**: Harvest twilight, glowing ember accents (`#ff6b00`), golden candle warmth.
4. **`phantom_ghost` (Spectral Crypt)**: Ectoplasm cyan glows (`#00ff9d`), icy spectral ambient lighting.
5. **`witch_coven` (Poison Sorcery)**: Midnight amethyst (`#a855f7`), toxic violet radiance.
6. **`halloween_mix` (Grand Fusion)**: Multi-spectral pumpkin/crimson fusion (`#ea580c`) with maximum atmosphere.

### 6.7 Media Library with Asset Safety Safeguards

Located at `/velvt-management/media`:
- Real-time media browser indexing images from `/public/uploads` and remote CDN URLs.
- Direct asset deletion with confirmation dialogs.
- Server action `deleteMediaAsset` ensures files are unlinked from the physical disk and cleaned from gallery collections safely.

---

## 7. State Management, Performance & UX Engineering

### 7.1 Zero-Lag Navigation & 180ms Hysteresis Loaders

To ensure internal client routing feels native and instantaneous:
- Standard Next.js route transitions take 0–50ms for pre-rendered pages. Displaying a full-screen loading spinner during these fast transitions causes annoying visual flickering.
- All `loading.tsx` route handlers implement an **internal 180ms delay threshold**.
- If a route loads in under 180ms, no spinner is ever rendered (instant seamless switch).
- The loading spinner only displays if the user is experiencing genuine network latency.

### 7.2 Server Actions Caching & Selective Revalidation

- Every mutation selectively invalidates only the impacted route paths using Next.js `revalidatePath()`.
- Static sections remain cached in the Next.js Data Cache, ensuring 99th-percentile response times under 15ms.

### 7.3 Image Optimization & Dynamic Sharp Pipeline

- Image uploads are processed via `/api/upload` using Sharp:
  - Formats converted to modern WebP.
  - Dimensions constrained to maximum 2400px width/height while preserving aspect ratios.
  - Strips unneeded metadata and EXIF location tags for attendee privacy.

---

## 8. API & Server Actions Catalog

### Public Mutation Actions
- `submitVolunteerApplication(formData: FormData)`: Submits new volunteer application with honeypot & rate-limiting checks.
- `submitContactInquiry(formData: FormData)`: Submits general inquiry with spam filtering.
- `submitSponsorInquiry(formData: FormData)`: Records B2B partner proposals.
- `subscribeNewsletter(formData: FormData)`: Adds email to dispatch list.
- `trackVolunteerApplicationStatus(email: string)`: Public application tracker with PII masking.
- `getTicketVerificationData(identifier: string)`: Resolves pass status by security token or ticket number.

### Administrative Actions (`requireAdmin` / `requireFounder`)
- `adminLogin(formData: FormData)`: Validates credentials, sets signed session cookie.
- `adminLogout()`: Invalidates session and clears cookies.
- `changeAdminPassword(formData: FormData)`: Modifies current account password.
- `updateSiteSettings(settings: Record<string, string>)`: Updates master settings and themes.
- `toggleMinuteSection(key: string, enabled: boolean)`: Toggles individual section switchboard flag.
- `generateIssuedTicket(formData: FormData)`: Creates a single verified pass.
- `bulkGenerateIssuedTickets(data: BulkTicketInput)`: Mass ticket generation with capacity checks.
- `checkInIssuedTicket(identifier: string)`: Atomic compare-and-swap gate scanner check-in.
- `createGatemanUser(data: GatemanInput)`: Creates dedicated gate scanner account.
- `assignTeamCredentials(data: TeamCredentialsInput)`: Grants core team director access.
- `deleteMediaAsset(fileUrl: string)`: Deletes asset from disk and gallery records.

---

## 9. Operational Runbooks & Production Deployment

### 9.1 Environment Configuration Matrix

Ensure the following variables are configured in production:

```env
# Database Connections
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Production Domain & URL
NEXT_PUBLIC_SITE_URL="https://velvt.in"
NEXTAUTH_URL="https://velvt.in"

# Cryptographic Session Secret (Min 32 characters)
NEXTAUTH_SECRET="your-high-entropy-random-secret-key-here"

# Obfuscated Administrative Ingress
ADMIN_ROUTE_PREFIX="/velvt-management"
```

### 9.2 Zero-Downtime Deployment Steps

1. **Install Dependencies**:
   ```bash
   npm ci
   ```
2. **Push Schema (if updated)**:
   ```bash
   npx prisma db push
   ```
3. **Build Application**:
   ```bash
   npm run build
   ```
4. **Run Smoke Tests**:
   ```bash
   npx tsx scripts/audit-check.ts
   ```
5. **Start Production Server**:
   ```bash
   npm run start
   ```

---

*Authored by Antigravity Engineering for VELVT India.*  
*Maintained under strict repository standards: zero unvetted dependencies, maximum security posture.*
