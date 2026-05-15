# HomeStock Architecture

## Overview

HomeStock is a single-page PWA built for fast household inventory tracking on
mobile. The app uses Supabase Auth and stores inventory rows in Supabase, then
presents stock status by category and expiry risk.

## Layers

- `src/types/`: Shared inventory contracts and category definitions.
- `src/data/`: First-run seed data.
- `src/lib/`: Framework-light domain logic, Supabase client, and adapters.
- `src/hooks/`: React lifecycle/state coordination.
- `src/components/`: Reusable UI surfaces and workflow dialogs.
- `public/`: PWA manifest, service worker, and icons.

## Data Flow

1. `useAuth` loads the Supabase session.
2. `App` shows `AuthScreen` until a user signs in.
3. `useInventory` loads the signed-in user's items from `inventoryStore`.
4. `inventoryStore` maps Supabase rows to UI-friendly inventory items.
5. `App` filters and groups items for dashboard display.
6. `ItemFormDialog` creates or updates drafts.
7. `ScannerDialog` returns a barcode into the add/edit flow.
8. Expiry labels and priority sorting come from `expiry.ts`.

## Current Storage Shape

Each inventory item includes:

- `id`
- `userId`
- `name`
- `category`
- `quantity`
- `unit`
- `barcode`
- `location`
- `expiryDate`
- `notes`
- `photoDataUrl`
- `createdAt`
- `updatedAt`

## Deployment Notes

The app can run locally with Vite after `.env` contains Supabase client config.
For realistic mobile camera and barcode testing, deploy over HTTPS so browser
permission rules allow camera streams.
