# Project Plan

## Completed

- Scaffolded React 18 + TypeScript + Vite app.
- Added Tailwind CSS and Material Tailwind.
- Added PWA manifest, SVG icons, and service worker.
- Added IndexedDB local storage.
- Added seeded starter inventory.
- Added dashboard summary and category grouping.
- Added search and category filters.
- Added add/edit/delete item flow.
- Added photo capture through mobile camera/file input.
- Removed barcode scanning; barcode remains manual item metadata only.
- Added dark mode toggle.
- Added build and audit verification.
- Added Supabase Auth login/sign-up.
- Replaced IndexedDB inventory persistence with Supabase.
- Added Supabase SQL migration with row-level security.

## Next Useful Work

1. Apply the Supabase migration to Ryan's project.
2. Add `.env` with Supabase URL and anon key.
3. Add low-stock threshold and shopping list view.
4. Add Supabase Storage for photos instead of table data URLs.
5. Add deployment over HTTPS for realistic mobile testing.

## Risks To Watch

- Material Tailwind type definitions may require the local adapter until the
  package improves its React typings.
- Service worker cache strategy is intentionally simple and should be revisited
  before production release.
- Photo data URLs may become too large for table rows; Supabase Storage is the
  likely next step for production photos.
