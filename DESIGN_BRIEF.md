# Interview Coach Web — Design Brief

## Overview

Build a local-first web dashboard for an interview coaching system. The app reads and writes to a single `coaching_state.md` file that serves as the source of truth for a candidate's entire job search — interview pipelines, practice scores, story bank, company intelligence, and coaching strategy.

The user is an active job seeker managing multiple simultaneous interview loops. They need to glance at their pipeline status, review score trends, look up which stories they've used where, and do quick data entry (log outcomes, update round dates, add interviewer intel) — all without opening a terminal.

**This is a dashboard and quick-entry tool, not a coaching engine.** The AI-powered coaching conversations (practice drills, transcript analysis, mock interviews) happen separately in Claude Code. This app is the visual layer on top of the same data.

---

## Design System

### Philosophy

Inspired by Anthropic/Claude's design language: warm minimalism, intentional spacing, human-centered aesthetics. The system avoids cold/clinical AI aesthetics in favor of approachability and calm focus. A job seeker using this tool is likely stressed — the interface should feel like a well-organized workspace, not a enterprise SaaS dashboard.

### Color Palette

Anthropic uses a warm terracotta/orange accent (`#d97757`). This app shifts to a **subtle blue** while preserving the same warm neutral foundation.

#### Core Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#faf9f5` | Page background — warm off-white |
| `--color-surface` | `#ffffff` | Cards, panels, elevated surfaces |
| `--color-surface-alt` | `#f4f3ee` | Alternate surface — table rows, input backgrounds |
| `--color-border` | `#e8e6dc` | Borders, dividers |
| `--color-border-subtle` | `#f0efe8` | Very light separators |
| `--color-text-primary` | `#141413` | Primary text |
| `--color-text-secondary` | `#5a5850` | Secondary/supporting text |
| `--color-text-muted` | `#b0aea5` | Disabled, placeholder, tertiary text |

#### Accent Colors (Blue replaces Orange)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent` | `#4a8ec2` | Primary interactive — buttons, links, active states |
| `--color-accent-hover` | `#3a7bab` | Hover state for primary actions |
| `--color-accent-subtle` | `#e8f0f8` | Light accent backgrounds — selected states, badges |
| `--color-accent-muted` | `#6a9bcc` | Secondary accent — chart lines, icons |

#### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#788c5d` | Advanced, offer, positive outcomes |
| `--color-success-subtle` | `#eef2e8` | Success backgrounds |
| `--color-warning` | `#c9a227` | Pending, needs attention |
| `--color-warning-subtle` | `#faf5e4` | Warning backgrounds |
| `--color-danger` | `#c15f3c` | Rejected, closed, errors |
| `--color-danger-subtle` | `#faeee8` | Danger backgrounds |
| `--color-neutral` | `#b0aea5` | Inactive, archived |

### Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| Display / Page Title | Poppins | 600 (SemiBold) | 24px | 1.2 |
| Section Heading (H2) | Poppins | 600 | 20px | 1.25 |
| Subsection Heading (H3) | Poppins | 500 (Medium) | 16px | 1.3 |
| Body | Lora | 400 (Regular) | 15px | 1.6 |
| Body Small / Captions | Lora | 400 | 13px | 1.5 |
| Table Data | Lora | 400 | 14px | 1.4 |
| Labels / Badges | Poppins | 500 | 12px | 1 |
| Monospace (scores, IDs) | JetBrains Mono or system mono | 400 | 13px | 1.4 |

**Font loading:** Poppins (400, 500, 600) and Lora (400, 500) from Google Fonts. Monospace uses system stack with JetBrains Mono as preferred.

### Spacing Scale

Base unit: `4px`. All spacing uses multiples of this base.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline gaps |
| `--space-2` | 8px | Icon-to-label, badge padding |
| `--space-3` | 12px | Compact card padding, tight groups |
| `--space-4` | 16px | Standard element spacing |
| `--space-5` | 20px | Comfortable card padding |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large section gaps |
| `--space-10` | 40px | Page-level vertical rhythm |
| `--space-12` | 48px | Major section separation |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Badges, small elements |
| `--radius-md` | 12px | Buttons, inputs, small cards |
| `--radius-lg` | 16px | Cards, panels, modals |
| `--radius-full` | 9999px | Pills, circular avatars |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.03)` | Subtle lift for cards |
| `--shadow-md` | `0 4px 20px rgba(0,0,0,0.035)` | Standard card elevation |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.06)` | Modals, dropdowns, popovers |

### Component Patterns

#### Cards
- Background: `--color-surface`
- Border: 1px solid `--color-border`
- Border radius: `--radius-lg` (16px)
- Padding: `--space-5` (20px) to `--space-6` (24px)
- Shadow: `--shadow-sm` at rest, `--shadow-md` on hover (if interactive)
- No shadow stacking — one level of elevation only

#### Buttons
- **Primary:** `--color-accent` background, white text, `--radius-md`
- **Secondary:** `--color-surface` background, `--color-text-primary` text, 1px `--color-border` border
- **Ghost:** Transparent background, `--color-accent` text, no border
- Padding: `10px 20px`
- Font: Poppins Medium 14px
- Min touch target: 44px height

#### Inputs & Forms
- Background: `--color-surface-alt`
- Border: 1px solid `--color-border`
- Border radius: `--radius-md` (12px)
- Padding: `12px 16px`
- Focus: `--color-accent` border, `--color-accent-subtle` shadow ring
- Label: Poppins Medium 13px, `--color-text-secondary`, above input

#### Tables
- Header: `--color-surface-alt` background, Poppins Medium 13px, uppercase letter-spacing 0.5px
- Rows: alternating `--color-surface` and `--color-surface-alt`
- Cell padding: `12px 16px`
- Borders: horizontal only, 1px `--color-border-subtle`
- Sortable columns: accent-colored sort icon on active column

#### Badges / Status Pills
- Border radius: `--radius-full`
- Padding: `4px 12px`
- Font: Poppins Medium 12px
- Status colors:
  - Interviewing: `--color-accent` text on `--color-accent-subtle` bg
  - Advanced: `--color-success` text on `--color-success-subtle` bg
  - Pending: `--color-warning` text on `--color-warning-subtle` bg
  - Rejected/Closed: `--color-danger` text on `--color-danger-subtle` bg
  - Researched: `--color-neutral` text on `--color-surface-alt` bg

#### Navigation / Sidebar
- Width: 240px collapsed to icon-only at 64px on mobile
- Background: `--color-surface`
- Active item: `--color-accent-subtle` background, `--color-accent` text
- Inactive item: `--color-text-secondary`, no background
- Hover: `--color-surface-alt` background
- Section dividers: 1px `--color-border-subtle` with `--space-4` margin

#### Charts
- Primary line/bar: `--color-accent` (`#4a8ec2`)
- Dimension colors (for the 5 scoring dimensions):
  - Substance: `#4a8ec2` (accent blue)
  - Structure: `#6a9bcc` (muted blue)
  - Relevance: `#788c5d` (green)
  - Credibility: `#c9a227` (amber)
  - Differentiation: `#9b6b9e` (muted purple)
- Grid lines: `--color-border-subtle`
- Labels: Lora 12px `--color-text-muted`
- Tooltip: `--color-surface`, `--shadow-lg`, `--radius-md`

---

## Information Architecture

### Navigation Structure

```
Sidebar:
  Dashboard (home)
  Pipeline
  Storybank
  Scores & Progress
  Question Bank
  Coaching Notes
  Settings
```

### Page Specifications

---

### 1. Dashboard (Home)

**Purpose:** At-a-glance overview of the candidate's entire job search. This is the page that answers "where do things stand right now?"

**Layout:** Single column, stacked sections.

**Sections:**

#### Active Pipeline Summary
- Horizontal row of compact company cards (max 5-6 visible, scroll if more)
- Each card shows: Company name, role title, status badge, next action + date
- Cards are clickable → navigates to that company's detail in Pipeline view
- Closed/archived loops are dimmed or hidden (toggle to show)

#### Upcoming Actions
- Simple list of time-sensitive items sorted by date:
  - "OKX — HM call with Adam Bai" → Thursday Mar 26
  - "Files.com — CCAT + Vervoe assessments due" → Apr 2
  - "Bottomline — Awaiting offer decision from Alexis/Monica"
- Each item links to the relevant company detail

#### Recent Scores Sparkline
- Small inline chart showing last 10 practice/interview scores (average of 5 dimensions)
- Shows trend direction (improving / plateau / declining)
- Click → navigates to full Scores & Progress page

#### Coaching Strategy Summary
- Current bottleneck (e.g., "Ownership language + Differentiation")
- Current approach (one line)
- Drill progression stage indicator (Stage 1 of 8)

---

### 2. Pipeline

**Purpose:** Kanban-style view of all interview loops by status. The primary "CRM" view.

**Layout:** Horizontal columns representing statuses.

**Columns (left to right):**
1. Researched
2. Applied
3. Interviewing
4. Offer
5. Closed (collapsed by default, expandable)

**Company Card (in each column):**
- Company name (bold)
- Role title
- Next round: date + format (e.g., "R2 Cultural Assessment — async, awaiting link")
- Round progress indicator: dots or small step bar showing completed vs. total rounds
- Fit assessment badge: Strong / Moderate / Weak
- Key signal (one line, e.g., "CTO liked resume unprompted")
- Concerns count (e.g., "1 concern" in warning color if unresolved)

**Click → Company Detail Panel (slide-in from right or full page):**
- All data from the Interview Loops section of coaching_state.md:
  - Status + round history (timeline format)
  - Round formats table (round number, format, duration, interviewer, date, result)
  - Interviewer intel (name, role, LinkedIn link, key insights)
  - Stories used per round (linked to Storybank entries)
  - Concerns surfaced (ranked, with counter-strategies)
  - Prepared questions
  - Fit assessment + key signals
  - Company patterns (from Interview Intelligence)
  - Outcome log entries for this company

**Quick actions on company detail:**
- "Log Outcome" → form: round, result (advanced/rejected/pending/offer), notes
- "Add Round" → form: date, format, interviewer name, duration
- "Update Status" → dropdown
- "Add Note" → freetext, saves to Coaching Notes with date + company tag

---

### 3. Storybank

**Purpose:** Browse, search, and manage interview stories.

**Layout:** Table view with expandable rows, plus filter bar.

**Filter Bar:**
- Search by title or keyword
- Filter by: Primary Skill, Domain (Technical/Product/Business/People), Strength (1-5), Developed (yes/no)
- Sort by: Last Used, Strength, ID

**Table Columns:**
- ID (monospace, e.g., S001)
- Title
- Primary Skill
- Earned Secret (truncated to ~60 chars, or "TBD" badge in warning color)
- Strength (numeric with color indicator: 1-2 danger, 3 warning, 4-5 success)
- Last Used (date or "Never" in muted text)
- Deployed In (company names as small badges)

**Expanded Row / Detail View (click to expand):**
- Full STAR text (Situation, Task, Action, Result) — each as a labeled paragraph
- Earned Secret (full text)
- "Deploy for" guidance
- Version history
- Usage history: which companies/rounds this story was used in, with scores from those sessions

**Quick actions:**
- "Edit Story" → inline or modal form for STAR fields, earned secret, deploy-for
- "Retire Story" → marks as retired with reason

**Gap Analysis Panel (sidebar or bottom section):**
- Matrix showing competencies covered vs. gaps
- Highlights: "No story covers [competency]" in warning color
- Undeveloped stories (Earned Secret = TBD) shown as opportunities

---

### 4. Scores & Progress

**Purpose:** Visualize performance trends, self-calibration accuracy, and coaching trajectory.

**Layout:** Charts on top, data table below.

**Score Trend Chart (primary):**
- Line chart, X-axis = date, Y-axis = score (1-5)
- One line per dimension (Substance, Structure, Relevance, Credibility, Differentiation)
- Toggle lines on/off by clicking legend
- Hover shows: date, context, exact scores
- Filter by: company, practice type, date range

**Average Score Over Time:**
- Single line showing the mean of all 5 dimensions per session
- Useful for seeing overall trajectory vs. dimension-specific view

**Self-Calibration Chart:**
- Scatter or bar chart showing Self-Δ over time
- Y-axis: actual delta (positive = over-rated, negative = under-rated, zero = accurate)
- Color: over = warning, under = accent, accurate = success
- Trend line showing whether self-assessment is improving

**Hire Signal Distribution (if enough data):**
- Donut or bar chart: Strong Hire / Hire / Mixed / No Hire
- Only from `analyze` and `mock` sessions (not practice)

**Score History Table (below charts):**
- Full table from coaching_state.md with all columns
- Sortable by any column
- Rows colored by hire signal
- Click a row → shows the context/notes for that session

**Coaching Strategy Panel:**
- Current bottleneck, approach, rationale, pivot conditions
- Root causes detected (as a tag list)
- Previous approaches (with brief reason for abandoning)
- Drill progression: visual stage indicator (1-8) with gate status

---

### 5. Question Bank

**Purpose:** Searchable repository of all interview questions encountered.

**Layout:** Filterable table with detail expansion.

**Filter Bar:**
- Search by question text or competency
- Filter by: Company, Round Type (behavioral/technical/data-analytics/culture-fit/case-study), Competency, Outcome, Score range

**Table Columns:**
- Date
- Company (with color-coded badge)
- Role
- Round Type (badge)
- Question (primary text — may be long, truncate with expand)
- Competency
- Score (numeric or "recall-only" badge)
- Outcome (badge: advanced/rejected/pending/unknown)

**Supplementary Panels:**

#### Effective Patterns
- List of patterns that work, with dates and evidence
- Green left-border accent

#### Ineffective Patterns
- List of patterns that don't work, with dates and evidence
- Red/danger left-border accent

#### Recruiter/Interviewer Feedback
- Table: Date, Company, Source (badge: recruiter/interviewer/HM), Feedback, Linked Dimension

---

### 6. Coaching Notes

**Purpose:** Freeform observations and context that the coaching system has captured.

**Layout:** Chronological list with search and company filter.

**Entry Format:**
- Date (left column or top)
- Text (body)
- Auto-tagged with mentioned company names (as badges)
- Category inference: personal context, performance pattern, effective strategy, logistics

**Quick Add:**
- Floating "Add Note" button
- Form: date (defaults to today), text, optional company tag
- Writes to Coaching Notes section of coaching_state.md

---

### 7. Settings

**Purpose:** Configuration for profile and display preferences.

**Sections:**
- **Profile:** Read-only display of candidate profile (name, target roles, seniority, track, feedback directness, timeline). Editable via form.
- **Resume Analysis:** Read-only display of positioning strengths, interviewer concerns, career narrative gaps, story seeds.
- **File Path:** Shows path to `coaching_state.md` being read. Option to point to a different file.
- **Display:** Theme toggle (light only for MVP), density preference (comfortable / compact).

---

## Data Flow

```
coaching_state.md (source of truth)
        │
        ├── Parser reads → Structured data objects
        │                       │
        │                       ├── Dashboard renders
        │                       ├── Pipeline renders
        │                       ├── Storybank renders
        │                       ├── Scores renders
        │                       ├── Question Bank renders
        │                       └── Coaching Notes renders
        │
        ├── File watcher detects changes → Re-parse → Re-render
        │
        └── Web app forms → Serializer writes back → coaching_state.md
                                                          │
                                                          └── Claude Code reads on next session
```

**Write conflict protection:** Before any write, compare file's last-modified timestamp against the last read. If changed externally (by Claude Code), show a warning banner: "This file was updated externally. Reload before making changes." Do not silently overwrite.

---

## Responsive Behavior

- **Desktop (1200px+):** Full sidebar + content area. Tables show all columns. Charts at full width.
- **Tablet (768-1199px):** Sidebar collapses to icons. Pipeline switches from kanban to list view. Tables hide less-critical columns.
- **Mobile (< 768px):** Bottom navigation bar replaces sidebar. Pipeline is a stacked card list. Tables become card-based layouts. Charts stack vertically.

The primary use case is desktop (candidate sitting at their computer during job search). Mobile is nice-to-have but not a design priority for MVP.

---

## MVP Scope

Build these views first:

1. **Dashboard** — Pipeline summary + upcoming actions + score sparkline
2. **Pipeline** — Kanban board + company detail panel with quick-entry forms
3. **Storybank** — Table with expanded detail view
4. **Scores & Progress** — Trend charts + score history table

These four cover ~80% of the "I need to see my data" use case. Question Bank, Coaching Notes, and Settings come in Phase 2.

---

## Anti-Patterns to Avoid

- **No gradients, no glassmorphism, no dramatic shadows.** This is a tool for focused work, not a landing page.
- **No purple.** It reads as generic AI aesthetic.
- **No Inter or Roboto.** The Poppins + Lora pairing is distinctive and warm.
- **No dense enterprise dashboard energy.** Generous spacing. Let the data breathe. A stressed job seeker shouldn't feel more stressed looking at their dashboard.
- **No skeleton screens everywhere.** The data is local — it loads instantly. Don't add fake loading states.
- **No onboarding modals or tooltips.** The user built this data themselves. They know what it means.
- **No dark mode in MVP.** Get the light theme perfect first.

---

## Interaction Notes

- **Kanban drag-and-drop:** Not required for MVP. Status changes happen via dropdown on the detail panel. Drag-and-drop is Phase 2.
- **Inline editing:** Prefer slide-in panels or modals for editing. Inline editing in tables is fragile and hard to get right.
- **Chart tooltips:** On hover, not click. Show exact values + context.
- **Transitions:** Subtle, fast (150-200ms). Ease-out for entrances, ease-in for exits. No bounces or springs.
- **Empty states:** When a section has no data, show a calm message + suggestion: "No stories developed yet. Use the `stories` command in Claude Code to build your storybank."

---

## Design Review Log — Final Approved State (2026-03-25)

Three rounds of design review were conducted. Below is the final approved state for each screen.

### Dashboard (Approved)
- **Pipeline cards** use text-based fit badges: STRONG (green), IDEAL (blue), MODERATE (amber). No numeric fit scores, no round-stage labels on the badges.
- **Recent Scores** section uses 1-5 scale: "AVG: 4.2 / 5.0", "Confidence: 4.6 / 5.0", "Growth: +0.7". No percentages.
- **Coaching Strategy bar** at bottom: The Bottleneck + Current Approach + Drill Stage (01/08). Unchanged from initial design.
- **Microphone/voice button**: Removed. Not in MVP scope.

### Pipeline (Approved)
- **Kanban cards** show text-based fit badges (STRONG / MODERATE) — not numeric "Fit: 4.5/5" scores. Matches the text values stored in coaching_state.md fit assessments.
- **Detail panel header** uses text badge "STRONG" instead of numeric fit score.
- **Detail panel body** renamed from "Coach's Perspective" to "Intel & Strategy". Contains three data cards pulled from coaching_state.md:
  - **Concerns Surfaced**: concern text + counter-strategy (from Interview Loops → Concerns surfaced)
  - **Company Patterns**: bullet list (from Interview Intelligence → Company Patterns)
  - **Interviewer Intel**: name, title, "Internal Advocate" tag if applicable, LinkedIn link icon (from Interview Loops → Interviewer intel)
- **Round History** timeline shows: round name, date, completion status, score badge (X.X/5), and "Stories Used" with story IDs (e.g., "S006: The Pivoted Launch") linking to Storybank entries.
- **No AI-generated coaching text or confidence scores.** Everything displayed is stored data, not generated content.

### Scores & Progress (Approved)
- **All scores on 1-5 scale**: Composite Score 4.2/5.0, Growth +0.6, dimension averages in 3.9-4.4 range.
- **Chart Y-axis**: labeled 1.0 to 5.0 with subtitle "Multi-dimensional growth over time (1-5 scale)".
- **Session History table** includes **Self-Delta column** showing numeric delta (e.g., +0.1, +0.7, 0.0) between self-assessment and coach scores. This was missing from initial designs and is a key coaching signal.
- **Coaching Strategy sidebar**: Current Bottleneck tags + Drill Progression bar (Stage 5/8) + coaching quote. Unchanged.

### Storybank (Approved)
- **Tab navigation**: ALL / DEVELOPED / NEEDS WORK — replacing Library/Drafts/Archive. Maps to actual story state: "Developed" = STAR fields + Earned Secret populated; "Needs Work" = any field still TBD.
- **Gap Analysis panel** (right sidebar):
  - **Primary Skills Covered**: bullet list of skills from existing stories (e.g., Conflict Resolution, Technical Execution, Strategic Alignment)
  - **Competency Gaps**: warning-colored list of competencies from Question Bank that have no matching story (e.g., Managing Ambiguity, Product Sense (Mobile))
  - No percentage-based coverage bars. No "FIND QUESTIONS FOR GAPS" link (deferred to Phase 2 when Question Bank page exists).
- **Story Stats panel** (right sidebar, below Gap Analysis):
  - Total Stories, Developed (green), Needs Work (amber), Avg Strength (X.X/5), Used in Last 30d
  - Replaces the removed "Coach's Advice" card and "Ready to Pitch / Readiness Score" widget.
- **No "Coach is listening" image or voice UI elements.**
- **No "Load More Stories" button.** All stories render in a single scrollable list (9 stories currently; pagination unnecessary under ~25).
- Expanded story detail: full STAR layout (Situation/Task left column, Action/Result right column), Skill tag + Earned Secret status + Last Used date at bottom.
