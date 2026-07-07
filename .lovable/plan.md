
## Scope

Frontend-only Project Management Dashboard. No backend, no auth, no API calls. All data comes from a mock data layer designed so it can be swapped for Supabase later without touching UI components.

Note on stack: the project is on **TanStack Start + TanStack Router** (not Vite + React Router). I'll use TanStack Router file-based routes instead of `react-router-dom` — everything else in your spec (Tailwind, shadcn/ui, Lucide, Framer Motion) applies as-is. Let me know if you'd rather I swap to a plain Vite + React Router setup.

## Design system

- Inter font loaded via `<link>` in `__root.tsx`
- White background, `#2563EB` blue primary, neutral grays, subtle borders
- Rounded-xl cards, soft shadows (`shadow-sm` / custom elegant shadow token)
- Tokens defined in `src/styles.css` under `@theme inline` (primary, primary-glow, sidebar, success, warning, destructive, chart colors)
- Framer Motion for card hover lift, page fade-in, modal scale-in, sidebar collapse
- Fully responsive: sidebar collapses to icon rail on tablet, drawer on mobile

## Route structure (TanStack Router)

```
src/routes/
  __root.tsx              → Inter font link, base metadata
  _app.tsx                → Layout: Sidebar + Navbar + <Outlet/>
  _app.index.tsx          → Dashboard (path: /)
  _app.projects.tsx       → Projects
  _app.employees.tsx      → Employees
  _app.tasks.tsx          → Tasks
  _app.profile.tsx        → Profile
  _app.settings.tsx       → Settings
```

## Mock data layer (Supabase-ready)

`src/lib/mock/` with typed data + async accessors so real Supabase queries can drop in later:

```
src/lib/
  types.ts                → Project, Employee, Task, Activity, User, Priority, Status
  mock/
    projects.ts, employees.ts, tasks.ts, activities.ts, user.ts
  data/
    projects.ts           → getProjects(), getProject(id)  (async, returns mock now)
    employees.ts, tasks.ts, activities.ts, profile.ts
```

Components call `getProjects()` etc. — later these become Supabase queries with no component changes.

## Reusable components

`src/components/`
- `layout/Sidebar.tsx` — collapsible, active-route highlight via `useRouterState`, user block + logout at bottom
- `layout/Navbar.tsx` — search input, notifications popover, theme toggle (UI only, toggles `.dark` class), avatar menu, welcome message
- `layout/AppShell.tsx` — wraps Sidebar + Navbar + main
- `ui/SummaryCard.tsx`, `ProjectCard.tsx`, `EmployeeTable.tsx`, `TaskTable.tsx`, `Modal.tsx` (wraps shadcn Dialog), `Badge.tsx` (status/priority variants), `Avatar.tsx`, `AvatarStack.tsx`, `ProgressBar.tsx`, `EmptyState.tsx`, `LoadingSkeleton.tsx`, `PriorityPill.tsx`, `StatusPill.tsx`
- shadcn primitives already available: button, input, select, dialog, table, dropdown-menu, popover, tooltip, skeleton, avatar, progress

## Pages

**Dashboard** — 4 summary cards (Total Projects, Total Employees, Pending Tasks, Completed Tasks) with trend delta and icon; Recent Projects table (name, status badge, progress bar, due date); My Tasks grid of task cards; Activity Timeline with icon + relative timestamp.

**Projects** — Header with title + "Create Project" button. Responsive grid of ProjectCards (name, description, progress, avatar stack, status badge, due date, View/Edit/Delete). Create Project modal (name, description, start date, end date, status select) — form state only, no submit logic.

**Employees** — "Add Employee" button. Table with avatar, name, email, department, role, status badge, actions dropdown. Add Employee modal (name, email, phone, department, designation, image upload UI only).

**Tasks** — "Create Task" button. Table (title, project, assignee avatar+name, priority pill, status, due date, actions). Create Task modal (name, description, project select, employee select, priority, due date). Filter bar (status + priority) as bonus.

**Profile** — Card with large avatar, name, email, role, department, phone. Buttons: Edit Profile (opens modal with form), Change Password (opens modal, UI only).

**Settings** — Minimal stub with sections (Appearance, Notifications, Account) — placeholder toggles.

## Modals

Single `Modal` wrapper around shadcn `Dialog` with consistent header/footer/spacing. All form submits are `preventDefault` + `console.log` + close, ready to be replaced with Supabase mutations.

## Animations

- Page transitions: `motion.div` fade + 4px translate-y on route change
- Cards: `whileHover={{ y: -2 }}` with shadow transition
- Sidebar collapse: width transition + label fade
- Modal: shadcn default + subtle scale

## Technical notes

- Theme toggle: toggles `.dark` on `<html>`, persisted to `localStorage` (UI only, no user preference sync)
- Sidebar collapsed state: `localStorage`
- All colors via semantic tokens — no hardcoded hex in components
- Mobile: sidebar becomes a Sheet triggered from navbar hamburger
- Every page/component reads from the async mock data layer with `useEffect` + loading skeletons, so the swap to TanStack Query + Supabase later is mechanical

## Out of scope (explicit)

Supabase, auth, real uploads, real notifications, drag-and-drop task boards, calendar view, real search — all deferred.
