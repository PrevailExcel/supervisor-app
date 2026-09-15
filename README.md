# Supervision Dashboard — Demo (frontend only)

Standalone Vue 3 + Vite + Tailwind app. Deliberately kept separate from the
main Thesis-Speedwrite app, per the "keep things distinct" direction.

## Run it

```bash
npm install
npm run dev
```

Opens at http://localhost:5183.

## What's real vs. mocked

Everything in `src/data/seed.js` is mock data — five demo researchers at
different stages, with realistic content per stage type and a feedback
history that shows the question/response and revision/resubmit loops in
progress, not just empty states.

Every action in the UI (Approve / Ask a Question / Return for Revision,
resolving feedback, marking notifications read) mutates real, in-memory
Pinia state via `src/stores/supervision.js` — so it's a genuine
click-through demo, not a static mockup. "Reset demo data" on the
dashboard restores the original seed at any time.

## Wiring in the real backend later

`src/stores/supervision.js` is the single seam to replace. Every action
(`approve`, `askQuestion`, `returnForRevision`, etc.) is already named and
shaped after the "any one supervisor's approve is enough" rule and the
five records in the spec (assignment, submission, review, response,
activity log) — so swapping its state mutations for real API calls
shouldn't require touching the views at all.

## Design system

Ledger/annotated-manuscript direction — see the color tokens in
`tailwind.config.js` (ink / paper / rule / approved / awaiting /
attention / accent) and the two typefaces (Source Serif 4 for headings,
IBM Plex Sans for UI) in `index.html`.
