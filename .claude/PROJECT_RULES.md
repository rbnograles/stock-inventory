# Project Rules

## Non-Negotiables

- This is a React 18 + TypeScript + Vite PWA.
- Keep the app mobile-first.
- Supabase Auth and Supabase tables are now the source of truth.
- Use Material Tailwind primitives for common controls.
- Use Tailwind for layout and responsive styling.
- Keep camera/photo capture graceful when permissions fail.
- Add JSDoc-style file headers to new files and meaningful edits.
- Keep React components under 200 lines.
- Use `@/` alias imports.

## Data Rules

- Supabase `inventory_items` is the source of truth.
- Every item row must belong to `auth.uid()` through `user_id`.
- Row-level security must stay enabled for inventory data.
- Item records must preserve `id`, `createdAt`, and `updatedAt`.
- Expiry dates are stored as `YYYY-MM-DD` strings.
- Do not expose Supabase service-role keys in the frontend.

## UI Rules

- The first screen is the usable dashboard.
- Keep bottom actions thumb-friendly.
- Keep text readable on 390px-wide mobile screens.
- Provide dark mode classes for new UI.
- Use icons for obvious actions such as add, edit, delete, refresh, and
  dark-mode toggle.
- Avoid custom modal/backdrop implementations when Material Tailwind `Dialog`
  can handle the job.

## Quality Gates

- Run `npm run build` after code changes.
- Run `npm audit` after dependency changes.
- Use browser verification for UI changes.
- Do not leave generated screenshots or debug artifacts in the repo.
