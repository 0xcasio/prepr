# Prepr — Interview Coach Dashboard

A real-time web dashboard for the Interview Coach CLI skill. Reads and writes `coaching_state.md` — the persistent coaching file — and renders live views of your pipeline, storybank, scores, and coaching strategy.

## Prerequisites

- **Node.js** 18+ (tested on 22.x)
- **npm** 9+
- A `coaching_state.md` file in the parent directory (`../coaching_state.md` relative to this project)

## Setup

```bash
# From the interview-coach-web/ directory
npm install
```

No `.env` file is needed. The app reads `coaching_state.md` from `../coaching_state.md` by default.

## Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). The dev server watches for file changes and hot-reloads.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run debug-parse` | Debug parser output |

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Pipeline summary, upcoming actions, score sparkline, coaching strategy |
| `/pipeline` | Pipeline | Kanban board with interview loops, detail panel, quick-entry forms |
| `/storybank` | Storybank | Story table with STAR details, gap analysis, story stats |
| `/scores` | Scores & Progress | Trend chart, session history, dimension breakdown, coaching sidebar |

## Architecture

```
src/
  app/                    # Next.js App Router pages
    api/                  # REST endpoints (GET/PUT /api/state, SSE /api/events)
    pipeline/             # Pipeline page
    scores/               # Scores & Progress page
    storybank/            # Storybank page
  components/
    dashboard/            # Dashboard-specific components
    pipeline/             # Kanban, company cards, detail panel, forms
    scores/               # Executive summary, trend chart, session history, coaching sidebar
    shared/               # Reusable: EmptyState, FitBadge, StatusPill, ScoreIndicator
    storybank/            # Story table, story sidebar
    ui/                   # shadcn/ui primitives (Badge, Button, Dialog, Sheet, etc.)
  lib/
    derived.ts            # Computed values (averages, gaps, calibration)
    hooks/                # useCoachingState, useWriteState, useFileEvents
    parser/               # Markdown parser + serializer + TypeScript types
    pipeline-helpers.ts   # Pipeline field access + status normalization
    utils.ts              # cn() utility
```

### Data flow

1. `coaching_state.md` is parsed by `src/lib/parser/parser.ts` into typed `CoachingState`
2. `GET /api/state` serves parsed state to the browser via SWR
3. `PUT /api/state` writes changes back (with conflict detection via ETag)
4. `GET /api/events` provides SSE — when the file changes on disk, all connected clients auto-refresh
5. Derived computations (`src/lib/derived.ts`) run client-side from the parsed state

### Key design decisions

- **Read-only for most views** — the CLI skill is the primary editor. The web app writes only through pipeline quick-entry forms.
- **No database** — `coaching_state.md` is the single source of truth.
- **SSE for live updates** — when the CLI writes to `coaching_state.md`, the dashboard auto-refreshes.
- **Conflict detection** — if the file changes between read and write, the app shows a conflict banner.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** with custom design tokens
- **shadcn/ui** components (Radix primitives)
- **Recharts** for score visualizations
- **SWR** for data fetching
- **Vitest** for testing
- **chokidar** for file watching (server-side)

## Testing

```bash
npm run test
```

62 tests across 10 test files covering the parser, serializer, derived computations, API routes, and pipeline helpers.
