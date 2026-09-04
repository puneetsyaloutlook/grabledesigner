// Real systems relevant to the current selections, not a fixed list shown
// regardless of configuration. Same applies(selections, derived) pattern as
// standards.js and decisions.js. Sourced from the structural and atomic
// component pattern research already gathered for this project, not
// asserted fresh here.

export const referenceSystems = [
  {
    id: 'ag-grid',
    name: 'AG Grid',
    summary: 'The most fully-featured option for advanced grid behaviour: virtualisation, column groups, pinning, and enterprise-scale interaction all in one library.',
    pros: [
      'Handles virtualisation, grouped columns, pinned columns, and fill-handle-style editing out of the box',
      'The most mature option specifically for very large datasets',
    ],
    cons: [
      'Built from divs, not a native table, so pinned and grouped regions have documented screen-reader gaps',
      'The richest features (fill handle, enterprise row models) sit behind a paid tier',
    ],
    applies: (s, d) => s.sorting === 'multi' || s.lockedColumns || s.dragReorder || s.groupedHeaders || d.virtualised || s.totals !== 'none',
  },
  {
    id: 'ant-design',
    name: 'Ant Design',
    summary: 'A widely-used open-source table component with straightforward sticky-positioned pinning and a controlled sort/filter API.',
    pros: [
      'Pinning is implemented with plain CSS sticky positioning, simple to reason about and extend',
      'Sort and filter state are fully controlled, easy to wire up to external state',
    ],
    cons: [
      'Horizontal-scroll affordance relies on a shadow that’s a known, documented discoverability weakness',
      'No first-party support for grouped-header pin behaviour beyond basic column groups',
    ],
    applies: (s) => s.lockedColumns || s.groupedHeaders || s.sorting !== 'none' || s.filtering !== 'none',
  },
  {
    id: 'carbon',
    name: 'IBM Carbon',
    summary: 'Strong, concrete guidance on density and batch-action toolbars, though it deprecated its own opinionated grid in favour of a headless approach.',
    pros: [
      'Clear split between user-facing density preferences and designer-set ones',
      'Specific, actionable toolbar guidance for batch actions, including a stated icon limit',
    ],
    cons: [
      'Carbon dropped its own richer Datagrid component, so out-of-the-box grid features are thinner than AG Grid or Ant Design',
    ],
    applies: (s) => s.density !== 'default' || s.actions === 'bulk' || s.rowDetail === 'drawer',
  },
  {
    id: 'salesforce-lightning',
    name: 'Salesforce Lightning (lightning-datatable)',
    summary: 'A well-documented convention for showing which cells are locked, with sensible defaults for column sizing.',
    pros: [
      'A specific, named icon convention for read-only cells that’s easy to copy directly',
      'Documented default and maximum column widths, rather than leaving sizing undefined',
    ],
    cons: [
      'Explicitly not supported on mobile devices',
    ],
    applies: (s) => s.editing !== 'none' || s.resizableColumns,
  },
  {
    id: 'vmware-clarity',
    name: 'VMware Clarity',
    summary: 'The clearest documented lesson against nesting datagrids inside datagrids, in favour of a detail-pane pattern.',
    pros: [
      'A named, hard-won failure mode (hierarchical datagrids) with a documented alternative, not just a feature list',
    ],
    cons: [
      'Less widely adopted outside VMware’s own ecosystem than AG Grid or Ant Design',
    ],
    applies: (s) => s.rowDetail !== 'none' || s.dataPoints === 'high',
  },
  {
    id: 'wai-aria-apg',
    name: 'W3C WAI-ARIA APG (grid pattern)',
    summary: 'Not a component library, but the underlying specification for how a static table becomes an interactive grid, and the accessibility baseline every other option in this list sits on top of.',
    pros: [
      'The most standards-aligned articulation of static table versus interactive grid, and the source of the roving-tabindex keyboard model',
    ],
    cons: [
      'A specification, not a drop-in component: implementing it correctly is still work',
    ],
    applies: (s, d) => d.cellLevelInteraction,
  },
  {
    id: 'devextreme',
    name: 'DevExtreme',
    summary: 'Built-in state persistence across sessions, and native support for banded (grouped) columns.',
    pros: [
      'stateStoring persists column state to localStorage, sessionStorage, or a custom backend without extra plumbing',
      'Banded columns are a first-party feature, not a workaround',
    ],
    cons: [
      'Less common outside enterprise .NET-adjacent contexts than AG Grid or Ant Design',
    ],
    applies: (s) => s.groupedHeaders || s.loadStrategy !== 'pagination',
  },
  {
    id: 'patternfly',
    name: 'PatternFly',
    summary: 'Precise guidance distinguishing loading-state types and empty-state types, which most other systems leave to individual teams to figure out.',
    pros: [
      'Explicit rule for when to use a skeleton versus a spinner, based on whether the shape of the data is known',
      'Separate, named guidance for a first-use empty state versus a filtered-to-nothing empty state',
    ],
    cons: [
      'Primarily oriented around Red Hat and OpenShift contexts, less general-purpose adoption than AG Grid or Ant Design',
    ],
    applies: (s) => s.realTimeUpdates || s.filtering !== 'none',
  },
];

export function applicableReferences(selections, derived) {
  return referenceSystems.filter((entry) => entry.applies(selections, derived));
}
