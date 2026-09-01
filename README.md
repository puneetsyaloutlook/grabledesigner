# Grid and table UX reference

Four pages: Features needed, Applicable standards, Experience, Framework.
Selections made on Features needed carry to Applicable standards and
Experience via URL query parameters (e.g.
`/experience?layout=content&dataPoints=high`), so both pages are
independently loadable and shareable by link. Framework is fully static and
has no dependency on selections.

Applicable standards and Experience are not siblings that each read the
selections separately. Applicable standards is upstream of Experience: the
filtered requirements list it renders is the same list Experience must
satisfy, pulled from one shared module (`src/lib/standards.js`) rather than
authored twice. If a requirement is applicable, the demo grid has to
actually meet it, not just illustrate the feature that triggered it.

## Where things live

- `src/lib/selectionSchema.js` — the single source of truth for every
  question on the Features page: groups, keys, values, and the two derived
  flags (`cellLevelInteraction`, `virtualised`) that are computed rather
  than asked. If a field needs to change, change it here — every page reads
  from this file, nothing hardcodes field names elsewhere.
- `src/lib/selectionState.js` — encodes/decodes the selection object to and
  from the URL query string.
- `src/lib/standards.js` — the functional requirements, each tagged with
  the selection (or derived flag) that triggers it. This is the shared
  source both Applicable standards and Experience read from.
- `src/pages/Features.jsx` — built out fully; renders the schema as
  questions and writes to the debug panel so the selection object is
  visible while building the rest.
- `src/pages/Standards.jsx` — built out fully; filters `standards.js`
  against the incoming selections and renders the result, grouped by
  category.
- `src/pages/Experience.jsx` — the demo grid itself isn't built yet. The
  page does correctly pull and render the same filtered requirements list
  as Standards, so the dependency is real in code, not just described here.
  Building the actual grid is the next step, and it needs to be checked
  against this list as it's built, not written up afterward to describe it.
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

1. Build the live demo grid in `Experience.jsx`. Use the requirements list
   already rendered on that page as the implementation checklist — each
   applicable entry (selected-state indication, aria-sort, focus handling,
   and so on) needs to actually be true of the rendered grid, not just
   listed alongside it.
2. As the grid takes shape, cross-check it against `standards.js` directly
   rather than against memory of the research reports — the tagged data is
   the authoritative version at this point, the reports are what informed
   it.

