# Interview Coach Web — Technical Architecture

## Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 16.2.1 (App Router) | Latest stable release with security patches. Marcos has Next.js experience (BodyPulse). App Router gives us server components for file I/O + client components for interactivity. |
| UI Components | shadcn/ui | Pre-built, accessible, composable components (Card, Table, Badge, Button, Dialog, Tabs, Sheet, etc.) that we own and customize. Not a dependency — components are copied into the project and styled via our design tokens. Docs: https://ui.shadcn.com/docs |
| Styling | Tailwind CSS v4 + CSS custom properties | shadcn/ui requires Tailwind. Design tokens from DESIGN_BRIEF.md map to CSS variables which shadcn components consume. |
| Charts | Recharts | React-native charting, lightweight, good for line/bar/scatter plots we need. shadcn/ui has a Chart component wrapper around Recharts. |
| File watching | Chokidar | Cross-platform, handles debouncing and rapid writes from Claude Code mid-session saves. |
| Real-time updates | Server-Sent Events (SSE) | Simpler than WebSocket for one-way server→client push. File change → SSE → browser re-renders. |
| State management | React context + SWR | SWR for data fetching/caching with revalidation on SSE events. No Redux needed at this scale. |
| Testing | Vitest + React Testing Library | Fast, good TypeScript support, essential for parser round-trip tests. |

### shadcn/ui Component Mapping

These shadcn components map directly to our UI needs. Install only what we use.

| shadcn Component | Used For |
|-----------------|----------|
| `Card` | Pipeline company cards, dashboard summary cards, strategy panels |
| `Table` | Score History, Question Bank, Storybank table, Outcome Log |
| `Badge` | Status pills (Interviewing, Advanced, Rejected), fit badges (STRONG, MODERATE) |
| `Button` | All actions (Log Outcome, Add Note, Update Status, Edit Story) |
| `Dialog` | Quick-entry forms (Log Outcome, Add Round) |
| `Sheet` | Pipeline company detail slide-in panel |
| `Tabs` | Storybank (All / Developed / Needs Work) |
| `Collapsible` | Storybank expandable story details, Pipeline closed column |
| `Tooltip` | Chart hover tooltips, truncated text reveals |
| `Input` / `Textarea` | Form fields in quick-entry forms |
| `Select` | Status dropdowns, filter dropdowns |
| `Separator` | Section dividers |
| `ScrollArea` | Pipeline detail panel, long story lists |
| `Chart` | Score trend chart, sparkline (wraps Recharts) |

Components are installed via `npx shadcn@latest add <component>` and live in `components/ui/`. We customize their styles through our CSS custom properties — the warm cream palette, blue accent, Poppins/Lora typography — so they match the approved designs rather than shadcn defaults.

## Project Structure

```
interview-coach-web/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with sidebar nav
│   ├── page.tsx                  # Dashboard (home)
│   ├── pipeline/
│   │   └── page.tsx              # Pipeline kanban
│   ├── storybank/
│   │   └── page.tsx              # Storybank browser
│   ├── scores/
│   │   └── page.tsx              # Scores & Progress
│   ├── questions/                # Phase 2
│   │   └── page.tsx
│   ├── notes/                    # Phase 2
│   │   └── page.tsx
│   ├── settings/                 # Phase 2
│   │   └── page.tsx
│   └── api/
│       ├── state/
│       │   └── route.ts          # GET: parsed state, PUT: write back
│       ├── events/
│       │   └── route.ts          # SSE endpoint for file change events
│       └── health/
│           └── route.ts          # Health check
│
├── lib/
│   ├── parser/
│   │   ├── index.ts              # Main parse() entry point
│   │   ├── types.ts              # TypeScript interfaces for all sections
│   │   ├── sections/
│   │   │   ├── profile.ts        # Parse ## Profile
│   │   │   ├── resume.ts         # Parse ## Resume Analysis
│   │   │   ├── storybank.ts      # Parse ## Storybank + ### Story Details
│   │   │   ├── scores.ts         # Parse ## Score History
│   │   │   ├── outcomes.ts       # Parse ## Outcome Log
│   │   │   ├── intelligence.ts   # Parse ## Interview Intelligence (all subsections)
│   │   │   ├── drills.ts         # Parse ## Drill Progression
│   │   │   ├── loops.ts          # Parse ## Interview Loops (all companies)
│   │   │   ├── strategy.ts       # Parse ## Active Coaching Strategy
│   │   │   ├── meta.ts           # Parse ## Meta-Check Log
│   │   │   ├── sessions.ts       # Parse ## Session Log
│   │   │   └── notes.ts          # Parse ## Coaching Notes
│   │   └── utils.ts              # Shared: table parser, bullet parser, section splitter
│   │
│   ├── serializer/
│   │   ├── index.ts              # Main serialize() entry point
│   │   ├── sections/             # Mirror of parser/sections — one per section
│   │   │   └── [same files]
│   │   └── utils.ts              # Shared: table formatter, markdown escaping
│   │
│   ├── watcher.ts                # Chokidar file watcher setup
│   ├── config.ts                 # File path resolution, env config
│   └── derived.ts                # Computed values: avg scores, upcoming actions, gaps
│
├── components/
│   ├── ui/                        # shadcn/ui components (installed via CLI, customized)
│   │   ├── badge.tsx              # shadcn Badge — styled with our semantic colors
│   │   ├── button.tsx             # shadcn Button — primary (blue accent), secondary, ghost
│   │   ├── card.tsx               # shadcn Card — warm surface + border tokens
│   │   ├── chart.tsx              # shadcn Chart — Recharts wrapper
│   │   ├── collapsible.tsx        # shadcn Collapsible — story expand, closed pipeline column
│   │   ├── dialog.tsx             # shadcn Dialog — quick-entry forms
│   │   ├── input.tsx              # shadcn Input — form fields
│   │   ├── scroll-area.tsx        # shadcn ScrollArea — detail panels
│   │   ├── select.tsx             # shadcn Select — status/filter dropdowns
│   │   ├── separator.tsx          # shadcn Separator — section dividers
│   │   ├── sheet.tsx              # shadcn Sheet — pipeline detail slide-in panel
│   │   ├── table.tsx              # shadcn Table — scores, questions, storybank
│   │   ├── tabs.tsx               # shadcn Tabs — storybank All/Developed/Needs Work
│   │   ├── textarea.tsx           # shadcn Textarea — notes, outcome forms
│   │   └── tooltip.tsx            # shadcn Tooltip — chart hovers, truncated text
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── PageContainer.tsx
│   │
│   ├── dashboard/
│   │   ├── PipelineSummary.tsx    # Horizontal company cards (uses Card)
│   │   ├── UpcomingActions.tsx    # Time-sorted action list (uses Card)
│   │   ├── ScoreSparkline.tsx     # Mini trend chart (uses Chart)
│   │   └── StrategyBar.tsx        # Bottleneck + approach + drill stage (uses Card)
│   │
│   ├── pipeline/
│   │   ├── KanbanBoard.tsx        # Column layout
│   │   ├── CompanyCard.tsx        # Card in kanban column (uses Card, Badge)
│   │   ├── CompanyDetail.tsx      # Slide-in panel (uses Sheet)
│   │   ├── IntelStrategy.tsx      # Concerns + patterns + interviewer intel (uses Card)
│   │   ├── RoundTimeline.tsx      # Round history with stories used
│   │   └── QuickEntryForms.tsx    # Log outcome, add round (uses Dialog, Input, Select)
│   │
│   ├── storybank/
│   │   ├── StoryTable.tsx         # Main table (uses Table, Collapsible)
│   │   ├── StoryDetail.tsx        # Expanded STAR view (uses Card)
│   │   ├── GapAnalysis.tsx        # Skills covered + competency gaps (uses Card, Badge)
│   │   ├── StoryStats.tsx         # Summary stats panel (uses Card)
│   │   └── StoryFilters.tsx       # Search + filters (uses Input, Select, Tabs)
│   │
│   ├── scores/
│   │   ├── ExecutiveSummary.tsx    # Composite score + growth (uses Card)
│   │   ├── TrendChart.tsx         # Multi-dimension line chart (uses Chart)
│   │   ├── DimensionBreakdown.tsx # Five dimension averages
│   │   ├── SessionHistory.tsx     # Table with Self-Delta (uses Table, Badge)
│   │   ├── CoachingStrategy.tsx   # Bottleneck + drill progression (uses Card, Badge)
│   │   └── SelfCalibration.tsx    # Over/under/accurate visualization (uses Chart)
│   │
│   └── shared/
│       ├── FitBadge.tsx           # STRONG/MODERATE/WEAK text badges (extends shadcn Badge)
│       ├── StatusPill.tsx         # Interviewing, Advanced, Rejected (extends shadcn Badge)
│       ├── ScoreIndicator.tsx     # Numeric score with color coding
│       ├── LinkedInLink.tsx       # External link with icon
│       ├── EmptyState.tsx         # "No data yet" with Claude Code hint
│       ├── ConflictBanner.tsx     # "File changed externally" warning
│       └── DimensionBars.tsx      # Mini 5-bar visualization for table rows
│
├── hooks/
│   ├── useCoachingState.ts        # SWR hook for parsed state
│   ├── useFileEvents.ts           # SSE subscription hook
│   └── useWriteState.ts           # Mutation hook with conflict detection
│
├── styles/
│   ├── globals.css                # CSS custom properties (design tokens)
│   └── tailwind.config.ts         # Tailwind config extending tokens
│
├── __tests__/
│   ├── parser/
│   │   ├── roundtrip.test.ts      # CRITICAL: parse → serialize → diff = 0
│   │   ├── profile.test.ts
│   │   ├── storybank.test.ts
│   │   ├── scores.test.ts
│   │   ├── loops.test.ts
│   │   └── intelligence.test.ts
│   └── derived.test.ts            # Computed values
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .env.local.example             # COACHING_STATE_PATH=../coaching_state.md
└── README.md                      # Setup + run instructions
```

---

## Parser Architecture

### Design: Custom section-based parser (Option A from discussion)

The parser splits `coaching_state.md` by `## ` headers, then dispatches each section to a specialized sub-parser. Each sub-parser knows the exact schema for its section.

### Type Definitions (lib/parser/types.ts)

```typescript
// Top-level parsed state
interface CoachingState {
  lastUpdated: string;
  profile: Profile;
  resumeAnalysis: ResumeAnalysis;
  storybank: StorybankEntry[];
  storyDetails: Record<string, StoryDetail>;
  scoreHistory: {
    historicalSummary: string | null;
    recentScores: ScoreEntry[];
  };
  outcomeLog: OutcomeEntry[];
  interviewIntelligence: InterviewIntelligence;
  drillProgression: DrillProgression;
  interviewLoops: Record<string, InterviewLoop>;
  activeStrategy: CoachingStrategy;
  metaCheckLog: MetaCheckEntry[];
  sessionLog: {
    historicalSummary: string | null;
    recentSessions: SessionEntry[];
  };
  coachingNotes: CoachingNote[];
}

interface Profile {
  targetRoles: string;
  seniorityBand: string;
  track: string;
  feedbackDirectness: number;
  interviewTimeline: string;
  timeAwareMode: string;
  interviewHistory: string;
  biggestConcern: string;
  knownFormats: string;
}

interface StorybankEntry {
  id: string;           // S001, S002, etc.
  title: string;
  primarySkill: string;
  earnedSecret: string;
  strength: string;     // "TBD" or numeric
  lastUsed: string;
}

interface StoryDetail {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  earnedSecret: string;
  deployFor: string;
  versionHistory: string;
}

interface ScoreEntry {
  date: string;
  type: string;         // practice, interview, mock
  context: string;
  substance: number;
  structure: number;
  relevance: number;
  credibility: number;
  differentiation: number;
  hireSignal: string;
  selfDelta: string;    // over, under, accurate, + detail
}

interface InterviewLoop {
  companyName: string;
  status: string;
  roundsCompleted: string;
  roundFormats: RoundFormat[];
  storiesUsed: string;
  concernsSurfaced: string;
  interviewerIntel: string;
  preparedQuestions: string;
  nextRound: string;
  fitAssessment: string;
  keySignals: string;
  dateResearched: string;
  // Optional fields that may exist
  roleScope?: string;
}

// ... additional interfaces for all other sections
```

### Parsing Strategy

```
Input: raw markdown string
  │
  ├─ 1. Extract "Last updated:" line → lastUpdated
  │
  ├─ 2. Split on /^## /m → section map { "Profile": "...", "Storybank": "...", ... }
  │
  ├─ 3. For each section, call specialized parser:
  │     ├─ "Profile" → parseProfile(text) → Profile
  │     ├─ "Storybank" → parseStorybank(text) → StorybankEntry[] + StoryDetail[]
  │     ├─ "Score History" → parseScoreHistory(text) → { historicalSummary, recentScores }
  │     ├─ "Interview Loops (active)" → parseInterviewLoops(text) → Record<string, InterviewLoop>
  │     └─ etc.
  │
  └─ 4. Return typed CoachingState object
```

### Shared Utilities

- **`parseMarkdownTable(text)`**: Parses markdown pipe-tables into arrays of objects. Handles alignment rows, empty cells, multi-word cells.
- **`parseBulletList(text)`**: Parses `- key: value` lines into key-value pairs. Handles multi-line values and nested bullets.
- **`splitSubsections(text, level)`**: Splits on `### ` or `#### ` headers within a section.

### Serializer (Mirror of Parser)

Each section has a serializer that takes a typed object and produces the exact markdown format:

```
CoachingState object
  │
  ├─ serializeProfile(profile) → markdown string
  ├─ serializeStorybank(entries, details) → markdown string
  ├─ serializeScoreHistory(history) → markdown string
  └─ etc.
  │
  └─ Join all sections with headers → full markdown string
```

### Round-Trip Test (Critical)

The most important test in the project:

```typescript
test('parse → serialize → diff = 0', () => {
  const original = fs.readFileSync('coaching_state.md', 'utf-8');
  const parsed = parse(original);
  const serialized = serialize(parsed);
  expect(serialized).toBe(original);
});
```

If this test passes, we guarantee that the web app can read and write without corrupting the file.

---

## File Watching Architecture

### Watcher Setup (lib/watcher.ts)

```
chokidar.watch(COACHING_STATE_PATH, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {        // Wait for Claude Code to finish writing
    stabilityThreshold: 500, // 500ms of no changes = write complete
    pollInterval: 100
  }
})
.on('change', () => {
  // Broadcast via SSE to all connected clients
  broadcastEvent({ type: 'file-changed', timestamp: Date.now() });
})
```

### SSE Endpoint (app/api/events/route.ts)

```
GET /api/events → Server-Sent Events stream

Events:
  - { type: "file-changed", timestamp: number }
  - { type: "heartbeat" } (every 30s to keep connection alive)
```

### Client Hook (hooks/useFileEvents.ts)

```
1. Connect to /api/events via EventSource
2. On "file-changed" event → trigger SWR revalidation
3. On disconnect → auto-reconnect with backoff
4. Fallback: poll file mtime every 5 seconds if SSE fails
```

### Write Conflict Detection

```
1. Client reads state → stores lastModified timestamp
2. Before writing:
   a. GET /api/state/meta → current file mtime
   b. If mtime > lastModified → show ConflictBanner
   c. If mtime == lastModified → proceed with write
3. After writing → update lastModified
```

---

## API Routes

### GET /api/state
Returns the parsed coaching state as JSON.

Response: `{ data: CoachingState, lastModified: number }`

### PUT /api/state
Accepts partial updates to specific sections. Reads the current file, applies the update to the relevant section, serializes back to markdown, writes to disk.

Request body:
```json
{
  "section": "interviewLoops",
  "companyName": "Bottomline Technologies",
  "update": { "status": "Offer" },
  "expectedLastModified": 1711382400000
}
```

Response: `{ success: true, lastModified: number }` or `{ error: "conflict", currentLastModified: number }`

### GET /api/state/meta
Returns file metadata without parsing.

Response: `{ lastModified: number, sizeBytes: number }`

---

## Derived Computations (lib/derived.ts)

These are computed from the parsed state, not stored in the file:

| Computation | Source | Used By |
|-------------|--------|---------|
| Average score (per session) | Mean of 5 dimension scores per ScoreEntry | Dashboard sparkline, Scores page |
| Score trend direction | Linear regression over last 5 sessions | Dashboard, Scores page |
| Growth delta | Current avg - avg from 30 days ago | Scores executive summary |
| Upcoming actions | Next round dates from all active loops, sorted | Dashboard |
| Story development status | Check if STAR fields + earned secret != TBD | Storybank filters, Story Stats |
| Competency coverage | Match story primary skills vs. question bank competencies | Gap Analysis |
| Self-calibration trend | Aggregate self-delta values over time | Scores page |
| Pipeline status counts | Count loops by status | Pipeline column headers |
| Composite hire signal | Mode of recent hire signals | Scores executive summary |

---

## Configuration

### Environment Variables (.env.local)

```bash
# Path to coaching_state.md (relative to project root or absolute)
COACHING_STATE_PATH=../coaching_state.md

# Server port (default 3000)
PORT=3000
```

### File Path Resolution

The app resolves `COACHING_STATE_PATH` relative to the project root. Default assumes the web app lives at `interview-coach-web/` alongside `coaching_state.md` in the parent directory.

```
interview-coach-skill-main/
├── coaching_state.md          ← SOURCE OF TRUTH (never modified by build tools)
├── CLAUDE.md
├── references/
└── interview-coach-web/       ← WEB APP (all new code here)
    ├── .env.local             ← COACHING_STATE_PATH=../coaching_state.md
    └── ...
```

---

## Security Notes (Local-First)

- No authentication (runs on localhost only)
- No external API calls
- No telemetry or analytics
- No cloud storage or sync
- File access limited to the single coaching_state.md path
- No secrets in the codebase
