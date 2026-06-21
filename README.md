# Dolese Tech

Marketing site for Dolese Tech, built as a full-stack **Next.js 14 (App Router) + TypeScript** application.

The frontend is the marketing landing page; the backend is a small, production-shaped contact pipeline.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **zod** for request validation
- Plain CSS design system (see `src/app/globals.css`) — warm cream/orange palette
- No database required to run: leads fall back to a local JSONL file

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Backend / contact pipeline

`POST /api/contact` handles the "Get started" form:

1. **Rate limiting** — 5 requests/min per IP (in-memory; swap for Redis in prod).
2. **Validation** — zod schema in `src/lib/validation.ts`, plus a honeypot field.
3. **Persistence** — appended to `data/leads.jsonl` (`src/lib/leads.ts`). Swap this
   module for Prisma/Postgres later without touching the route.
4. **Notification** — emails the lead via Resend if `RESEND_API_KEY` is set
   (`src/lib/email.ts`); otherwise no-ops. Email failure never drops a saved lead.

`GET /api/health` returns service status and whether email is configured.

### Configuration

Everything is optional — the app and form work with zero config. To enable email
notifications and customize storage, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable           | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `RESEND_API_KEY`   | Enable email notifications via Resend.               |
| `CONTACT_FROM`     | Verified sender address.                             |
| `CONTACT_TO`       | Where lead notifications are delivered.              |
| `LEADS_FILE`       | Path for the JSONL lead log (default `data/leads.jsonl`). |
| `ADMIN_PASSWORD`   | Password for the `/admin` lead dashboard. Unset = admin disabled. |
| `LEAD_STATUS_FILE` | Path for lead status/notes store (default `data/lead-status.json`). |

## Admin dashboard

`/admin` is a password-protected lead dashboard (set `ADMIN_PASSWORD`). It offers:

- **KPIs** — total, untriaged, last-7-days, won, and win-rate cards.
- **Analytics** — a 14-day intake trend chart and a status pipeline breakdown.
- **Triage** — per-lead status (`new → contacted → qualified → won/lost`) and
  private notes, persisted via `PATCH /api/admin/leads` to `LEAD_STATUS_FILE`.
- **Filter / sort / search** — status chips, sort order, and free-text search.
- **CSV export** — download the currently filtered leads.

Leads are served by `GET /api/admin/leads` (auth via the `x-admin-password` header).

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the dev server.        |
| `npm run build`     | Production build.            |
| `npm start`         | Run the production build.    |
| `npm run lint`      | ESLint.                      |
| `npm run typecheck` | TypeScript, no emit.         |

## Project structure

```
src/
  app/
    layout.tsx          Root layout + fonts
    page.tsx            Landing page composition
    globals.css         Full design system
    api/
      contact/route.ts  Contact form handler
      health/route.ts   Health check
  components/           UI sections (Nav, Hero, Services, …, ContactForm)
  lib/                  validation · leads · email · rateLimit
```
