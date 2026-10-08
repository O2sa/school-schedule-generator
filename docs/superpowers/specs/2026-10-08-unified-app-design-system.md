# Unified Application Design System & Aesthetic Overhaul Specification

**Date**: 2026-10-08  
**Topic**: Unifying the School Timetable Generator Application Suite Design Language with the Modern Landing Page  
**Status**: Draft (Ready for User Review)

---

## 1. Problem Statement & Motivation

The School Schedule Generator features a modern, high-converting multilingual landing page (`/`, `/ar`, `/en`) characterized by:
- A signature brand aesthetic: Indigo-to-Cyan gradients (`linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)`).
- Glassmorphism: Translucent sticky headers, subtle `backdrop-filter: blur(12px)`, and crisp 1px borders (`rgba(0,0,0,0.06)` / `rgba(255,255,255,0.08)`).
- Micro-interactions & depth: Soft layered shadows, hover lifts (`translateY(-2px)`), and pill badges (`radius="xl"`).
- High visual telemetry: Interactive solver simulation with glowing progress bars and real-time metric counters.
- Rich timetable cards: Color-coded lecture chips with clear teacher and room badges.

In contrast, the core application suite under `/app/*` (`Dashboard`, `Teachers`, `Classes`, `Subjects`, `Curriculum`, `Generator`, `ScheduleView`, and `Settings`) was built using standard Mantine defaults without the unified brand identity, resulting in a visual dissonance when transitioning from the landing page into the app.

This project unifies the entire application suite's design language, creating a consistent, state-of-the-art SaaS visual experience across both light and dark modes in both Arabic (RTL) and English (LTR).

---

## 2. Goals & Success Criteria

1. **Global Theme & Token Consistency**:
   - Centralize brand colors, gradients, card radii, shadows, and component defaults in `client/src/theme/theme.ts`.
   - Maintain full bilingual RTL and LTR layout symmetry with Cairo/Tajawal fonts.
2. **Glassmorphic Application Shell (`AppLayout.tsx`)**:
   - Header with glassmorphism, brand calendar icon badge, quick-switch language and theme toggles, and a prominent Home link to the landing page.
   - Floating glassmorphic sidebar with rounded active pills, subtle glow indicators, and status chips.
3. **Cockpit-Level Experience for Core Workflows**:
   - **Dashboard**: Hero greeting banner with quick generation shortcuts, 4 landing-style metric stat cards, and hover-lifted navigation cards.
   - **Generator**: Telemetry cockpit with glowing gradient progress bars, real-time counters, phase badges, and celebratory zero-conflict outcome cards.
   - **ScheduleView**: Upgraded timetable matrix with vibrant subject color tags, room chips, teacher badges, and export toolbar.
4. **Polished Data Management & Settings**:
   - Data tables encapsulated in elevated cards with glassmorphic search/filter toolbars, capacity progress bars, and gradient action buttons.
   - Structured settings cards with clean toggle rows.
5. **Zero Regression Guarantee**:
   - 100% of existing unit, integration, and E2E tests (monorepo test suites) continue to pass with 0 errors.
   - Clean TypeScript typecheck (`tsc --noEmit`) and successful production build (`pnpm build`).

---

## 3. Architecture & Design System Specification

### 3.1 Theme Tokens & Component Styles (`client/src/theme/theme.ts`)

- **Gradients & Accents**:
  - `BRAND_GRADIENT`: `linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)`
  - `BRAND_GRADIENT_HORIZONTAL`: `linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)`
  - `SUCCESS_GRADIENT`: `linear-gradient(135deg, #059669 0%, #10b981 100%)`
- **Component Defaults**:
  - `Card`: defaultRadius = `lg`, border = `1px solid var(--mantine-color-default-border)`
  - `Button`: defaultRadius = `md`, gradient variant supported with subtle shadow
  - `Badge`: defaultRadius = `xl`, variant = `light` or `gradient`
  - `Table`: highlightOnHover = true, withColumnBorders = false, withRowBorders = true
  - `Modal` / `Drawer`: radius = `lg`, overlayProps = { blur: 4, backgroundOpacity: 0.55 }

### 3.2 Application Shell (`client/src/layouts/AppLayout.tsx`)

- **Header (`AppShell.Header`)**:
  - Sticky glassmorphic top navigation: `background: rgba(255, 255, 255, 0.85)` (light) / `rgba(18, 20, 29, 0.85)` (dark), `backdrop-filter: blur(12px)`.
  - Brand identity: 38px gradient calendar icon badge matching `LandingNavbar`.
  - Controls: Home link (`/ar` or `/en`), Storage Mode badge, Language toggle, Dark/Light mode toggle.
- **Navbar (`AppShell.Navbar`)**:
  - Floating sidebar panel with subtle translucent glass backdrop.
  - Navigation links styled as rounded pills (`radius="md"`):
    - Inactive: transparent background, dimmed text, subtle hover highlight.
    - Active: soft indigo tint (`rgba(79, 70, 229, 0.1)`), vibrant primary icon, and clean indicator.
  - Bottom status footer: quick dataset indicators and demo loader shortcut.

### 3.3 Enhanced Shared Components (`PageHeader.tsx` & Metric Cards)

- **`PageHeader.tsx`**:
  - Category pill badge above title (e.g., `لوحة القيادة`, `محرك التوليد الذكي`).
  - H2 title with tight letter-spacing and optional gradient highlight.
  - Descriptive subtitle in dimmed text.
  - Glassmorphic actions container for primary/secondary buttons.
- **Metric Cards (`DashboardMetricCard`)**:
  - 44px gradient icon chip in the top corner.
  - Large bold metric value (`size="xl"`, `fw={800}`).
  - Descriptive label and secondary status badge.
  - Micro-lift hover animation: `transition: all 0.2s ease`, `&:hover: { transform: translateY(-3px) }`.

---

## 4. Screen-by-Screen Visual Architecture

### 4.1 Dashboard (`client/src/pages/Dashboard.tsx`)
- **Hero Banner**:
  - Gradient mesh card (`linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)`).
  - System readiness summary and primary CTA button "Generate Timetable" (`/app/generator`).
- **4 Metric Cards**:
  - **Teachers**: Teacher count and total weekly capacity.
  - **Classes**: Active classes and grade distribution.
  - **Subjects & Curriculum**: Total subjects and weekly required lectures.
  - **Timetable Status**: Active schedule status (e.g. "Optimal • 0 Conflicts" or "Ready to Generate").
- **Quick-Access Action Grid**:
  - Interactive feature cards for Teachers, Classes, Curriculum, and Timetables with hover arrows and subtext.

### 4.2 AI Generator Cockpit (`client/src/pages/Generator.tsx`)
- **Configuration Panel**:
  - Glassmorphic card containing timeout controls, relaxation toggles, and random seed inputs.
  - Large primary gradient CTA: **"Start AI Timetable Solver" / "بدء توليد الجدول الذكي"** with rocket icon.
- **Live Solver Telemetry Display**:
  - Mirrored after the landing page `LiveSolverDemo`:
    - Glowing gradient progress bar (`indigo` to `cyan`).
    - Live counters: Assigned Lectures, Conflict Count, Elapsed Solver Time.
    - Status badge displaying the active solver phase.
- **Outcome Status Card**:
  - **Success**: Emerald gradient card with zero conflict badge and "Open Timetable" link.
  - **Infeasible**: Clear constraint diagnostic advice.

### 4.3 Interactive Timetable Matrix (`client/src/pages/ScheduleView.tsx`)
- **View Selectors & Export Toolbar**:
  - Pill tabs for Class View, Teacher View, Master School Matrix, and Rooms.
  - Class and teacher dropdown selector.
  - Export action group: PDF Print, Excel/CSV Export, and JSON Backup.
- **Timetable Grid**:
  - Period time headers (`08:00 - 08:45`, etc.) with day columns.
  - Lecture slots styled as elevated micro-cards:
    - Subject badge with distinctive color chip.
    - Teacher name with icon chip and classroom tag.
    - Clean hover and drag-and-drop states.
- **Conflict Diagnostic Banner**:
  - Emerald validation pill: **"0 Conflicts • 100% Validated Timetable"**.

### 4.4 Data Management Pages (`Teachers`, `Classes`, `Subjects`, `Curriculum`)
- **Search & Filter Bar**:
  - Rounded search input with icon.
  - Filter pills by grade or subject.
  - Gradient "+ Add" button.
- **Table Cards**:
  - Elevated card containers (`radius="lg"`).
  - Clean table headers with subtle row borders.
  - Workload progress bars (`18/20 periods`) indicating teacher availability.
  - Action buttons (`Edit`, `Availability`, `Delete`) with subtle icon buttons.

### 4.5 Settings Page (`client/src/pages/Settings.tsx`)
- Categorized settings cards:
  - School Calendar & Working Days.
  - Daily Periods & Timeslots.
  - Storage Mode (IndexedDB / Mock Server) with status badge.
  - Reset & Backup zone.

---

## 5. Non-Functional Requirements & Accessibility

1. **RTL & LTR Symmetry**:
   - All flex layouts, margins, padding, and icons (arrows, chevrons) must respect `dir="rtl"` and `dir="ltr"` properly using Mantine's directional utilities.
2. **Dark Mode Contrast**:
   - All glassmorphic backgrounds, text colors, and borders must provide WCAG AA contrast against dark backgrounds (`#101113` / `#1a1b1e`).
3. **Performance**:
   - Zero heavy external stylesheet additions; leverage native Mantine CSS modules, CSS variables, and lightweight inline styling tokens.
   - Smooth 60fps CSS transitions on hover lifts and gradients.

---

## 6. Testing & Quality Assurance Plan

1. **Unit & Component Testing**:
   - Update `client/tests/layout.test.tsx` to assert new header structure, Home link, and sidebar navigation.
   - Verify all existing page tests (`client/tests/management-pages.test.tsx`, `generator.test.tsx`, `schedule-view.test.tsx`, `timetable-views.test.tsx`, `theme.test.tsx`).
2. **Monorepo Test Suite**:
   - `pnpm test`: Execute all 35 test suites across `school-timetabling-engine` and `client`.
3. **Type Safety & Build**:
   - `pnpm typecheck`: Ensure 0 TypeScript errors.
   - `pnpm build`: Verify successful production bundle creation.
