# Codex Memory

## Ryan's Preferences

- Ryan wants a practical mobile-first app, not a marketing landing page.
- Keep the UX direct: dashboard, scan, add, edit, delete, expiry status.
- Explain tradeoffs plainly and flag breaking changes before making them.
- Use warm, direct communication and keep final summaries concise.

## Local Environment

- Current root: `D:\Code\GWD\New project`
- Previous OneDrive location was copied here. The old folder may exist as an
  empty locked directory until Windows releases the prior workspace handle.
- Main dev command: `npm run dev -- --port 5173`
- Main verification command: `npm run build`
- Audit command: `npm audit`
- Required local env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Implementation Notes

- Preserve `@/` imports.
- Do not remove `package.json` overrides for React unless Material Tailwind no
  longer installs nested React copies.
- Do not inline the scanner back into `App.tsx`; keep it lazy-loaded.
- Keep `dist/` and `node_modules/` ignored.
- When adding forms, include explicit accessible labels or `aria-label` because
  Material Tailwind floating labels are not always enough for automation and
  assistive technology.
- Keep Supabase service-role keys out of frontend code and Vite env files.

## Near-Term Roadmap Ideas

- Add low-stock thresholds per item.
- Add Supabase Storage for photos if table data URLs become too large.
- Add install prompt guidance for mobile.
- Add HTTPS deployment for real phone camera scanning.
- Add export/import JSON backup.
