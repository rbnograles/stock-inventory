# Claude Operational Memory

## Project

HomeStock is Ryan's mobile-first household inventory PWA. It tracks food,
medicine, supplies, quantities, item photos, product barcodes, locations, and
expiry dates.

## Current Architecture

- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS + Material Tailwind + lucide-react icons
- Auth: Supabase Auth email/password
- Storage: Supabase `inventory_items` table with RLS
- PWA: `public/manifest.webmanifest`, `public/sw.js`, SVG app icons

## Core Workflows

- `src/App.tsx` orchestrates inventory state, filtering, dialogs, and finance flow.
- `src/hooks/useAuth.ts` owns Supabase session state.
- `src/hooks/useInventory.ts` loads and mutates authenticated inventory state.
- `src/lib/inventoryStore.ts` owns Supabase persistence.
- `src/lib/supabaseClient.ts` owns client configuration.
- `src/lib/expiry.ts` owns expiry calculations and sorting.
- `src/components/ItemFormDialog.tsx` handles add/edit item forms.

## Decisions Already Made

- Supabase Auth gates the dashboard. No inventory loads until a user signs in.
- Supabase is the source of truth for inventory data.
- The app needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
- Barcode scanning has been removed; barcode is manual item metadata only.
- React and ReactDOM are forced to a single version through `package.json`
  overrides and Vite `resolve.dedupe` to avoid duplicate React hook errors from
  nested dependencies.
- Material Tailwind is wrapped in `src/lib/material.ts` because its runtime is
  useful but its current TypeScript props over-require several DOM props.

## Verification Baseline

The app has passed:

- `npm run build`
- `npm audit`
- Mobile Playwright screenshot smoke check
- Add-item browser smoke check

Run these again after changes that affect UI, storage, dependencies, or PWA
behavior.
