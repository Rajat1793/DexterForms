# 🍵 ChaiForms

> A production-style, Typeform-inspired form builder SaaS built with the modern full-stack TypeScript monorepo.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-purple)](https://trpc.io/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team/)

---

## ✨ Features

- **12+ Field Types** — Short text, long text, email, number, date, single/multi select, dropdown, checkbox, rating, phone, URL
- **13 Built-in Themes** — Minimal, Dark, Matrix, Sakura, Cyberpunk, Ocean, Nebula, Retro, Dracula, Naruto, Midnight, Startup, Dexter's Lab
- **Public Form Filling** — No login required for respondents
- **Real-time Form Builder** — Drag-and-drop field reordering, live preview, theme switcher
- **Response Analytics** — Per-field distributions, daily trends chart, answer rates
- **CSV Export** — Download all responses as a CSV file
- **Duplicate Forms** — Clone any form with one click
- **JWT Authentication** — Secure, stateless auth with 7-day tokens
- **API Documentation** — Interactive Scalar docs at `/docs`
- **Rate Limiting** — Auth endpoints: 10 req/15min, submissions: 30 req/hr
- **Email Notifications** — Optional SMTP for response notifications

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 16 (App Router) |
| API | tRPC v11 + Express 5 |
| Type Safety | Zod v4 (end-to-end) |
| Database | PostgreSQL 15 + Drizzle ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Drag & Drop | @dnd-kit/sortable |
| Charts | Recharts |
| API Docs | Scalar (trpc-to-openapi) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

### 1. Clone & Install

```bash
git clone <repo-url> chaiforms
cd chaiforms
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Defaults work out of the box with Docker Compose
```

### 3. Start Database

```bash
docker-compose up -d
```

### 4. Run Migrations & Seed

```bash
pnpm db:generate   # Generate migration files
pnpm db:migrate    # Apply migrations to DB
pnpm db:seed       # Seed demo data + demo user
```

### 5. Start Dev Server

```bash
pnpm dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🎭 Demo Credentials

```
Email:    demo@chaiforms.dev
Password: Demo@123456
```

### Demo Forms (public, no login required)

| Form | URL | Theme |
|---|---|---|
| Stranger Things Fan Survey | http://localhost:3000/f/stranger-things-fan-survey | Retro |
| Anime Character Alignment Quiz | http://localhost:3000/f/anime-character-survey | Sakura |
| Startup Pitch Validator | http://localhost:3000/f/startup-pitch-validator | Cyberpunk |

---

## 📁 Project Structure

```
.
├── apps/
│   ├── api/          # Express + tRPC API server (port 8000)
│   └── web/          # Next.js 16 frontend (port 3000)
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── pricing/              # Pricing page
│       │   ├── auth/                 # Login & Register
│       │   ├── dashboard/            # Creator dashboard
│       │   │   └── forms/
│       │   │       ├── [id]/         # Form builder
│       │   │       │   ├── responses/  # Response manager
│       │   │       │   └── analytics/  # Analytics dashboard
│       │   │       └── new/          # Create form wizard
│       │   └── f/[slug]/             # Public form filling
│       └── providers/
│           └── auth.tsx              # JWT auth context
└── packages/
    ├── database/     # Drizzle schema + migrations + seed
    ├── services/     # Business logic (auth, form, response, theme, email)
    ├── trpc/         # tRPC router + context + procedures
    └── logger/       # Shared logging utility
```

---

## 🔌 API Reference

Interactive API docs available at **http://localhost:8000/docs** (Scalar UI).

### Key Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/trpc/auth.register` | No | Create account |
| POST | `/trpc/auth.login` | No | Login -> JWT |
| GET | `/trpc/auth.me` | Yes | Current user |
| POST | `/trpc/forms.create` | Yes | Create form |
| GET | `/trpc/forms.list` | Yes | List my forms |
| POST | `/trpc/forms.publish` | Yes | Publish form |
| GET | `/trpc/public.getFormBySlug` | No | Get public form |
| POST | `/trpc/public.submitResponse` | No | Submit response |
| GET | `/trpc/responses.analytics` | Yes | Form analytics |
| GET | `/trpc/themes.list` | No | Available themes |

---

## 🎨 Themes

| Theme | Description |
|---|---|
| minimal | Clean white with violet accents |
| dark | Dark slate with violet |
| matrix | Green on black terminal |
| sakura | Pink anime-inspired |
| cyberpunk | Neon purple and yellow |
| ocean | Sky blue and calm |
| nebula | Deep purple cosmos |
| retro | Amber monospace |
| dracula | Classic developer dark |
| naruto | Orange ninja energy |
| midnight | Deep night with amber |
| startup | Emerald growth vibes |
| dexter | 90s cartoon genius scientist |

---

## 🗄 Database Schema

```
users            -> id, email, fullName, passwordHash, emailVerified
forms            -> id, creatorId, title, slug, status, themeId, settings...
form_fields      -> id, formId, type, label, options, order, validations...
responses        -> id, formId, respondentEmail, completionTime...
response_answers -> id, responseId, fieldId, value
```

---

## 🔧 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/dev` | PostgreSQL connection |
| `JWT_SECRET` | `chaiforms-super-secret-...` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/trpc` | API URL for browser |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin |
| `SMTP_HOST` | (optional) | Email server |
| `SMTP_PORT` | (optional) | Email port |
| `SMTP_USER` | (optional) | Email username |
| `SMTP_PASS` | (optional) | Email password |
| `SMTP_FROM` | (optional) | Sender address |

---

## 📜 Available Scripts

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps
pnpm db:generate  # Generate Drizzle migration files
pnpm db:migrate   # Run pending migrations
pnpm db:seed      # Seed demo data
pnpm db:studio    # Open Drizzle Studio (DB GUI)
```

---

## License

MIT
