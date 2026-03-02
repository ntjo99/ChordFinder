# Project: Fretboard Filter (working title)

## 0) Additions / Clarifications
- MVP must be easy to run locally on Windows for fast iteration.
- Implementation should be modular with small files and strict separation of concerns to keep Codex context small.
- UI should be modern and sleek with subtle shine (glass/blur, soft gradients, gentle shadows) and consistent spacing/typography.
- Baseline OS target is Windows 11.
- Tooling/package manager for this repo is `pnpm`.
- Workspace orchestration decision for MVP: use `pnpm` workspaces only (no `turbo` in Milestone 0).
- Use latest stable versions for dependencies/tooling at setup time, then lock via `pnpm-lock.yaml`.
- Canonical local run command can be `pnpm dev`.

## 0.1) Milestone Execution Protocol
- Work milestones strictly in order (0 -> 5).
- For each milestone:
  - implement only scoped features for that milestone,
  - write/update unit tests,
  - execute tests locally,
  - report test results to the user.
- Pause after completing each milestone and wait for user prompt before starting the next milestone.

## 1) Goal
Build a guitar theory app with a visual fretboard that highlights eligible notes based on filters (key/scale/chord/interval include-exclude rules). Users can also omit tones (for example, G major without the 3rd).

## 2) Product Principles
- Single deterministic Selection State => derived highlights.
- Theory engine is UI-agnostic and portable.
- Fast feedback loop on Windows during development.
- Two highlight layers: Allowed vs (optional later) User-selected.

## 3) Target Platforms (UPDATED)
### Platform Targets
- Dev target (Phase 1): Windows desktop (fast local iteration).
- Future targets (Phase 2+):
  - macOS desktop
  - Linux desktop
  - iOS
  - Android

### Portability Strategy (Separation by Layer)
The project is split into layers that map cleanly to platform concerns:

- Core (portable): theory + fretboard mapping + filter engine (no UI, no OS APIs).
- UI (platform-specific): rendering, interactions, layout, look/feel.
- Assets (portable): icons, fonts, color tokens, optional textures.

Goal: maximize reuse of core logic and assets, accept that UI code is likely to be rewritten when moving away from web-tech (for example, to SwiftUI/Jetpack Compose).

## 4) Tech Stack (UPDATED: PINNED FOR PHASE 1)
### Phase 1 Stack (Windows-first, rapid dev, strong graphics)
- Desktop shell: Tauri
- UI framework: React + TypeScript
- Build tooling: Vite (HMR for fast iteration)
- Rendering: Canvas 2D for MVP
  - Upgrade path: PixiJS (WebGL) for advanced effects (glow/shine/zoom/pan) without changing core logic
- Core engine: TypeScript library module in `/core`
- Testing: Vitest for `/core` unit tests
- Package/workspace management: `pnpm` + `pnpm` workspaces

### Why this choice
- Fast iteration (Vite HMR) + excellent 2D rendering options (Canvas/WebGL).
- Small desktop footprint vs Electron.
- Clean separation between portable core and UI.

## 5) Milestones
### Milestone 0 - Repo + Dev Loop (Windows)
Goal: running app shell with hot reload (or fast rebuild) on Windows 11.

Deliverables:
- Monorepo layout with `/core` and `/app`.
- One command to run the app locally (`pnpm dev`).
- Local test command for `/core` with Vitest.

Acceptance:
- `core` unit tests run locally.
- App launches and shows placeholder screen.

### Milestone 1 - Core Theory Engine (No UI)
Goal: implement pitch classes, scales, chord formulas, include/exclude logic with tests.

Deliverables:
- `PitchClass` mapping + note naming policy (`sharps` or `flats`; default `sharps`).
- Note naming preference is user-configurable in app state (no `auto` mode in MVP).
- Scale generator (Major, Natural Minor).
- Chord generator (qualities + extensions + alterations).
- Interval include/exclude logic.
- `computeAllowedPitchClasses(appState)`.

Acceptance:
- Unit tests cover scale/chord generation and omit-tone behavior (for example, G major omit 3 => {G,D}).
- Deterministic outputs for fixed inputs.
- Default output uses sharp spelling unless user chooses flats.

### Milestone 2 - Fretboard Model + Rendering (Basic)
Goal: visual fretboard renders and highlights from `allowedPitchClasses` show correctly.

Deliverables:
- Standard tuning only for MVP: EADGBE.
- Fretboard cell generation (string, fret, pitchClass) for frets 0 through 17.
- Open strings included.
- Initial view shows full range (0-17) and all strings enabled.
- Render grid with string lines + fret markers.
- Highlight logic wired to core output.
- When chord is selected, non-chord tones are visibly de-emphasized (greyed) and chord/allowed tones are highlighted.

Acceptance:
- Changing a hardcoded state updates highlight display correctly.
- Fretboard starts with all frets 0-17 visible and open strings present.

### Milestone 3 - Filter Panel (MVP Controls)
Goal: interactive filters update highlights live.

Deliverables:
- Key root selector.
- Scale selector.
- Chord root + quality selector.
- Extensions multi-select (common extensions up to 13).
- Include intervals chips.
- Exclude intervals chips.
- Fret range + string enable toggles (UI may exist even if default starts at 0-17).
- Note naming selector (`sharps`/`flats`, default `sharps`).

Behavior rules:
- If a key/scale is selected, available chord choices should be constrained to diatonic chords within that key/scale.
- Interval include/exclude is interpreted relative to key root when key is selected; otherwise relative to chord root.
- Exclude intervals are allowed to remove root tones.

Acceptance:
- All filters function and combine (Scale AND Chord).
- Exclude interval removes all occurrences of that tone across the fretboard.
- Diatonic chord constraint works when key/scale is active.

### Milestone 4 - UI Polish Pass (Modern/Sleek)
Goal: finished feel without adding new functional theory features.

Deliverables:
- Consistent typography scale and spacing.
- Card-based filter panel with subtle blur/gradient.
- Hover/press states, smooth transitions (150-250ms).
- Clear visual legend and state summary.
- MVP uses dark theme.
- Accent color defined in a single obvious token location so it can be easily changed later.
- Optional future enhancement (not required in MVP scope): dark/light mode toggle.

Acceptance:
- No layout jank at common window sizes.
- Visual hierarchy: fretboard primary, filters secondary but accessible.

## 6) UI Look & Feel Requirements
### 6.1 Visual Style
- Modern desktop app look: rounded corners, soft shadows, subtle gradients.
- Optional shine: glassmorphism-style panel (blur + translucency), but keep readability high.
- Color system:
  - MVP theme is dark.
  - Accent color used only for highlights and active states.
  - Accent value must be centralized in theme tokens for easy later editing.
- Fretboard:
  - Clear string lines, fret separators, dot inlays.
  - Highlights:
    - Allowed notes: filled circles.
    - Root: distinct styling (stronger outline or different fill).
    - If both scale + chord active: chord tones slightly stronger than scale-only.
    - Non-allowed tones can be shown de-emphasized when chord filtering is active.

### 6.2 Layout
- Main: Fretboard centered, responsive to window size.
- Filter panel: right side (desktop) with collapsible sections.
- Top bar: compact state summary (Key/Scale/Chord/Omit) + quick reset.

### 6.3 Accessibility
- High contrast for note labels.
- Do not rely on color alone: root has a different shape/outline.

## 7) Modular Architecture (UPDATED: PLATFORM SEPARATION + REUSE)
### 7.0 Reuse Expectations Across Platforms
- High reuse: `/core` logic (theory + filters + fretboard cell mapping) as-is if the target platform can run TS/JS.
- Moderate reuse: assets (SVG icons, fonts, design tokens, textures).
- Low reuse: UI code if moving to non-web native UI (SwiftUI/Compose/Flutter).
  - If the future port remains web-based (for example, Tauri on macOS/Linux, or web app in browser), UI reuse is high.

### 7.1 File Size / Responsibility Rules
- Keep files small and single-purpose.
- No god files.
- Each file should ideally implement one concept:
  - one model
  - one computation module
  - one UI component

### 7.2 Monorepo Layout
/core
/src
pitchClass.ts
noteNaming.ts
intervals.ts
scales.ts
chords.ts
filters.ts
fretboardModel.ts
appState.ts
index.ts
/tests
scales.test.ts
chords.test.ts
filters.test.ts

/app
/src
/components
FretboardView.tsx
FilterPanel.tsx
StateSummaryBar.tsx
IntervalChipGroup.tsx
ToggleGroup.tsx
/rendering
fretboardCanvasRenderer.ts
layoutMetrics.ts
/state
appStateStore.ts
derivedSelectors.ts
/styles
theme.ts
tokens.ts
main.tsx

/assets
/icons
/fonts
/textures
/tokens
designTokens.json

### 7.3 Dependency Rules (UPDATED)
- `/core` has zero dependency on `/app`.
- `/app` imports `/core` only via `/core/src/index.ts`.
- `/assets` is platform-agnostic and must not import code.
- Canvas/WebGL rendering code must live under `/app/src/rendering` only (no rendering logic in `/core`).
- Persistence interfaces should be defined in app/state domain and implemented by local adapter first.

## 8) Codex Generation Rules
- Produce complete files, not partial fragments.
- Do not add features not listed in the milestone being worked on.
- Keep modules small; if a file grows beyond about 200-300 lines, split it.
- Use a consistent naming convention (camelCase for functions/vars; types per language norms).
- Avoid comments unless a section is genuinely non-obvious.
- After each milestone, run tests and report results before continuing.

## 9) Core Theory Engine Requirements (MVP)
- Pitch class model 0..11.
- Scale definitions: Major, Natural Minor.
- Chord qualities for MVP (common set): major, minor, diminished, augmented, sus2, sus4, major7, minor7, dominant7.
- Extensions supported up to 13 (common set): 6, 7, 9, 11, 13 plus common alterations where applicable.
- Include/exclude interval logic.
- Combine filters deterministically: intersect sets.
- Root notes are not protected from exclusion.

## 10) Acceptance Criteria (MVP)
- Key+Scale highlights correct notes.
- Chord highlights correct tones.
- Omit interval removes those tones globally (including root when selected).
- Filters combine correctly (Scale AND Chord).
- When key/scale is active, chord options are constrained to diatonic chords.
- Fret/string constraints apply correctly.
- Fretboard initially shows frets 0-17 with open strings.
- Chord context de-emphasizes non-chord tones and highlights valid tones.
- UI is modern/polished per style section.

