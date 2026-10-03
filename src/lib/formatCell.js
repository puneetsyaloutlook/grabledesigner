// Shared cell-formatting helpers, used by both the desktop demo table and
// the mobile four-corners simulation, so the two can't drift into two
// different ideas of how a date or an amount should look.

// The Intl API's own 'short' month format isn't reliably 3 characters:
// en-AU and en-GB give September as "Sept" (4 chars) while every other
// month is 3, a real British/Australian convention, not a bug, but it
// breaks the uniform width a table column needs. An explicit list
// sidesteps relying on any locale's own abbreviation data for this.
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso) {
  if (!iso) return '–';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatAsOf(date) {
  const datePart = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  const timePart = date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' });
  return `${datePart}, ${timePart}`;
}

// Negative-number-format decision: leading minus sign. Empty/NA/zero decision:
// en dash for not-applicable, "0" written out for a genuine zero.
export function formatAmount(value) {
  if (value === null || value === undefined) return '–';
  if (value === 0) return '$0';
  const abs = Math.abs(value).toLocaleString();
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '–';
  if (value === 0) return '0';
  return value < 0 ? `-${Math.abs(value)}` : `${value}`;
}

export function formatCell(column, value) {
  if (value === null || value === undefined || value === '') return '–';
  if (column.type === 'currency') return formatAmount(value);
  if (column.type === 'number') return formatNumber(value);
  if (column.type === 'date') return formatDate(value);
  return String(value);
}

// Numeric columns read right-aligned, text columns left-aligned. Shared so
// the mobile four-corners view can place numeric fields in the right-hand
// corners and align them the same way the desktop table does.
export function alignFor(column) {
  return column.type === 'currency' || column.type === 'number' ? 'right' : 'left';
}

// Numeric/alphanumeric font-treatment standard: numeric columns get tabular
// figures so digits align down the column; ID/code-shaped columns get a
// monospace font so mixed letters and numbers stay predictable to scan.
export function fontStyleFor(column) {
  if (column.type === 'currency' || column.type === 'number') {
    return { fontVariantNumeric: 'tabular-nums' };
  }
  if (column.mono) {
    return { fontFamily: 'var(--font-mono)' };
  }
  return {};
}

// Color-not-sole-indicator standard: each status maps to a semantic tone,
// but the coloured dot only ever sits next to the existing text, it never
// replaces it. Open and In review read as active/pending states rather
// than a success or failure, so they map to info and warning respectively,
// not the green/red pair that would overstate a routine, ongoing claim as
// good or bad news.
export const STATUS_TONE = {
  Open: 'info',
  'In review': 'warning',
  Approved: 'success',
  Closed: 'neutral',
};

// Sort-default-direction standard: the first click sorts in the direction
// that's actually the useful default for that data type, not always
// ascending regardless of what the column holds. Shared so the desktop
// table and the mobile headers box sort identically on first click.
export function defaultDirFor(column) {
  return column?.type === 'date' ? 'desc' : 'asc';
}
