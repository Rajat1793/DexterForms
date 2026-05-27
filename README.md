# 🧪 DexterForms

> A production-style, Typeform-inspired form builder SaaS — built with a modern full-stack TypeScript monorepo and a 90s Dexter's Lab cartoon theme.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-purple)](https://trpc.io/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## ✨ Features

- **12 Field Types** — Short text, long text, email, number, date, single/multi select, dropdown, checkbox, rating, phone, URL
- **Dexter's Lab Theme** — Bright 90s cartoon aesthetic throughout the entire UI
- **Drag-and-Drop Builder** — Reorder fields with smooth DnD, live preview panel
- **6 Quick-Start Templates** — Contact Form, Feedback, Job Application, Event Registration, Survey, Bug Report — all pre-populated with relevant fields
- **Public Form Filling** — Shareable `/f/[slug]` links, no login required for respondents
- **Response Management** — Browse, filter, and delete individual responses
- **Analytics Dashboard** — Per-field answer distributions, daily trend chart, completion time
- **CSV Export** — One-click download of all responses
- **Duplicate Forms** — Clone any form instantly
- **JWT Authentication** — Secure stateless auth, 7-day tokens
- **Rate Limiting** — Auth: 10 req/15min, Submissions: 30 req/hr
- **Interactive API Docs** — Scalar UI at `/docs`
- **Email Notifications** — Optional SMTP integration

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 16 (App Router, Tailwind CSS v4) |
| API | tRPC v11 + Express 5 |
| Type Safety | Zod v4 (end-to-end) |
| Database | PostgreSQL 15 + Drizzle ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| UI Components | shadcn/ui + Radix UI |
| Drag & Drop | @dnd-kit/sortable |
| Charts | Recharts |
| API Docs | Scalar (trpc-to-openapi) |

---

## 🚀 Local Development

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

### 1. Clone & Install

```bash
git clone <your-repo-url> dexterforms
cd dexterforms
pnpm install
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Environment Setup

```bash
# .env is auto-loaded by Docker Compose defaults — no changes needed for local dev
# To customise, copy and edit:
cp .env.example .env
```

### 4. Run Migrations & Seed

```bash
pnpm db:migrate    # Apply schema to DB
pnpm db:seed       # Seed demo user + 3 sample forms
```

### 5. Start Dev Server

```bash
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### Demo Login

```
Email:    demo@dexterforms.dev
Password: Demo@123456
```

---

## 📁 Project Structure

```
.
├── apps/
│   ├── api/                  # Express + tRPC API server (port 8000)
│   │   └── src/
│   │       ├── index.ts      # Entry point
│   │       └── server.ts     # Express app setup
│   └── web/                  # Next.js 16 frontend (port 3001)
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── pricing/              # Pricing page
│       │   ├── auth/                 # Login & Register
│       │   ├── dashboard/            # Creator dashboard
│       │   │   └── forms/
│       │   │       ├── [id]/         # Form builder
│       │   │       │   ├── responses/  # Response manager
│       │   │       │   └── analytics/  # Analytics dashboard
│       │   │       └── new/          # Create form wizard (templates)
│       │   └── f/[slug]/             # Public form filling
│       └── providers/
│           ├── auth.tsx              # JWT auth context
│           └── global.tsx            # React Query + tRPC setup
└── packages/
    ├── database/     # Drizzle schema, migrations, seed
    ├── services/     # Business logic (auth, form, response, theme, email)
    ├── trpc/         # tRPC router, context, procedures
    └── logger/       # Shared logging utility
```

---

## 🔧 Environment Variables

### API (`apps/api`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | API server port |
| `NODE_ENV` | `development` | Environment |
| `BASE_URL` | `http://localhost:8000` | Public API base URL |
| `FRONTEND_URL` | `http://localhost:3001` | CORS allowed origin |

### Database (`packages/database`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |

### Auth (`packages/services`)

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | (change in prod!) | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |

### Frontend (`apps/web`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/trpc` | tRPC endpoint for browser |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3001` | App base URL |

### Email (optional)

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (usually 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Sender address |

---

## 📜 Scripts

```bash
pnpm dev           # Start all apps in watch mode
pnpm build         # Build all apps for production
pnpm db:generate   # Generate Drizzle migration files
pnpm db:migrate    # Apply pending migrations
pnpm db:seed       # Seed demo data
pnpm db:studio     # Open Drizzle Studio (DB GUI)
```

---

## 🌐 Free Deployment Guide

This stack can be deployed completely free using:

| Service | What it hosts | Free tier |
|---|---|---|
| **Neon** | PostgreSQL database | 512 MB, no sleep |
| **Render** | Express/tRPC API | 512 MB RAM, sleeps after 15 min |
| **Vercel** | Next.js frontend | Unlimited hobby projects |

---

### Step 1 — Database on Neon (free PostgreSQL)

1. Sign up at **https://neon.tech** (GitHub login works)
2. Create a new project → choose a region close to you
3. Copy the **Connection String** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this as `DATABASE_URL` — you'll need it for both Render and migrations

Run migrations against your Neon DB locally:
```bash
DATABASE_URL="postgresql://..." pnpm db:migrate
DATABASE_URL="postgresql://..." pnpm db:seed
```

---

### Step 2 — API on Render (free Express server)

1. Sign up at **https://render.com** (GitHub login works)
2. Click **New → Web Service** → connect your GitHub repo
3. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter api build`
   - **Start Command**: `node dist/index.js`
   - **Instance Type**: Free
4. Add **Environment Variables**:
   ```
   NODE_ENV=prod
   DATABASE_URL=<your Neon connection string>
   JWT_SECRET=<generate a strong random string>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://<your-vercel-app>.vercel.app
   BASE_URL=https://<your-render-service>.onrender.com
   ```
5. Click **Deploy** — note the public URL (e.g. `https://dexterforms-api.onrender.com`)

> **Note**: Free Render services sleep after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. Upgrade to a paid plan ($7/mo) to keep it always-on.

---

### Step 3 — Frontend on Vercel (free Next.js hosting)

1. Sign up at **https://vercel.com** (GitHub login works)
2. Click **Add New → Project** → import your GitHub repo
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/web`
4. Add **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com/trpc
   NEXT_PUBLIC_APP_URL=https://<your-vercel-app>.vercel.app
   ```
5. Click **Deploy**

---

### Step 4 — Update CORS on Render

Once Vercel gives you your production URL, go back to Render → your API service → Environment and update:
```
FRONTEND_URL=https://<your-actual-vercel-url>.vercel.app
```
Then trigger a redeploy on Render.

---

### Free Tier Limits Summary

| Service | Limit | Notes |
|---|---|---|
| Neon | 512 MB storage, 0.25 vCPU compute hours/month | Enough for thousands of forms |
| Render | 750 hrs/month, 512 MB RAM, sleeps | ~1 instance free 24/7 |
| Vercel | 100 GB bandwidth/month, unlimited deployments | More than enough |

---

### Alternative: Deploy Everything on Railway

Railway gives **$5 free credit/month** and supports monorepos natively.

1. Sign up at **https://railway.app**
2. Create new project → **Deploy from GitHub**
3. Add services: **PostgreSQL** (from Railway's templates) + **two Node services** (api + web)
4. Set env vars per service (same as above)
5. Railway handles the rest automatically

---

## 🗄 Database Schema

```
users            → id, email, fullName, passwordHash, emailVerified
forms            → id, creatorId, title, slug, status, themeId, settings…
form_fields      → id, formId, type, label, options, order, validations…
responses        → id, formId, respondentEmail, completionTime…
response_answers → id, responseId, fieldId, value
```

---

## 🔌 API Reference

Interactive docs available at `/docs` (Scalar UI).

| Method | Procedure | Auth | Description |
|---|---|---|---|
| POST | `auth.register` | No | Create account |
| POST | `auth.login` | No | Login → JWT |
| GET | `auth.me` | Yes | Current user |
| POST | `forms.create` | Yes | Create form |
| GET | `forms.list` | Yes | List my forms |
| POST | `forms.publish` | Yes | Publish form |
| POST | `forms.duplicate` | Yes | Clone form |
| POST | `fields.add` | Yes | Add field to form |
| GET | `public.getFormBySlug` | No | Get public form |
| POST | `public.submitResponse` | No | Submit response |
| GET | `responses.analytics` | Yes | Form analytics |
| GET | `responses.getByForm` | Yes | List responses |

---

## License

MIT


---
