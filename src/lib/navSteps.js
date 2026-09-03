// The four sequential steps, shared between the sidebar nav and the Home
// page so their label/detail text can't drift apart into two versions of
// the same thing. Framework is deliberately not in this list, it isn't one
// of the steps, and is handled separately wherever it's needed.

export const STEPS = [
  { to: '/features', label: 'Features needed', detail: 'What functionality do you need for the data display?', end: true },
  { to: '/standards', label: 'Applicable standards', detail: 'Based on that functionality, which UX standards apply?' },
  { to: '/experience', label: 'Experience', detail: 'A quick demo of how those functions and standards look in the UI.' },
  { to: '/documentation', label: 'Documentation', detail: 'The net result: what to actually build, and why.' },
];

export const FRAMEWORK_ITEM = {
  to: '/framework',
  label: 'Framework',
  detail: 'The bigger picture this tool’s work sits inside.',
  separate: true,
};
