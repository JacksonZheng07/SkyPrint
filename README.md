# SkyPrint

**Clean aviation intelligence. Carbon transparency at every altitude.**

SkyPrint is a climate-tech platform that reveals the hidden climate impact of aviation — especially contrails, which account for ~35% of aviation's warming effect but remain invisible to travelers. It's a **behavior-changing platform** that combines scientific modeling, decision intelligence, and a human interface layer to help travelers, airlines, and advocates make cleaner choices.

## Why It Matters

- **Contrails cause ~35%** of aviation's total warming effect — often 2-4x more than CO2 alone
- **Small altitude changes** (1,000-2,000 ft) can avoid most contrail-forming regions with <1% fuel penalty
- **91% of flights** don't use contrail avoidance software — SkyPrint bridges this gap

## Core Systems

### 1. Contrail Engine (Python/PyContrails)
Scientific contrail modeling using the CoCiP (Contrail Cirrus Prediction) model. Predicts contrail formation probability, radiative forcing, and optimal altitudes along flight trajectories using NOAA GFS weather data. Falls back to Schmidt-Appleman Criterion when full CoCiP isn't available.

### 2. Decision Intelligence (Next.js)
Flight comparison and airline scoring that ranks options by total climate impact (CO2 + contrail radiative forcing). Integrates Aviationstack for flight data, OpenSky for real-time trajectories, and Knot API for booking data.

### 3. Human Interface Layer
- **Aero** — Context-aware AI avatar powered by Gemini. Not a chatbot — a proactive system guide that explains contrail science, flight impact, and nudges users toward cleaner choices. With voice via ElevenLabs.
- **Photon** — Lifecycle notification system via spectrum-ts (iMessage). Delivers timed behavioral nudges: booking confirmations, pre-flight contrail forecasts (24h before), and post-flight impact summaries.

### 4. Report Generation (K2 Think V2)
- **Airline scoring** — AI-generated environmental narratives via MBZUAI K2 Think reasoning model
- **Non-profit reports** — Identifies advocacy targets based on contrail mitigation gaps
- **Government reports** — Compliance-ready environmental improvement reports for tax deductions/stipends

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Framer Motion |
| AI | AI SDK v6, Gemini 2.0 Flash (via AI Gateway), K2 Think V2 (MBZUAI), ElevenLabs TTS |
| Backend | Next.js API Routes, Supabase Postgres, Drizzle ORM, Zod v4 |
| Contrail Engine | Python 3.12, FastAPI, PyContrails (CoCiP), NOAA GFS, Open-Meteo |
| Notifications | spectrum-ts (Photon) — iMessage delivery |
| Booking | Knot API — connected travel account data |
| Deploy | Vercel (frontend + API), DigitalOcean (contrail engine container) |

## Architecture

```
User → Flight Search    → Aviationstack API
     → Trajectory       → Great-circle interpolation / OpenSky
     → Weather          → NOAA GFS (Open-Meteo)
     → Contrail Model   → PyContrails CoCiP / SAC fallback
     → Impact Score     → CO2 (40%) + Contrail RF (60%)
     → Aero Explains    → Gemini context-aware streaming + ElevenLabs voice
     → User Selects     → Booking confirmation + impact summary
     → Photon Schedules → flight_booked (now) → pre_flight_24h → post_flight
     → iMessage Delivery → spectrum-ts → user's phone
```

### Cross-System Flow (Demo Script)
1. User compares flights on `/compare`
2. **Aero** automatically explains the contrail impact difference
3. User selects a flight → booking confirmation modal
4. **Photon** schedules lifecycle events (booking → pre-flight → post-flight)
5. User enters phone number → receives iMessage booking confirmation
6. 24h before flight → **pre-flight contrail forecast** via iMessage
7. After landing → **post-flight impact summary** ("You saved 43kg CO2 — that's 2 trees for a year")
8. **Aero** summarizes the entire booking impact

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker (for contrail engine)
- Supabase account
- API keys (see `.env.local.example`)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your API keys in .env.local

# Run database migrations
npx drizzle-kit push

# Start development server
npm run dev
```

### Contrail Engine (Python)

```bash
cd services/contrail_engine
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

Or with Docker:

```bash
docker-compose up contrail-engine
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero with platform overview |
| `/compare` | Flight comparison with booking flow → Photon → Aero |
| `/simulate` | Route simulation — baseline vs contrail-optimized trajectory |
| `/airline/[id]` | Airline environmental scorecard (animated grade, impact visualizer) |
| `/airlines` | Airline rankings leaderboard with podium layout |
| `/mission` | About the mission |
| `/daily` | Daily impact statistics |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/compare-flights` | POST | Full flight comparison pipeline |
| `/api/simulate-route` | POST | Baseline vs optimized trajectory |
| `/api/score-airline` | POST | K2 Think airline scoring |
| `/api/rankings` | GET | All airlines ranked by environmental score |
| `/api/reports` | POST | K2 Think report generation (nonprofit/government) |
| `/api/aero/chat` | POST | Gemini streaming chat (Aero) |
| `/api/aero/voice` | POST | ElevenLabs TTS proxy |
| `/api/photon/trigger` | POST | Trigger lifecycle notification (iMessage via spectrum-ts) |
| `/api/photon/cron` | GET | Cron handler for scheduled events |

## Environment Variables

See `.env.local.example` for all required variables:
- `AVIATIONSTACK_API_KEY` — Flight data
- `GOOGLE_AI_API_KEY` — Gemini for Aero
- `K2_THINK_API_KEY` — K2 Think V2 for reports
- `ELEVENLABS_API_KEY` — Voice synthesis
- `PHOTON_PROJECT_ID` / `PHOTON_PROJECT_SECRET` — spectrum-ts
- `KNOT_CLIENT_ID` / `KNOT_API_SECRET` — Booking data
- `DATABASE_URL` — Supabase Postgres

## License

MIT
