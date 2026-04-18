# SkyPrint

**Clean aviation intelligence. Carbon transparency at every altitude.**

SkyPrint is a climate-tech platform that reveals the hidden climate impact of aviation — especially contrails, which account for ~35% of aviation's warming effect but remain invisible to travelers.

## Core Systems

### 1. Contrail Engine (Python/PyContrails)
Scientific contrail modeling using the CoCiP (Contrail Cirrus Prediction) model. Predicts contrail formation probability, radiative forcing, and optimal altitudes along flight trajectories using NOAA GFS weather data.

### 2. Decision Intelligence (Next.js)
Flight comparison and airline scoring that ranks options by total climate impact (CO2 + contrail radiative forcing). Integrates Aviationstack for flight data and OpenSky for real-time trajectories.

### 3. Human Interface Layer
- **Aero** — Context-aware AI avatar powered by Gemini. Explains contrail science, flight impact, and nudges users toward cleaner choices. Not a chatbot — a proactive system guide with voice (ElevenLabs).
- **Photon** — Lifecycle notification system via spectrum-ts. Delivers timed behavioral nudges: post-flight impact summaries, pre-flight contrail warnings, long-term stats.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, shadcn/ui, Framer Motion |
| AI | AI SDK v6, Gemini (via AI Gateway), K2 Think, ElevenLabs |
| Backend | Next.js API Routes, Supabase Postgres, Drizzle ORM |
| Contrail Engine | Python, FastAPI, PyContrails (CoCiP), NOAA GFS |
| Notifications | spectrum-ts (Photon) |
| Deploy | Vercel (frontend), DigitalOcean (contrail engine) |

## Architecture

```
User → Flight Search → Aviationstack API
     → Trajectory    → OpenSky Network
     → Weather       → NOAA GFS (open-meteo.com)
     → Contrails     → PyContrails CoCiP Engine
     → Impact Score  → CO2 + Radiative Forcing
     → Aero          → Gemini explanation + ElevenLabs voice
     → Photon        → Post-flight notification via spectrum-ts
```

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
| `/` | Landing page |
| `/compare` | Flight comparison (main feature) |
| `/simulate` | Route simulation — baseline vs optimized |
| `/airline/[id]` | Airline environmental scorecard |
| `/mission` | About the mission |
| `/daily` | Daily impact statistics |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/compare-flights` | POST | Full flight comparison pipeline |
| `/api/simulate-route` | POST | Baseline vs optimized trajectory |
| `/api/score-airline` | POST | K2 Think airline scoring |
| `/api/aero/chat` | POST | Gemini streaming chat (Aero) |
| `/api/aero/voice` | POST | ElevenLabs TTS proxy |
| `/api/photon/trigger` | POST | Trigger lifecycle notification |
| `/api/photon/cron` | GET | Cron handler for scheduled events |

## Environment Variables

See `.env.local.example` for all required variables.

## License

MIT
