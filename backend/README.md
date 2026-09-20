# VELVT Dedicated Edge Backend (Cloudflare Worker)

High-performance, low-latency API backend for **VELVT.in** running directly on Cloudflare Workers' edge network and querying Supabase PostgreSQL.

---

## ⚡ Architecture

- **Frontend & Static Site**: Hosted on **Vercel** (`velvt.in` / `*.vercel.app`)
- **Dedicated Backend**: Hosted on **Cloudflare Workers** (`velvt-backend/`, sub-15ms worldwide latency)
- **Database & Storage**: Hosted on **Supabase**

---

## 🚀 Deployment Instructions for Cloudflare Dashboard

### 1. In Cloudflare Dashboard:
1. Navigate to **Workers & Pages** → Click **Create Application**.
2. Switch to the **Workers** tab and choose **Connect to Git** (or **Deploy a Worker**).
3. Select your repository: `finding-sahil/Velvt.in`.
4. **IMPORTANT: Build Settings**:
   - **Worker Name**: `velvt-backend`
   - **Root Directory**: `backend` ⚠️ *(Crucial: set this so Cloudflare only builds this Worker and never touches Next.js!)*
   - **Build Command**: Leave default or `npx wrangler deploy`
   - **Deploy Command**: `npx wrangler deploy`
5. **Environment Variables & Secrets**:
   Under **Settings** → **Variables and Secrets**, add the following:
   - `SUPABASE_URL`: `https://YOUR_PROJECT_ID.supabase.co`
   - `SUPABASE_ANON_KEY`: `your_supabase_anon_key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_key`
6. Click **Deploy**.

---

## 🌐 Custom Domain Setup (Optional)
In Cloudflare Workers → `velvt-backend` → **Settings** → **Domains & Routes**:
- Add Custom Domain: `api.velvt.in`
- Cloudflare will automatically route `https://api.velvt.in` to this high-speed Worker with free SSL.

---

## 🔌 Available Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Edge ping and status report |
| `GET` | `/api/events` | Edge-cached public events list |
| `GET` | `/api/events/:slug` | Event details by slug |
| `POST` | `/api/tickets/verify` | High-speed QR gate admittance scanner |
| `POST` | `/api/inquiries` | Public contact inquiry submission |
| `POST` | `/api/volunteers` | Volunteer application registration |
| `GET` | `/api/gallery` | Edge-cached gallery items |
| `GET` | `/api/team` | Core team members |
