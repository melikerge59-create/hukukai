# CLAUDE.md — HukukAI Codebase Guide

This document provides guidance for AI assistants (Claude and others) working on the HukukAI codebase.

---

## Project Overview

**HukukAI** is an AI-powered Turkish legal consulting platform. Users can ask questions across 9 legal categories and receive answers from an AI assistant powered by OpenAI. The platform includes user authentication, conversation history, file upload, and a subscription-based payment model.

**Live deployment:** Vercel (serverless)
**Primary language:** Turkish (UI and AI system prompts)

---

## Architecture

```
hukukai/
├── index.html              # Complete SPA (single file, ~1279 lines)
├── api/
│   ├── chat.js             # POST /api/chat — AI chat handler
│   ├── payment.js          # POST /api/payment — payment initialization
│   └── payment-callback.js # POST /api/payment-callback — Iyzipay webhook
├── package.json
└── vercel.json             # Vercel deployment & function configuration
```

### Key Characteristics

- **Frontend:** Vanilla HTML/CSS/JS in a single `index.html` file — no build step, no bundler
- **Backend:** Vercel Serverless Functions (Node.js 24.x)
- **Database:** Supabase (PostgreSQL) for auth, storage, and real-time data
- **AI:** OpenAI GPT-4O-Mini with category-specific system prompts
- **Payments:** Iyzipay (Turkish payment gateway, currently in sandbox mode)
- **Auth:** Supabase Auth (email/password + Google OAuth)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Auth | Supabase Auth, Google OAuth |
| Database | Supabase (PostgreSQL) |
| AI Backend | OpenAI GPT-4O-Mini |
| Payments | Iyzipay (iyzico) |
| Hosting | Vercel (Serverless Functions) |
| Runtime | Node.js 24.x |

**npm dependencies:**
- `@supabase/supabase-js` v2.39.0
- `iyzipay` v2.0.48

---

## API Endpoints

### `POST /api/chat`

Handles AI-powered legal question answering.

**Auth:** Bearer token required (Supabase JWT)

**Request body:**
```json
{
  "message": "string (max 1000 chars)",
  "category": "string",
  "conversationId": "string (optional)",
  "fileContent": "string (optional, first 3000 chars used)"
}
```

**Response:**
```json
{
  "reply": "string",
  "conversationId": "string",
  "error": "string (if error)",
  "limitExceeded": "boolean (if daily limit reached)"
}
```

**Logic flow:**
1. Validate Bearer token via Supabase
2. Check daily usage limit based on user's plan (`user_plans` table)
3. Load last 20 messages from conversation history
4. Build prompt with category-specific system prompt + history + user message
5. Call OpenAI GPT-4O-Mini
6. Persist assistant reply to `messages` table
7. Increment `usage_counts` record

### `POST /api/payment`

Initializes Iyzipay checkout for plan upgrades.

**Auth:** None (userId passed in body)

**Request body:**
```json
{
  "plan": "plus | pro | elite",
  "userEmail": "string",
  "userName": "string",
  "userId": "string"
}
```

**Returns:** Iyzipay checkout form HTML and token.

### `POST /api/payment-callback`

Iyzipay webhook after payment completion.

- Verifies payment status
- Updates `user_plans` table
- Records to `payment_history` table
- Redirects browser to frontend with status query param

---

## Database Schema (Supabase)

All auth is handled via Supabase Auth (built-in). Additional tables:

### `user_plans`
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK to auth.users |
| plan_type | text | free, plus, pro, elite |
| daily_limit | integer | Questions per day |
| is_active | boolean | |

### `conversations`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| category | text | Legal category slug |
| title | text | Auto-generated |
| created_at | timestamp | |

### `messages`
| Column | Type | Notes |
|--------|------|-------|
| conversation_id | uuid | FK to conversations |
| role | text | user or ai |
| content | text | Message body |
| created_at | timestamp | |

### `usage_counts`
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK to auth.users |
| created_at | timestamp | One row per question asked |

### `payment_history`
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | |
| plan_type | text | |
| amount | numeric | |
| currency | text | TRY |
| status | text | |
| iyzipay_token | text | |
| conversation_id | uuid | |

---

## Subscription Plans

| Plan | Daily Limit | Price |
|------|------------|-------|
| Free | Limited (low) | 0 TRY |
| Plus | Medium | Paid |
| Pro | High | Paid |
| Elite | Unlimited | Paid |

---

## Legal Categories

The platform supports 9 Turkish legal domains, each with a dedicated system prompt in `api/chat.js`:

| Slug | Domain |
|------|--------|
| `is` | İş Hukuku (Labor Law) |
| `kira` | Kira Hukuku (Tenant Law) |
| `tuketici` | Tüketici Hukuku (Consumer Law) |
| `aile` | Aile Hukuku (Family Law) |
| `trafik` | Trafik Hukuku (Traffic Law) |
| `ceza` | Ceza Hukuku (Criminal Law) |
| `icra` | İcra Hukuku (Enforcement Law) |
| `miras` | Miras Hukuku (Inheritance Law) |
| `vergi` | Vergi Hukuku (Tax Law) |

---

## Frontend Structure (index.html)

The entire SPA lives in `index.html`. Key sections:

- **Pages (toggled via JS):**
  - `#landingPage` — Homepage with hero, categories, pricing
  - `#chatPage` — AI chat interface with conversation sidebar

- **Modals:**
  - Auth modal (login/register forms)
  - Limit exceeded modal (with upgrade prompt)

- **Navigation:** Includes logo, user menu, login/register buttons

All page routing is done by toggling element visibility — no URL-based routing.

---

## Environment Variables

These must be set in the Vercel project settings (never commit to code):

| Variable | Used In | Purpose |
|----------|---------|---------|
| `SUPABASE_URL` | All API files | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | All API files | Admin service role key |
| `OPENAI_API_KEY` | `api/chat.js` | OpenAI API access |
| `IYZICO_API_KEY` | `api/payment.js`, `api/payment-callback.js` | Iyzipay API key |
| `IYZICO_SECRET_KEY` | `api/payment.js`, `api/payment-callback.js` | Iyzipay secret |

**Note:** The Supabase public URL and anon key are hardcoded in `index.html`. This is acceptable — they are public-facing keys with row-level security protecting the data.

---

## Development Workflow

### No build step
This project has no bundler or transpiler. To test changes:

1. Edit `index.html` or any `api/*.js` file directly
2. Deploy to Vercel or use `vercel dev` for local testing

### Local Development
```bash
# Install dependencies
npm install

# Run Vercel dev server (requires Vercel CLI and env vars set)
vercel dev
```

Vercel dev will serve `index.html` as the static root and mount the `api/` directory as serverless functions.

### Deployment
Push to the `master` branch — Vercel auto-deploys from git.

```bash
git add .
git commit -m "description of change"
git push origin master
```

---

## Code Conventions

### API Files (`api/*.js`)
- Each file exports a single default handler: `export default async function handler(req, res)`
- CORS headers set at the top of each handler (allow all origins)
- Always return JSON with consistent shape: `{ error: "message" }` on failure
- Use `SUPABASE_SERVICE_KEY` (not the public anon key) for server-side Supabase operations
- Authentication: extract and verify Bearer token using `supabase.auth.getUser(token)`

### Frontend (`index.html`)
- Supabase client initialized once at the top of the `<script>` section
- Page navigation by toggling CSS `display` on page divs
- User state stored in a global `currentUser` variable
- All API calls use `fetch()` with `Authorization: Bearer ${session.access_token}`
- Error handling: show user-friendly Turkish messages in UI modals

### AI Prompts
- All system prompts are in Turkish
- Prompts instruct the AI to act as a Turkish legal consultant
- Category-specific prompts enforce domain boundaries (e.g., labor law assistant won't answer tax questions)
- Message history limited to last 20 messages to stay within token limits
- File content truncated to 3000 characters if provided

---

## Known Limitations & Technical Debt

1. **Payment sandbox:** Iyzipay URL is controlled by `IYZICO_BASE_URL` env var (defaults to sandbox). Set `IYZICO_BASE_URL=https://api.iyzipay.com` in Vercel for production.
2. **Tests:** Basic unit tests exist in `api/tests/` covering input validation logic. Integration tests against live services are not yet implemented.
3. **Rate limiting:** IP-level rate limiting is not yet implemented. Per-user daily quota is enforced via `usage_counts` table.
4. **Single-file frontend:** As the app grows, consider splitting `index.html` into components or using a lightweight framework.

---

## Security Notes

- **Never** commit API keys, Supabase service keys, or Iyzipay secrets. Use `.env.example` as a reference.
- Supabase Row Level Security (RLS) should be enabled on all tables — verify in Supabase dashboard.
- The service role key (`SUPABASE_SERVICE_KEY`) bypasses RLS — only use it server-side in `api/` functions.
- `api/payment` now requires a valid Bearer token; `userId` is derived from the JWT, never from the request body.
- OpenAI messages include user-supplied content — the category system prompts provide guardrails.
- `api/chat.js` validates category slugs against an allowlist and rejects unknown values.
- File content is limited to 50,000 characters server-side; must be a string.

---

## Git Branch Structure

- `master` — Production branch (Vercel auto-deploys from here)
- `claude/*` — AI assistant working branches (used for PR-based changes)

## CI/CD

GitHub Actions runs on every push to `master` and `claude/**` branches:
- Installs dependencies (`npm ci`)
- Runs unit tests (`npm test`)

Workflow file: `.github/workflows/ci.yml`

---

## Quick Reference

| Task | How |
|------|-----|
| Add a new legal category | Add slug to `validCategories` in `api/chat.js`, add system prompt to `SYSTEM_PROMPTS`, update frontend JS |
| Change daily limits | Update `user_plans` table in Supabase and pricing UI in `index.html` |
| Update AI behavior | Edit system prompts in `api/chat.js` |
| Add a new page | Add a `div` with a unique ID in `index.html`, toggle visibility via JS |
| Change payment plans | Update `PLAN_PRICES` in `api/payment.js`, `PLAN_LIMITS`/`PLAN_AMOUNTS` in `api/payment-callback.js`, and `index.html` pricing section |
| Switch to production payments | Set `IYZICO_BASE_URL=https://api.iyzipay.com` in Vercel env vars |
| Debug a serverless function | Use Vercel dashboard → Functions → Logs |
| Run tests locally | `npm test` |
