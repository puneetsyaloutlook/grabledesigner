// Canonical selection key model.
// This is the code version of selection-key-model.md. That document explains
// the reasoning; this file is what the app actually reads. If the two drift
// apart, this file wins, and the doc should be updated to match.
//
// Every group below renders as a section of questions on the Features page.
// The `key` is what's used in the URL query string and in content tags on
// the Experience and Standards pages.

export const selectionSchema = [
  {
    group: 'Scale and layout',
    fields: [
      {
        key: 'layout',
        docLabel: 'Layout',
        type: 'single',
        question: 'Where does this sit on the page?',
        options: [
          { value: 'embedded', label: 'Embedded in a larger page', detail: 'Alongside other components, such as inside a tile or panel.' },
          { value: 'content', label: 'Full width, but not the only thing', detail: 'The primary component on the page, but the page can still scroll as a whole.' },
          { value: 'fills', label: 'Full width, fills the available space', detail: 'No page-level scroll. The table’s own rows are the only scrolling element.' },
        ],
      },
      {
        key: 'dataPoints',
        docLabel: 'Columns per row',
        type: 'single',
        question: 'How many data points should each row show?',
        options: [
          { value: 'low', label: 'Up to four' },
          { value: 'mid', label: 'Up to ten' },
          { value: 'high', label: 'More than ten' },
        ],
      },
      {
        key: 'rowVolume',
        docLabel: 'Row volume',
        type: 'single',
        question: 'Roughly how many rows will this hold?',
        options: [
          { value: 'small', label: 'A few hundred rows or fewer' },
          { value: 'large', label: 'More than that' },
        ],
      },
    ],
  },
  {
    group: 'Structure',
    fields: [
      { key: 'groupedHeaders', type: 'boolean', docLabel: 'Column grouping', docDescription: 'Required for one or more columns.', question: 'Do several separate columns belong under one shared group label?', detail: 'For example, actual, forecast, and variance as three separate columns under a shared "Q1" label, or total and urban counts as two columns under a shared "Population" label. Each column stays independent, it\u2019s the label above them that\u2019s shared.' },
      { key: 'stackedValues', type: 'boolean', docLabel: 'Stacked pair', docDescription: 'Required for one pair of columns.', question: 'Are two values genuinely meant to be read together, one directly above the other?', detail: 'For example, opening price above closing price, or when a claim was submitted above when it was last updated: the same kind of measurement, at two points, compared at a glance. Unlike column grouping, this becomes one column, not two, and there\u2019s no separate group label, the two headers are the whole story.' },
      { key: 'lockedColumns', type: 'boolean', docLabel: 'Locked columns', docDescription: 'Required, to keep key columns visible while the rest scrolls.', question: 'Do some columns need to stay visible while a user scrolls through the rest?', detail: 'For example, keeping a name or ID column in view while scanning wide data to the right.' },
      { key: 'resizableColumns', type: 'boolean', docLabel: 'Resizable columns', docDescription: 'Required.', question: 'Can columns be resized?' },
      { key: 'reorderableColumns', type: 'boolean', docLabel: 'Reorderable columns', docDescription: 'Required.', question: 'Can columns be reordered?' },
    ],
  },
  {
    group: 'Finding and comparing',
    fields: [
      {
        key: 'sorting',
        docLabel: 'Sorting',
        type: 'single',
        question: 'What sorting should this support?',
        options: [
          { value: 'none', label: 'None' },
          { value: 'single', label: 'One column at a time' },
          { value: 'multi', label: 'Multi-column sort' },
        ],
      },
      {
        key: 'filtering',
        docLabel: 'Filtering',
        type: 'single',
        question: 'What filtering should this support?',
        options: [
          { value: 'none', label: 'None' },
          { value: 'inline', label: 'Per-column filter controls' },
          { value: 'global', label: 'One global search bar' },
          { value: 'panel', label: 'A dedicated filter panel' },
        ],
      },
    ],
  },
  {
    group: 'Selection and action',
    fields: [
      {
        key: 'selection',
        docLabel: 'Row selection',
        type: 'single',
        question: 'What row selection should this support?',
        options: [
          { value: 'none', label: 'None' },
          { value: 'single', label: 'One row at a time' },
          { value: 'multi', label: 'Multi-row, with select-all' },
        ],
      },
      {
        key: 'actions',
        docLabel: 'Row actions',
        type: 'single',
        question: 'What actions should a row support?',
        options: [
          { value: 'none', label: 'None' },
          { value: 'single', label: 'One action per row' },
          { value: 'multiple', label: 'Several actions per row' },
          { value: 'bulk', label: 'Bulk actions on a selection' },
        ],
      },
      { key: 'dragReorder', type: 'boolean', docLabel: 'Row order control', docDescription: 'Required, so row order is user-controlled rather than derived from sorting.', question: 'Does the order of rows carry meaning that users need to set themselves?', detail: 'For example, a manually ranked priority list or a playlist, not just sorting by a column’s value.' },
    ],
  },
  {
    group: 'Data overflow',
    fields: [
      {
        key: 'rowDetail',
        docLabel: 'Row detail',
        type: 'single',
        question: 'How does a user see data that doesn\u2019t fit in the row?',
        detail: 'This is read-only overflow, separate from editing. A row can carry more data than fits, without any of it being editable.',
        options: [
          { value: 'none', label: 'None' },
          { value: 'drawer', label: 'A drawer, opening directly under the row' },
          { value: 'modal', label: 'A modal' },
          { value: 'panel', label: 'A side panel, anchored to the browser edge' },
          { value: 'containedPanel', label: 'A side panel, anchored to the grid\u2019s own edge' },
        ],
      },
    ],
  },
  {
    group: 'Editing',
    fields: [
      {
        key: 'editing',
        docLabel: 'Editing',
        type: 'single',
        question: 'What editing should this support?',
        options: [
          { value: 'none', label: 'None' },
          { value: 'inline', label: 'Edit in place' },
          { value: 'viaDetail', label: 'Edited through the row detail view', requires: { rowDetail: ['drawer', 'modal', 'panel', 'containedPanel'] } },
        ],
      },
    ],
  },
  {
    group: 'Data loading and behaviour',
    fields: [
      {
        key: 'loadStrategy',
        docLabel: 'Data loading',
        type: 'single',
        question: 'How does data load?',
        options: [
          { value: 'pagination', label: 'Pagination' },
          { value: 'loadMore', label: 'A "load more" button' },
          { value: 'infiniteScroll', label: 'Infinite scroll' },
        ],
      },
      { key: 'realTimeUpdates', type: 'boolean', docLabel: 'Real-time updates', docDescription: 'Required, so cells or rows can update after the initial page load.', question: 'Can cells or rows update on their own after the page has loaded?' },
      { key: 'manualRefresh', type: 'boolean', docLabel: 'Manual refresh', docDescription: 'Required, so users can reload the data without leaving the page.', question: 'Can users manually refresh the data?' },
    ],
  },
  {
    group: 'Density and responsive',
    fields: [
      {
        key: 'density',
        docLabel: 'Density',
        type: 'single',
        question: 'What row density should this use?',
        options: [
          { value: 'compact', label: 'Compact' },
          { value: 'default', label: 'Default' },
          { value: 'spacious', label: 'Spacious' },
        ],
      },
      {
        key: 'responsiveBehaviour',
        docLabel: 'Responsive behaviour',
        type: 'single',
        question: 'How should this behave on a narrow screen?',
        options: [
          { value: 'horizontalScroll', label: 'Scroll horizontally' },
          { value: 'cardStack', label: 'Collapse into cards' },
          { value: 'columnPriority', label: 'Drop lower-priority columns first' },
        ],
      },
    ],
  },
  {
    group: 'Summary',
    fields: [
      { key: 'rowGrouping', type: 'boolean', docLabel: 'Row grouping', docDescription: 'Required, so rows are grouped by a shared attribute.', question: 'Do rows need to be grouped by a shared attribute so users can scan by category?', detail: 'For example, grouping transactions by account, or tickets by status.' },
      {
        key: 'totals',
        docLabel: 'Totals',
        type: 'single',
        question: 'What totals should this show?',
        options: [
          { value: 'none', label: 'None' },
          { value: 'grand', label: 'One grand total' },
          { value: 'perGroup', label: 'A subtotal per group', requires: { rowGrouping: [true] } },
          { value: 'both', label: 'Both' },
        ],
      },
    ],
  },
  {
    group: 'Export and print',
    fields: [
      {
        key: 'exportFormat',
        docLabel: 'Export',
        type: 'single',
        question: 'What export or download does this need?',
        options: [
          { value: 'none', label: 'None' },
          { value: 'screen', label: 'A generic download, no format choice' },
          { value: 'csv', label: 'Export as CSV' },
          { value: 'excel', label: 'Export as Excel' },
          { value: 'pdf', label: 'Export as PDF' },
        ],
      },
      { key: 'printSupport', type: 'boolean', docLabel: 'Print support', docDescription: 'Required, so the table can be printed directly from the browser.', question: 'Does this need to be printable?' },
    ],
  },
  {
    group: 'Footer and legend',
    fields: [
      { key: 'legend', type: 'boolean', docLabel: 'Legend', docDescription: 'Required, to explain what a colour coding means.', question: 'Does this need a legend explaining what a colour or icon coding means?', detail: 'Turns on a colour indicator for status, in addition to the text that\u2019s already there, and a key in the footer explaining what each colour means. Without the key, an unexplained colour is decoration, not information.' },
      { key: 'footnote', type: 'boolean', docLabel: 'Footnote', docDescription: 'Required, disclaiming a specific value.', question: 'Does a specific value need a disclaimer or caveat attached, the way an asterisk points to an explanation?', detail: 'A footer is content about the data, not information about the grid itself: a caveat on one figure ("restated," "unaudited," "no payout"), not a restated row count or anything else that\u2019s really about the table rather than what\u2019s in it.' },
    ],
  },
];

// Derived flags: computed from the answers above, never asked directly.
// See selection-key-model.md, "Derived flags" section, for the reasoning.
export function computeDerivedFlags(selections) {
  const cellLevelInteraction =
    selections.selection === 'single' ||
    selections.selection === 'multi' ||
    selections.editing === 'inline';

  const virtualised =
    selections.rowVolume === 'large' ||
    (selections.dataPoints === 'high' && selections.loadStrategy !== 'pagination');

  return { cellLevelInteraction, virtualised };
}

export function defaultSelections() {
  const defaults = {};
  selectionSchema.forEach((group) => {
    group.fields.forEach((field) => {
      if (field.type === 'boolean') {
        defaults[field.key] = false;
      } else {
        defaults[field.key] = field.options[0].value;
      }
    });
  });
  return defaults;
}
