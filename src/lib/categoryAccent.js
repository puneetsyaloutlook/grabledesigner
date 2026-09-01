// Maps each standards category to an accent colour, drawn from the existing
// ramps rather than inventing new hex values. Used as a left-edge accent on
// requirement cards so category is scannable at a glance, not just labelled.
export const categoryAccent = {
  'Selection': 'var(--teal-700)',
  'Sorting': 'var(--blue-700)',
  'Filtering': 'var(--blue-700)',
  'Editing': 'var(--warm-700)',
  'Structure': 'var(--neutral-700)',
  'Data formatting': 'var(--color-primary)',
  'Actions': 'var(--warm-700)',
  'Data loading': 'var(--blue-900)',
  'Keyboard interaction': 'var(--color-action)',
};

export function accentFor(category) {
  return categoryAccent[category] || 'var(--neutral-300)';
}
