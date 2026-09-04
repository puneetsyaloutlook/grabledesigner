// Each entry is a point where a selected feature or an applicable standard
// could reasonably be rendered more than one way. Unlike standards.js (pass/
// fail rules), these are judgement calls: several legitimate options, a
// trade-off between them, and the specific one this demo implements and why.
// Same applies(selections, derived) filtering pattern as standards.js, so
// Experience can reuse the same filtering logic Standards already proved out.
//
// Several of these are exactly the stylistic content that was deliberately
// kept OUT of standards.js (alignment, negative-number format, truncation
// direction) because it's a choice, not a required standard. This is where
// that content belongs instead.

export const decisions = [
  {
    id: 'selection-indicator',
    title: 'Selected-row indication',
    category: 'Selection',
    question: 'How is a selected row shown?',
    options: [
      { label: 'Checkbox plus a row background tint', chosen: true, note: 'Satisfies the not-colour-alone requirement while staying scannable as a block.' },
      { label: 'Background tint alone', chosen: false, note: 'Fails WCAG 1.4.1: colour is the only signal.' },
      { label: 'Checkbox alone, no tint', chosen: false, note: 'Accessible on its own, but harder to scan a run of selected rows at a glance.' },
    ],
    tradeoff: 'Tint-only is the common shortcut and the one to avoid; checkbox-only is safe but less scannable. Combining both costs a small amount of visual weight per row for a real gain in both.',
    applies: (s) => s.selection !== 'none',
  },
  {
    id: 'selection-indeterminate-style',
    title: 'Partial-selection indication',
    category: 'Selection',
    question: 'How is a partial selection shown on the select-all control?',
    options: [
      { label: 'Native indeterminate checkbox state (a dash)', chosen: true, note: 'Matches the platform convention (aria-checked="mixed") and needs no custom markup.' },
      { label: 'A custom icon or badge showing a count', chosen: false, note: 'Can carry more information (how many selected) but isn’t a recognised control state, so it has to be built and explained from scratch.' },
    ],
    tradeoff: 'The native dash is instantly recognisable but mute. It says "some" not "how many". A count is more informative but unfamiliar as a checkbox treatment.',
    applies: (s) => s.selection === 'multi',
  },
  {
    id: 'editable-affordance',
    title: 'Editable-cell affordance',
    category: 'Editing',
    question: 'How is an editable cell distinguished from a read-only one, before interaction?',
    options: [
      { label: 'A persistent border or underline on every editable cell', chosen: true, note: 'Discoverable at a glance across the whole grid, satisfies the not-hover-only requirement outright.' },
      { label: 'A small pencil icon shown on hover or focus only', chosen: false, note: 'Cleaner when idle, but risks reading as read-only until a user happens to interact, the exact failure mode the standard rules out.' },
      { label: 'A background tint on all editable cells', chosen: false, note: 'Discoverable, but a tint across many cells in a dense grid reads as noisy.' },
    ],
    tradeoff: 'A persistent border is the most reliably discoverable option and the one with least accessibility risk, at the cost of a slightly busier grid than a hover-only treatment.',
    applies: (s) => s.editing !== 'none',
  },
  {
    id: 'truncation-reveal',
    title: 'Truncated-cell reveal',
    category: 'Data formatting',
    question: 'How does a user see the full value of a truncated cell?',
    options: [
      { label: 'A tooltip triggered on hover and keyboard focus', chosen: true, note: 'Matches the "typically satisfied by" pattern from the applicable standards, and keeps the grid visually quiet.' },
      { label: 'An inline "Show more" link or click-to-expand', chosen: false, note: 'Simpler to implement correctly and inherently keyboard/touch-friendly, at the cost of a visible control in every truncated cell.' },
    ],
    tradeoff: 'GitHub Primer’s own docs argue for "Show more" over a tooltip precisely because tooltips are easy to get wrong for keyboard users (the native title attribute fails outright). The tooltip is used here because it can be built correctly, but "Show more" is the lower-risk default if that engineering effort isn’t available.',
    applies: () => true,
  },
  {
    id: 'truncation-direction',
    title: 'Truncation direction',
    category: 'Data formatting',
    question: 'Which end of a truncated value is cut?',
    options: [
      { label: 'End-truncated (keep the start, cut the tail)', chosen: true, note: 'Correct default for names, descriptions, and prose, where the start carries the meaning.' },
      { label: 'Middle-truncated (keep both ends, cut the middle)', chosen: false, note: 'Better for IDs, file paths, and codes, where both the start and the end carry meaning. Used selectively, not as the default.' },
    ],
    tradeoff: 'One truncation rule doesn’t fit every column type. This demo defaults to end-truncation and would switch to middle-truncation specifically on ID- or path-shaped columns.',
    applies: () => true,
  },
  {
    id: 'multi-sort-priority',
    title: 'Multi-column sort priority',
    category: 'Sorting',
    question: 'How is sort priority shown when more than one column is sorted?',
    options: [
      { label: 'A small ordinal number next to each sorted column’s arrow', chosen: true, note: 'Makes priority actually legible, following Adrian Roselli’s accessible pattern (the number sits in an aria-hidden span; aria-sort carries the direction).' },
      { label: 'Per-column icons with no visible priority', chosen: false, note: 'AG Grid’s approach: simpler headers, but priority becomes undiscoverable without clicking through.' },
    ],
    tradeoff: 'Visible ordinal numbers add a small amount of header clutter in exchange for genuinely legible sort priority, rather than leaving it implicit.',
    applies: (s) => s.sorting === 'multi',
  },
  {
    id: 'locked-column-boundary',
    title: 'Locked-column boundary',
    category: 'Structure',
    question: 'How is the edge between a frozen column and the scrollable area shown?',
    options: [
      { label: 'A persistent 1px border at the boundary', chosen: true, note: 'Unambiguous at rest and while scrolling, doesn’t rely on a scroll event to appear.' },
      { label: 'A drop shadow that appears on scroll', chosen: false, note: 'Ant Design’s approach: visually quieter, but flagged in the structural research as a documented discoverability weakness, easy to miss entirely.' },
      { label: 'A background colour shift on the frozen column', chosen: false, note: 'Very visible, but reads as a heavier visual seam than the boundary usually warrants.' },
    ],
    tradeoff: 'The shadow-on-scroll treatment is the more common pattern in the wild but is genuinely easy to miss; a persistent border trades a little visual quietness for reliability.',
    applies: (s) => s.lockedColumns,
  },
  {
    id: 'empty-na-zero-tokens',
    title: 'Empty, not-applicable, and zero tokens',
    category: 'Data formatting',
    question: 'What’s shown for not-applicable versus genuinely empty versus zero?',
    options: [
      { label: 'An en dash for not-applicable, "0" written out for zero', chosen: true, note: 'Visually quiet in a dense numeric column while keeping all three states distinguishable, including to screen readers.' },
      { label: 'The word "N/A" spelled out', chosen: false, note: 'More explicit for a first-time user, but adds real visual weight repeated down a long column.' },
    ],
    tradeoff: 'Both satisfy the underlying requirement (the three states must stay distinguishable). This is a pure style call, not a compliance one.',
    applies: () => true,
  },
  {
    id: 'negative-number-format',
    title: 'Negative-number format',
    category: 'Data formatting',
    question: 'How are negative numbers shown?',
    options: [
      { label: 'A leading minus sign', chosen: true, note: 'The most compact and the most broadly understood convention outside accounting contexts.' },
      { label: 'Accounting-style parentheses', chosen: false, note: 'Familiar in finance-specific contexts, less broadly understood outside them.' },
      { label: 'Red text colour alone', chosen: false, note: 'Rejected outright, since colour as the only signal fails the same not-colour-alone requirement selection state has to meet.' },
    ],
    tradeoff: 'The choice between a minus sign and parentheses is genuinely audience-dependent; red-alone isn’t a real option regardless of audience.',
    applies: () => true,
  },
  {
    id: 'grouped-header-pin-behaviour',
    title: 'Grouped-header pin behaviour',
    category: 'Structure',
    question: 'What happens to a grouped header if pinning or reordering would separate its children?',
    options: [
      { label: 'Keep the group’s children locked together, so they can’t be split apart', chosen: true, note: 'Matches AG Grid’s marryChildren option. The group stays intact, at the cost of limiting how far any one child column can be pinned or moved on its own.' },
      { label: 'Let the group split into two separate groups when its children are separated', chosen: false, note: 'The more common default: more flexible column-by-column, but it breaks the semantic pairing the group existed to show.' },
    ],
    tradeoff: 'Splitting is what most grid libraries do by default, and it’s more flexible, but it defeats the reason the grouping existed in the first place. Locking children together is the safer choice whenever the pairing is genuinely meaningful rather than incidental, the same judgement call as whether to use a grouped header at all.',
    applies: (s) => s.groupedHeaders,
  },
  {
    id: 'bulk-action-treatment',
    title: 'Bulk-action confirmation',
    category: 'Actions',
    question: 'How does a bulk action get confirmed?',
    options: [
      { label: 'A persistent action bar with a live selection count, no extra confirmation step', chosen: true, note: 'Used here for non-destructive bulk actions (tagging, exporting): low friction, the count itself is the safeguard.' },
      { label: 'The same bar, but its action button opens a confirmation modal naming the count', chosen: true, note: 'Used here specifically for destructive or irreversible bulk actions (bulk delete): the extra step is deliberate friction where a mistake is costly.' },
    ],
    tradeoff: 'This isn’t really either/or. The research (NN/G) supports scaling the friction to the stakes of the action, not applying one confirmation pattern uniformly regardless of what’s being done.',
    applies: (s) => s.actions === 'bulk',
  },
  {
    id: 'export-scope',
    title: 'Export scope',
    category: 'Data loading',
    question: 'Does export include the full dataset, or only what’s currently visible?',
    options: [
      { label: 'The current filtered and sorted view, in the current column order', chosen: true, note: 'Matches what’s on screen, so the export isn’t a surprise. Consistent with the item-count-in-title standard: what you see is what you get.' },
      { label: 'The full underlying dataset, regardless of any active filter', chosen: false, note: 'Sometimes the actual intent (a full backup or handoff), but silently exporting more than what’s visible on screen is the more common source of "why doesn’t this match what I filtered to" complaints.' },
    ],
    tradeoff: 'Full-dataset export is genuinely the right call for some use cases (a full data handoff), but it needs to be a clearly labelled, separate choice from a default "export this" action, not the default itself.',
    applies: (s) => s.exportFormat !== 'none',
  },
  {
    id: 'print-interactive-chrome',
    title: 'Interactive chrome in print output',
    category: 'Data loading',
    question: 'Do checkboxes, sort controls, and action buttons appear in the printed output?',
    options: [
      { label: 'Hidden via a print stylesheet: only the data itself prints', chosen: true, note: 'Matches standard practice; a checkbox or a sort arrow means nothing on paper, and printing them adds visual noise without adding information.' },
      { label: 'Left visible, printed exactly as they render on screen', chosen: false, note: 'Simpler to build (no separate print stylesheet needed for this specifically), but prints controls that can’t be interacted with, wasting space and reading as unfinished.' },
    ],
    tradeoff: 'Hiding interactive chrome needs a real print stylesheet, not just relying on the screen layout, which is the same underlying work the overflow-handling requirement already needs, so there’s little extra cost to doing both properly at once.',
    applies: (s) => s.printSupport,
  },
  {
    id: 'stacked-pair-sort-behaviour',
    title: 'Sorting a stacked pair',
    category: 'Sorting',
    question: 'Can each stacked value be sorted independently, or does the pair sort as one unit?',
    options: [
      { label: 'Each value keeps its own independent sort control, stacked to match the values below', chosen: true, note: 'Consistent with the pair itself: the upper header controls the upper value, the lower header controls the lower value, exactly as they\u2019re read.' },
      { label: 'The pair sorts as a single combined unit, always by the upper value', chosen: false, note: 'Simpler to build, but breaks the direct correspondence the pattern exists to show, and makes the lower value impossible to sort by at all.' },
    ],
    tradeoff: 'Independent sorting costs a little more header space, two small controls instead of one, but a single combined sort would mean the lower value loses a real capability the upper value keeps, for no reason other than where it happens to sit.',
    applies: (s) => s.stackedValues && s.sorting !== 'none',
  },
  {
    id: 'as-of-timestamp-format',
    title: 'As-of timestamp format',
    category: 'Data loading',
    question: 'What does the as-of timestamp actually show: date, time, and timezone, in what format?',
    options: [
      { label: 'Full date (day, text month, year) plus 12-hour time with an explicit AM/PM, plus a timezone abbreviation', chosen: true, note: 'A text month sidesteps the US-vs-world day/month ordering ambiguity entirely, no date is more readable with an explicit AM/PM than without one, and a bare time is meaningless without knowing whose clock it\u2019s on: someone in a different timezone can\u2019t tell if it\u2019s stale without one.' },
      { label: '24-hour time, no AM/PM', chosen: false, note: 'Removes AM/PM ambiguity outright and is the norm in many international and technical contexts, but is less immediately familiar to a general audience at a glance; a defensible alternative default, not a wrong one.' },
    ],
    tradeoff: 'Daylight saving isn\u2019t a separate problem this needs to solve: the timestamp is built from the browser\u2019s own Date and Intl APIs rather than manual UTC-offset math, so the platform\u2019s own timezone database handles DST transitions correctly without extra code. The one thing this demo doesn\u2019t attempt is per-user locale formatting, a real production system would format the date and time according to the viewer\u2019s own locale rather than one fixed format for everyone, which this reference keeps fixed for legibility.',
    applies: (s) => s.manualRefresh || s.realTimeUpdates,
  },
];

export function applicableDecisions(selections, derived) {
  return decisions.filter((entry) => entry.applies(selections, derived));
}
