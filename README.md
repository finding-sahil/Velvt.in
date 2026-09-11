# VELVT.in — Official Experience Platform

A luxury Gothic Halloween nightlife experience platform built with Next.js 16 (App Router, Turbopack), Tailwind CSS, Prisma ORM, and Supabase PostgreSQL.

## Features

- **Dark Gothic Aesthetic**: Custom typography, glassmorphism, responsive countdown timers, and atmospheric animations.
- **Event Experience Showcase**: Dynamic featured events with ticket tiers, schedules, and venue guides.
- **Visual Archive & Gallery**: High-resolution event photography and media gallery.
- **Volunteer Management**: Volunteer registration with automated ID badge generation, QR code verification, and check-in status.
- **Hardened Admin Control**: Obfuscated management portal (`/velvt-management`), PBKDF2 authenticated sessions, and rate-limited endpoints.
- **Supabase PostgreSQL**: Persistent cloud database with connection pooling and Prisma schema migrations.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/finding-sahil/Velvt.in.git
   cd Velvt.in
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase database credentials
   ```

4. Push database schema and seed:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the site.
