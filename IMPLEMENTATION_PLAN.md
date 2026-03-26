# Interview Coach Web — Implementation Plan

## Guiding Principles

1. **Never modify files outside `interview-coach-web/`.** The coaching_state.md, CLAUDE.md, and references/ are read-only from the build's perspective.
2. **Parser first, UI second.** The parser is the foundation — if it can't reliably read and write the file, nothing else matters.
3. **Round-trip test is the gate.** No UI work begins until `parse → serialize → diff = 0` passes against the real coaching_state.md.
4. **Ship incrementally.** Each phase produces a usable app. Don't wait for all four pages to show something.

---

## Phase 0: Project Setup (Est: 1 session)

### Tasks
- [ ] Initialize Next.js 16.2.1 project in `interview-coach-web/` (`npx create-next-app@16.2.1`)
- [ ] Configure TypeScript, Tailwind CSS v4, ESLint
- [ ] Initialize shadcn/ui (`npx shadcn@latest init`) — configure with our design tokens:
  - Set CSS variables for color palette from DESIGN_BRIEF.md (warm cream bg, blue accent, semantic colors)
  - Configure border-radius tokens (`--radius-sm`, `--radius-md`, `--radius-lg`)
  - Set font references: Poppins (headings) + Lora (body)
- [ ] Install initial shadcn components: `npx shadcn@latest add card badge button table tabs sheet dialog input select textarea separator scroll-area collapsible tooltip chart`
- [ ] Customize shadcn theme to match approved designs:
  - Override default slate/zinc palette with warm neutrals (#faf9f5, #f4f3ee, #e8e6dc)
  - Set primary color to blue accent (#4a8ec2) instead of default
  - Set destructive to danger (#c15f3c), success to green (#788c5d)
- [ ] Install additional dependencies: chokidar, swr
- [ ] Configure `.env.local` with `COACHING_STATE_PATH=../coaching_state.md`
- [ ] Add Google Fonts: Poppins (400, 500, 600) + Lora (400, 500)
- [ ] Create root layout with sidebar navigation shell using shadcn components
- [ ] Create shared components extending shadcn: FitBadge, StatusPill, ScoreIndicator, EmptyState
- [ ] Verify `npm run dev` serves on localhost:3000

### shadcn/ui Setup Notes
- shadcn components are installed into `components/ui/` and become part of our codebase (not an npm dependency)
- Reference: https://ui.shadcn.com/docs/installation/next
- All component styles flow through our CSS custom properties, so changing a design token updates every component
- The `Chart` component wraps Recharts — install it to get consistent chart theming out of the box

### Deliverable
App shell with shadcn/ui components themed to match approved designs, sidebar navigation, and placeholder pages.

### Exit Criteria
- App runs locally with `npm run dev` on Next.js 16.2.1
- shadcn Card, Badge, Button render with correct warm cream palette and blue accent
- Sidebar renders with correct Poppins/Lora typography
- No files created or modified outside `interview-coach-web/`

---

## Phase 1: Parser + Serializer (Est: 2 sessions)

This is the most critical phase. Everything depends on reliable parsing.

### Tasks
- [ ] Define TypeScript interfaces for all coaching_state.md sections (`lib/parser/types.ts`)
- [ ] Build shared utilities: `parseMarkdownTable`, `parseBulletList`, `splitSubsections` (`lib/parser/utils.ts`)
- [ ] Build section parsers (one file per section):
  - [ ] `profile.ts` — bullet list with `- Key: value` format
  - [ ] `resume.ts` — nested bullet lists with numbered sub-items
  - [ ] `storybank.ts` — table + `#### S### — Title` subsections with STAR fields
  - [ ] `scores.ts` — historical summary text + table
  - [ ] `outcomes.ts` — table
  - [ ] `intelligence.ts` — multiple subsections: Question Bank table, Effective/Ineffective Patterns lists, Recruiter Feedback table, Company Patterns (nested by company)
  - [ ] `drills.ts` — bullet list with arrays
  - [ ] `loops.ts` — `### Company Name` subsections with mixed bullet lists
  - [ ] `strategy.ts` — bullet list with arrays
  - [ ] `meta.ts` — table
  - [ ] `sessions.ts` — historical summary text + table
  - [ ] `notes.ts` — `- date: text` list
- [ ] Build main `parse(markdown: string): CoachingState` entry point
- [ ] Build serializers (mirror each parser)
- [ ] Build main `serialize(state: CoachingState): string` entry point
- [ ] Write round-trip test against real `coaching_state.md`
- [ ] Write unit tests for each section parser with edge cases

### Testing Strategy
1. **Round-trip test (gate)**: Read real coaching_state.md → parse → serialize → compare to original. Must be byte-identical (or whitespace-normalized identical).
2. **Section tests**: Parse known markdown snippets → verify typed output.
3. **Edge cases**: Empty sections, TBD values, missing optional fields, multi-line values in bullet lists, pipe characters inside table cells.

### Deliverable
Fully tested parser + serializer that can read and write coaching_state.md without data loss.

### Exit Criteria
- `parse → serialize → diff = 0` passes on the real 391-line coaching_state.md
- All section parsers have unit tests
- TypeScript interfaces cover every field in the file

---

## Phase 2: API Layer + File Watching (Est: 1 session)

### Tasks
- [ ] Create `GET /api/state` — reads file, parses, returns JSON
- [ ] Create `GET /api/state/meta` — returns file mtime without parsing
- [ ] Create `PUT /api/state` — accepts section updates, reads current file, applies update, serializes, writes back with conflict detection
- [ ] Set up Chokidar file watcher in Next.js server startup
- [ ] Create `GET /api/events` SSE endpoint — broadcasts file-changed events
- [ ] Build client hooks:
  - [ ] `useCoachingState()` — SWR hook wrapping GET /api/state
  - [ ] `useFileEvents()` — EventSource subscription, triggers SWR revalidation
  - [ ] `useWriteState()` — mutation hook with lastModified conflict check
- [ ] Build `ConflictBanner` component — shown when external file change detected during edit
- [ ] Build `lib/derived.ts` — computed values (averages, trends, upcoming actions, gaps)

### Deliverable
Working data layer: the app can read state, detect file changes, push updates to browser, and write back safely.

### Exit Criteria
- Browser shows parsed JSON from real coaching_state.md at /api/state
- Editing coaching_state.md externally triggers automatic browser refresh
- Write conflict detection works: external edit → form save → conflict warning shown

---

## Phase 3: Dashboard Page (Est: 1 session)

### Tasks
- [ ] `PipelineSummary` — horizontal row of company cards from active interview loops
  - Uses shadcn `Card` + custom `FitBadge` (STRONG/MODERATE/WEAK text badges)
  - Company name, role, fit badge, next action + date
  - Click → navigates to Pipeline page with that company selected
  - Closed loops dimmed or hidden
- [ ] `UpcomingActions` — sorted list of time-sensitive items from all active loops
  - Uses shadcn `Card` for container
  - Pull from: nextRound dates, assessment deadlines, pending decisions
  - Icon per type (phone, calendar, document, clock)
- [ ] `ScoreSparkline` — mini trend chart using shadcn `Chart` (Recharts wrapper)
  - Y-axis 1-5, no axis labels (compact), shadcn `Tooltip` on hover with date + score
  - Trend annotation: "AVG: X.X / 5.0"
- [ ] `StrategyBar` — three-column bar at page bottom
  - Uses shadcn `Card` for each column, `Badge` for bottleneck tags
  - The Bottleneck (from activeStrategy.primaryBottleneck)
  - Current Approach (from activeStrategy.currentApproach)
  - Drill Stage (from drillProgression.currentStage / 8)

### Deliverable
Functional dashboard showing real data from Marcos's coaching_state.md.

### Exit Criteria
- Dashboard renders Bottomline, Vast, Files.com, OKX loops correctly
- Upcoming actions shows OKX HM call, Files.com assessments due date
- Score sparkline renders 14 data points from Score History
- Coaching strategy shows "Ownership language + Differentiation" bottleneck

---

## Phase 4: Pipeline Page (Est: 2 sessions)

### Tasks
- [ ] `KanbanBoard` — columns: Researched, Applied, Interviewing, Offer, Closed (collapsed via shadcn `Collapsible`)
  - Column headers with shadcn `Badge` count
- [ ] `CompanyCard` — within each column
  - Uses shadcn `Card`, `FitBadge`, `Badge` for round progress
  - Company name, role, text fit badge, next round info, round progress dots
- [ ] `CompanyDetail` — slide-in panel using shadcn `Sheet` (right side)
  - Header: company icon, name, role, location, status/fit badges via shadcn `Badge`
  - `IntelStrategy` section using shadcn `Card` for each block:
    - Concerns Surfaced card (concern + counter-strategy)
    - Company Patterns card (bullet list)
    - Interviewer Intel card (name, title, advocate tag, LinkedIn link)
  - `RoundTimeline` — vertical timeline of rounds with status, date, score, stories used
  - Action buttons via shadcn `Button`: Log Outcome, Update Status
- [ ] `QuickEntryForms` using shadcn `Dialog`:
  - Log Outcome form: shadcn `Select` for round/result, `Textarea` for notes
  - Add Round form: shadcn `Input` for date/format/interviewer/duration
  - Update Status: shadcn `Select` dropdown with all statuses
  - All write back to coaching_state.md via PUT /api/state

### Deliverable
Full pipeline CRM view with all 7 interview loops from Marcos's data, detail panels, and working quick-entry forms.

### Exit Criteria
- Kanban shows: Bottomline/Vast/Files.com/OKX in "Interviewing", Housecall Pro/GGP/Justworks in "Closed"
- Clicking Bottomline shows: all 5 rounds, Gerry as advocate, Monica advancing, AP gap resolved
- Logging a new outcome writes to coaching_state.md and appears immediately
- Closed column is collapsed by default, expandable

---

## Phase 5: Storybank Page (Est: 1 session)

### Tasks
- [ ] `StoryTable` — main table using shadcn `Table` with shadcn `Collapsible` expandable rows
  - Columns: ID, Title, Skill (shadcn `Badge`), Earned Secret, Strength, Last Used, Deployed In
  - shadcn `Tabs` for ALL / DEVELOPED / NEEDS WORK filtering
- [ ] `StoryDetail` — expanded view using shadcn `Card`
  - Two-column STAR layout (Situation/Task left, Action/Result right)
  - Skill tag via `Badge`, Earned Secret status, Last Used, Deploy For guidance
  - Edit Story / Archive actions via shadcn `Button`
- [ ] `StoryFilters` — shadcn `Input` for search + shadcn `Select` for skill/strength filters
- [ ] `GapAnalysis` — right sidebar
  - Primary Skills Covered (from story primarySkill fields)
  - Competency Gaps (competencies from Question Bank not covered by any story)
- [ ] `StoryStats` — right sidebar below gap analysis
  - Total stories, Developed count, Needs Work count, Avg Strength, Used in Last 30d

### Deliverable
Browsable storybank with all 9 stories, expandable STAR details, and gap analysis.

### Exit Criteria
- All 9 stories render with correct data
- S006, S007, S008 show as "Developed" (full STAR); S001-S005, S009 show as "Needs Work"
- Expanding S007 shows full STAR text about Stryke workflow automation
- Gap Analysis shows covered skills and identifies competency gaps

---

## Phase 6: Scores & Progress Page (Est: 1 session)

### Tasks
- [ ] `ExecutiveSummary` — using shadcn `Card` for composite score, growth delta (30d), hire signal
- [ ] `TrendChart` — shadcn `Chart` (Recharts wrapper) multi-line chart
  - One line per dimension (5 lines), toggleable via legend
  - Y-axis 1.0 to 5.0, X-axis dates
  - shadcn `Tooltip` on hover: date, context, all 5 scores
- [ ] `DimensionBreakdown` — five columns showing current average per dimension
- [ ] `SessionHistory` — shadcn `Table` with all Score History entries
  - Columns: Date, Context, Dimensions Avg (DimensionBars component), Self-Delta, Hire Signal (shadcn `Badge`), Action
  - Sortable columns, filter/export icons
- [ ] `CoachingStrategy` — shadcn `Card` sidebar
  - Current Bottleneck via shadcn `Badge` tags, Drill Progression bar (stage X/8), coaching quote
- [ ] `SelfCalibration` — shadcn `Chart` showing self-delta over time (over/under/accurate)

### Deliverable
Full performance analytics page with charts, tables, and coaching strategy.

### Exit Criteria
- Trend chart renders 14 data points showing progression from ~3.0 to ~4.0
- GGP drill progression (2.49 → 3.18 → 4.09) visible as steep upward slope
- Self-Delta column shows over/under/accurate for each session
- Coaching strategy shows "Ownership language + Differentiation"

---

## Phase 7: Polish + Integration Testing (Est: 1 session)

### Tasks
- [ ] Cross-page navigation testing (sidebar links, card clicks → page navigation)
- [ ] Responsive spot-checks (tablet breakpoint at minimum)
- [ ] Empty state testing: what happens with a fresh/empty coaching_state.md?
- [ ] File watching end-to-end: edit coaching_state.md in editor → dashboard auto-updates
- [ ] Write conflict end-to-end: have form open, edit file externally, attempt save → conflict banner
- [ ] Performance: verify parse time < 50ms for 400-line file
- [ ] Accessibility basics: semantic HTML, keyboard navigation, focus states
- [ ] Create README.md with setup and run instructions

### Deliverable
Production-ready MVP with all four pages working against real data.

### Exit Criteria
- All four pages render correctly with real coaching_state.md
- File watching works end-to-end
- Write conflict detection works
- `npm run build` succeeds with no errors
- README allows someone to set up and run the app

---

## Phase 2 (Future): Additional Pages

Not in MVP scope. To be built after Phase 7 is complete and stable.

- **Question Bank page** — searchable table of all interview questions with filters
- **Coaching Notes page** — chronological list with quick-add form
- **Settings page** — profile display, file path config, display preferences
- **Cross-page linking**: Storybank "Find Questions for Gaps" → Question Bank filtered view
- **Kanban drag-and-drop** for pipeline status changes
- **Export**: CSV/PDF export of scores, storybank, outcomes

## Phase 3 (Future): Coaching Engine in Browser

- Embed Claude API-powered chat in the web UI
- Commands (practice, analyze, mock, etc.) available as buttons
- Chat panel alongside data panels
- Full coaching experience without terminal

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Parser can't handle edge cases in coaching_state.md | Medium | High | Build parser against real file from day 1. Round-trip test is the gate. |
| Claude Code writes break parser expectations | Medium | Medium | Validate parser output type-checks. Log parse errors to console. Fail gracefully (show raw markdown for unparseable sections). |
| File watching misses events on macOS | Low | Low | Chokidar + 5-second polling fallback. |
| Write conflict causes data loss | Low | Critical | Never write without checking mtime. Always read-modify-write (never overwrite from memory). |
| coaching_state.md schema evolves | Medium | Medium | Parser logs unrecognized sections as warnings. App still renders known sections. |
| Performance with large file | Low | Low | File is ~400 lines / ~47KB. Parse time will be < 50ms. Not a real concern. |
