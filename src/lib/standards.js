// Each entry: which selection (or derived flag) makes it applicable, the
// requirement itself, why (source), and the typical way it's satisfied.
// `applies(selections, derived)` returns true/false. This is the
// "applicability, not opt-in" model: nothing here is choosable, it's either
// true of the grid as configured, or it isn't.

export const standards = [
  // Always-applicable: not tied to any toggle, true of every grid.
  {
    id: 'data-consistency',
    category: 'Data formatting',
    requirement: 'Values of the same type in the same column must be presented consistently (same precision, same date format, same units).',
    why: 'A List Apart, "Designing Tables to be Read, Not Looked At" (Rutter): inconsistent precision makes small high-precision numbers look larger at a glance, breaking column scanning.',
    typical: 'Format per column at render time rather than per row.',
    applies: () => true,
  },
  {
    id: 'empty-na-zero',
    category: 'Data formatting',
    requirement: 'Empty, not-applicable, and genuine-zero values must remain distinguishable from each other, including to screen reader users.',
    why: 'Screen reader behaviour on truly empty cells is inconsistent: JAWS announces "blank," NVDA skips it (WebAIM / Chax).',
    typical: 'Use an explicit token (an en dash, N/A, or 0) rather than a genuinely empty cell.',
    applies: () => true,
  },
  {
    id: 'truncation',
    category: 'Data formatting',
    requirement: 'If content is truncated, a mechanism must exist to reveal the full value, and it cannot rely on hover alone.',
    why: 'WCAG 1.4.13 Content on Hover or Focus requires content to be dismissible, hoverable, and persistent; the native title attribute fails this for keyboard users (GitHub Primer).',
    typical: 'A tooltip triggered on both hover and keyboard focus, or an expand control.',
    applies: () => true,
  },

  // Selection
  {
    id: 'selection-not-colour-only',
    category: 'Selection',
    requirement: 'A selected row or cell must be distinguishable from an unselected one without relying on colour alone.',
    why: 'WCAG 1.4.1 Use of Color (Level A).',
    typical: 'A checkbox in a selection column, alongside the row tint.',
    applies: (s) => s.selection !== 'none',
  },
  {
    id: 'selection-programmatic',
    category: 'Selection',
    requirement: 'Selected state must be exposed to assistive technology, not only shown visually.',
    why: 'WAI-ARIA aria-selected.',
    typical: 'aria-selected on the row or cell, paired with a checkbox (screen-reader support for aria-selected alone is inconsistent).',
    applies: (s) => s.selection !== 'none',
  },
  {
    id: 'selection-persistence',
    category: 'Selection',
    requirement: 'Selection state must remain correct when the view changes (scrolling, sorting, filtering, or paginating), or the change in scope must be made explicit.',
    why: 'Follows from the integrity of the selection model: acting on the wrong scope after a silent change is a real error class.',
    typical: 'Persist selection across pages; show a running count in the batch-action bar.',
    applies: (s) => s.selection === 'multi',
  },
  {
    id: 'selection-indeterminate',
    category: 'Selection',
    requirement: 'When some but not all rows are selected, the select-all control must show a third, indeterminate state distinct from checked and unchecked.',
    why: 'WAI-ARIA aria-checked="mixed"; confirmed in Carbon Design System’s data table docs.',
    typical: 'A header checkbox rendered in the indeterminate state.',
    applies: (s) => s.selection === 'multi',
  },

  // Sorting
  {
    id: 'sort-discoverable',
    category: 'Sorting',
    requirement: 'A sortable column must be identifiable as such before the user interacts with it.',
    why: 'WCAG 1.4.1 plus general discoverability; convergent practice (Material Design, Carbon).',
    typical: 'A sort icon shown on hover/focus of the header.',
    applies: (s) => s.sorting !== 'none',
  },
  {
    id: 'sort-active-indicated',
    category: 'Sorting',
    requirement: 'The active sort column and its direction must be indicated both visually (not colour-only) and to assistive technology.',
    why: 'WAI-ARIA aria-sort, set on the sorted header only and moved when the sort changes.',
    typical: 'A directional arrow on the active column header, plus aria-sort on that th.',
    applies: (s) => s.sorting !== 'none',
  },
  {
    id: 'sort-survives-freeze',
    category: 'Sorting',
    requirement: 'The active-sort indication must remain perceivable when the sorted column is frozen or the grid scrolls horizontally.',
    why: 'The indicator is required information (WCAG 1.3.1/1.4.1); losing it on scroll defeats its purpose.',
    typical: 'Keep the arrow in the sticky header cell; verify aria-sort is still announced when the column is pinned.',
    applies: (s) => s.sorting !== 'none' && s.lockedColumns,
  },

  // Filtering
  {
    id: 'filter-indicated',
    category: 'Filtering',
    requirement: 'Users must be able to tell they’re viewing filtered data, not the full set.',
    why: 'NN/G, Data Tables: Four Major User Tasks.',
    typical: 'A persistent filter chip or summary, plus a visible result count.',
    applies: (s) => s.filtering !== 'none',
  },
  {
    id: 'filter-count-announced',
    category: 'Filtering',
    requirement: 'When filtering changes the visible row count without a page reload, the new count must be announced without moving focus.',
    why: 'WCAG 4.1.3 Status Messages (Level AA).',
    typical: 'A role="status" / aria-live="polite" region holding "X results," updated on filter.',
    applies: (s) => s.filtering !== 'none',
  },

  // Editing
  {
    id: 'edit-discoverable',
    category: 'Editing',
    requirement: 'Which cells are editable must be discoverable before the user attempts to edit, not by trial-and-error or hover alone.',
    why: 'WCAG 1.4.1 (not colour alone) and 1.3.1 (the relationship must be programmatic).',
    typical: 'A persistent affordance (visible field styling or an edit icon), not something revealed only on hover.',
    applies: (s) => s.editing !== 'none',
  },
  {
    id: 'edit-readonly-semantics',
    category: 'Editing',
    requirement: 'A field that’s present but not currently editable should use read-only semantics; a field that’s inoperable should use disabled semantics. The two aren’t interchangeable.',
    why: 'WAI-ARIA aria-readonly vs aria-disabled; prefer the native readonly attribute, since aria-readonly has weak screen-reader support (Adrian Roselli).',
    typical: 'Native readonly for view-but-copy cells; disabled for cells that can’t be acted on at all.',
    applies: (s) => s.editing !== 'none',
  },
  {
    id: 'edit-error-association',
    category: 'Editing',
    requirement: 'A validation error must be identified in text and programmatically tied to the field, not just placed visually nearby or shown by colour.',
    why: 'WCAG 3.3.1 Error Identification, 1.3.1, 4.1.3.',
    typical: 'aria-invalid="true" plus aria-describedby pointing to the visible error text.',
    applies: (s) => s.editing !== 'none',
  },

  // Structure
  {
    id: 'grouped-headers-programmatic',
    category: 'Structure',
    requirement: 'Grouped column headers must convey the parent/child relationship programmatically, not only through visual layout.',
    why: 'WCAG 1.3.1; W3C WAI multi-level header guidance (colspan + scope, or headers/id).',
    typical: 'A native table with colspan and scope="colgroup" on the parent header.',
    applies: (s) => s.groupedHeaders,
  },
  {
    id: 'locked-columns-boundary',
    category: 'Structure',
    requirement: 'The boundary between frozen and scrollable content must be perceivable, and freezing must not break row/column structure for assistive technology.',
    why: 'AG Grid’s own accessibility docs document that pinning renders cells in separate DOM containers, breaking screen-reader navigation into pinned regions and reporting incorrect row/column numbers (GitHub issue #9129).',
    typical: 'A visible divider or shadow at the freeze boundary, plus an option to unpin; test pinned columns with a screen reader.',
    applies: (s) => s.lockedColumns,
  },

  // Data overflow
  {
    id: 'row-detail-focus',
    category: 'Data overflow',
    requirement: 'When a drawer or modal opens to show overflow data, keyboard focus must move into it, and closing it must return focus to where it was triggered.',
    why: 'Standard focus-management requirement for any dialog-like overlay (WCAG 2.4.3 Focus Order).',
    typical: 'Move focus to the drawer/modal’s heading on open; return focus to the triggering row on close.',
    applies: (s) => s.rowDetail !== 'none',
  },

  // Actions
  {
    id: 'drag-reorder-alternative',
    category: 'Actions',
    requirement: 'Drag-to-reorder must have a single-pointer, non-drag alternative that achieves the same result.',
    why: 'WCAG 2.2 SC 2.5.7 Dragging Movements (Level AA).',
    typical: 'A "move up / move down" menu or buttons alongside the drag handle.',
    applies: (s) => s.dragReorder,
  },
  {
    id: 'bulk-action-scope',
    category: 'Actions',
    requirement: 'Before executing a bulk action, the scope (how many, and often which records) must be stated explicitly; irreversible actions need confirmation and ideally undo.',
    why: 'NN/G, Confirmation Dialogs Can Prevent User Errors: specificity in the confirmation is what prevents costly mistakes.',
    typical: 'A batch-action bar with a live selection count; a confirmation naming that count.',
    applies: (s) => s.actions === 'bulk',
  },

  // Data loading and behaviour
  {
    id: 'async-state-distinguishable',
    category: 'Data loading',
    requirement: 'A cell or row updating asynchronously must be visually distinguishable from a static one, and assistive technology must not be given a stale value mid-update.',
    why: 'WAI-ARIA aria-busy tells assistive technology to wait until the update completes before exposing content.',
    typical: 'aria-busy set true during the update and back to false when stable, paired with a visible spinner or skeleton.',
    applies: (s) => s.realTimeUpdates,
  },
  {
    id: 'infinite-scroll-position',
    category: 'Data loading',
    requirement: 'After an action, the user’s position must be preserved or recoverable, and newly-loaded content must be perceivable to keyboard and screen-reader users, not just mouse-scroll users.',
    why: 'Documented infinite-scroll accessibility failures: lost position on return, unbounded focus path, content not announced (Deque; WebAIM).',
    typical: 'A "Load more" button as the accessible variant, or a persistent "showing X of Y" indicator.',
    applies: (s) => s.loadStrategy === 'infiniteScroll' || s.loadStrategy === 'loadMore',
  },

  // Derived: cell-level keyboard interaction
  {
    id: 'cell-focus-visible',
    category: 'Keyboard interaction',
    requirement: 'The focused cell must have a visible focus indicator with sufficient contrast, and arrow-key navigation between cells must be explicitly managed (a grid has exactly one element in the page tab order).',
    why: 'WCAG 2.4.7 Focus Visible, 1.4.11 Non-text Contrast; WAI-ARIA APG Grid pattern (roving tabindex or aria-activedescendant).',
    typical: 'A 2px+ outline meeting 3:1 contrast on :focus-visible, plus roving tabindex.',
    applies: (s, d) => d.cellLevelInteraction,
  },

  // Derived: virtualisation
  {
    id: 'virtualised-row-count',
    category: 'Data loading',
    requirement: 'Where not all rows are in the DOM (virtualised or server-paged), the grid must expose the true total and each cell’s real position to assistive technology.',
    why: 'WAI-ARIA APG Grid pattern, via aria-rowcount/aria-colcount and aria-rowindex/aria-colindex.',
    typical: 'Set aria-rowcount to the true row total, not just what’s rendered.',
    applies: (s, d) => d.virtualised,
  },

  // Typography
  {
    id: 'numeric-font-treatment',
    category: 'Data formatting',
    requirement: 'Numeric values need a font treatment that keeps every digit the same width, so figures line up down a column.',
    why: 'Proportional fonts vary digit width by default, which misaligns numbers in a column; tabular (fixed-width) figures are a font feature built to solve exactly this, available within the existing typeface rather than requiring a different one. A List Apart, "Designing Tables to be Read, Not Looked At" (Rutter), makes the same point about consistent numeric alignment supporting column scanning.',
    typical: 'font-variant-numeric: tabular-nums on numeric and currency columns.',
    applies: () => true,
  },

  // Item count
  {
    id: 'item-count-in-title',
    category: 'Data formatting',
    requirement: 'The table’s title or header area must show how many items are displayed. When a filter is active, it must show both the filtered count and the total, not just one or the other.',
    why: 'NN/G’s data table guidance calls for "a clear count of the number of items returned" as a baseline, and that expectation only gets more important once filtering can silently reduce what’s shown.',
    typical: 'A title reading "Claims (12)" normally, or "Claims (4 of 12)" once a filter narrows the result.',
    applies: () => true,
  },

  // Sorting default direction
  {
    id: 'sort-default-direction',
    category: 'Sorting',
    requirement: 'The first click on a sortable column must sort in the correct default direction for that column’s data type, not always ascending regardless of type: alphanumeric text sorts A to Z, numbers sort ascending (smallest first), and dates sort descending (most recent first).',
    why: 'These are the directions users already expect from the type of data itself; sorting a date column ascending on first click means the most relevant (most recent) rows are the ones pushed to the bottom, out of view.',
    typical: 'Branch the first-click direction on the column’s data type, rather than defaulting every column to ascending.',
    applies: (s) => s.sorting !== 'none',
  },

  // Export
  {
    id: 'export-loading-state',
    category: 'Data loading',
    requirement: 'A long-running export must show a distinct progress or loading state, not leave the trigger looking unresponsive, and must not block interaction with the rest of the page while it runs.',
    why: 'Same underlying requirement as any async update (WAI-ARIA aria-busy): the user needs to know the system registered the action and is working on it, without the interface appearing frozen.',
    typical: 'A spinner or progress state on the export control itself; disable the control while exporting rather than the whole page.',
    applies: (s) => s.exportFormat !== 'none',
  },

  // Refresh
  {
    id: 'refresh-preserves-state',
    category: 'Data loading',
    requirement: 'A manual refresh must preserve the user’s current state, active sort, active filters, selection, and scroll position, rather than silently resetting the view back to its defaults.',
    why: 'The same reasoning already established for pagination and infinite scroll: an action that changes the underlying data shouldn’t also throw away context the user has already set up, unless that’s explicitly what was asked for.',
    typical: 'Re-fetch and re-render in place; don’t reset sort, filter, or selection state as a side effect of the refresh itself.',
    applies: (s) => s.manualRefresh,
  },

  // Print
  {
    id: 'print-overflow-handling',
    category: 'Data loading',
    requirement: 'Printed output must not silently cut off content that only exists via horizontal scroll or sticky positioning on screen. Print needs its own layout, not a frozen snapshot of the on-screen scroll state.',
    why: 'CSS overflow and position: sticky are screen-scroll concepts; browsers don’t paginate or reflow them sensibly for print by default, which is why locked columns or wide tables commonly lose data at the print stage without a dedicated print stylesheet.',
    typical: 'A print-specific stylesheet that un-sticks pinned columns and lets the table flow naturally across the printed page width.',
    applies: (s) => s.printSupport,
  },

  // Stacked pair
  {
    id: 'stacked-pair-programmatic',
    category: 'Structure',
    requirement: 'A stacked pair of values must keep each value\u2019s association with its own header programmatically, not only visually, even though both values live in one merged cell.',
    why: 'WCAG 1.3.1. A sighted user reads which stacked value belongs to which stacked header purely by vertical position, but that spatial relationship needs an equivalent for anyone not perceiving the layout visually.',
    typical: 'A visually-hidden label on each stacked value naming its header, since one merged cell can\u2019t use the normal two-header/headers-id association a genuine two-column layout would.',
    applies: (s) => s.stackedValues,
  },
];

export function applicableStandards(selections, derived) {
  return standards.filter((entry) => entry.applies(selections, derived));
}
