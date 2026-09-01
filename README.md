# Grid and table UX reference

Four pages: Features needed, Experience, Applicable standards, Framework.
Selections made on Features needed carry to Experience and Standards via
URL query parameters (e.g. `/experience?layout=content&dataPoints=high`),
so both pages are independently loadable and shareable by link. Framework
is fully static and has no dependency on selections.

## Where things live

- `src/lib/selectionSchema.js` — the single source of truth for every
  question on the Features page: groups, keys, values, and the two derived
  flags (`cellLevelInteraction`, `virtualised`) that are computed rather
  than asked. If a field needs to change, change it here — every page reads
  from this file, nothing hardcodes field names elsewhere.
- `src/lib/selectionState.js` — encodes/decodes the selection object to and
  from the URL query string.
- `src/pages/Features.jsx` — built out fully; renders the schema as
  questions and writes to the debug panel so the selection object is
  visible while building the rest.
- `src/pages/Experience.jsx`, `src/pages/Standards.jsx` — currently stubs.
  They correctly decode the incoming selections and derived flags (visible
  in each page's debug card) but don't yet render tagged content. That's
  the next build step: going through the structural and standards research
  reports, tagging each fact against the keys in `selectionSchema.js`, then
  filtering each page's content against the incoming selections.
- `src/pages/Framework.jsx` — built out fully; static, no selection
  dependency.
- `src/styles/tokens.css` — copied directly from the design system source
  (`puneetsyaloutlook/designsystem`), not retyped.

## Local development

```
npm install
npm run dev
```

## Deploying

Push this repository to GitHub, then import it in Vercel. No environment
variables or backend are required for the current four-page scope — this
is a static site filtering tagged content against a selection object, not
anything that calls the Anthropic API or a data store. `vercel.json`
includes the rewrite rule needed for direct navigation to `/experience`,
`/standards`, or `/framework` to work correctly (without it, only links
clicked from within the app would resolve, and a hard refresh or a shared
link to any page but the root would 404).

## Next steps, in order

1. Content-tag the structural research report and the standards report
   against the keys in `selectionSchema.js`.
2. Build out `Standards.jsx` to filter and render the tagged standards —
   simpler than Experience, a good test of the tagging before it also has
   to drive a live grid.
3. Build out `Experience.jsx`: the live demo grid plus its filtered
   accessibility/reference-system report, reusing the filtering approach
   proven in step 2.
