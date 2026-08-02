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

## AI Exams Composer

`/exams` generates NECTA-standard papers for the Tanzanian secondary syllabus.

**Authentic structure.** `src/lib/examBlueprints.ts` encodes the real paper shape
per subject *family* (mathematics · sciences · languages · humanities · business)
and per level, because a maths paper is examined nothing like a language paper.
Confirmed structures include Basic Mathematics (Section A 10×6, Section B 4×10,
**no multiple-choice**), and the CSEE 16/54/30 template used by Biology, English
and Geography. A-Level (ACSEE) papers drop multiple-choice for a compulsory
Section A plus an optional Section B with candidate choice.

**Marks always add up.** `normalizeExam` reconciles section and paper totals
before delivery and is *choice-aware*: a section marked "answer any two of four"
is worth what a candidate can earn, not the sum of every printed question.
`validateExam` flags unusable content (multiple-choice items without 4–5 options,
missing marking schemes). If a paper misses the requested total or has content
faults, the route runs one corrective regeneration and keeps the better result.

**Editing without losing work.**

- `POST /api/exams/question` regenerates **one** question in place. The
  replacement's number and marks are pinned to the original, so a swap can never
  break the paper's totals — every other question survives.
- Papers are saved to a browser-local library (`src/lib/examLibrary.ts`), and the
  paper on screen is continuously kept as a draft so a refresh never loses work.
  Storage is browser-local by design: `/exams` is public and has no accounts, so a
  server-side store would let anyone enumerate every teacher's unreleased papers.
  Cross-device sync would require real user accounts.

**Export.** `POST /api/exams/download` produces a .docx with the marking scheme.
Bar charts, number lines and coordinate graphs are drawn as real embedded images
(`src/lib/figureImage.ts` — a dependency-free PNG encoder), and LaTeX is
converted to readable text without dropping unknown macros.

## Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start the dev server.          |
| `npm run build`     | Production build.              |
| `npm start`         | Run the production build.      |
| `npm run lint`      | ESLint.                        |
| `npm run typecheck` | TypeScript, no emit.           |
| `npm test`          | Unit tests (Node test runner). |

## Project structure

```
src/
  app/
    layout.tsx          Root layout + fonts
    page.tsx            Landing page composition
    globals.css         Full design system
    exams/page.tsx      Exams Composer UI
    api/
      contact/route.ts  Contact form handler
      health/route.ts   Health check
      exams/
        generate/       Full-paper generation (+ corrective pass)
        question/       Single-question regeneration
        download/       .docx export
  components/           UI sections (Nav, Hero, Services, …, ContactForm)
  lib/                  validation · leads · email · rateLimit
                        exams · examBlueprints · examAnalytics
                        examLibrary · figureImage · aiComplete · aiErrors
tests/                  Unit tests for the exam pipeline
```
