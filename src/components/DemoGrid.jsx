import { Fragment, useEffect, useState } from 'react';
import { ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, ArrowUp, ArrowDown, GripVertical, RefreshCw, Download, Printer, Filter, MoreHorizontal } from 'lucide-react';
import { sampleColumns, sampleRows } from '../lib/sampleData';
import Drawer from './Drawer';

const TIER_ORDER = { low: 0, mid: 1, high: 2 };
const DETAIL_COL_WIDTH = 40;

// Grouped-headers decision: Region and Channel are genuinely sub-values of
// one broader "where/how this claim came in" question, and they're adjacent
// in column order, so a group can only form (and only should) when both are
// visible together. If only one is visible at a lower data-points tier, it
// just renders as a normal ungrouped column. A group split apart isn't
// rendered as a broken group, it's just not a group.
const GROUPS = [{ label: 'Origin', keys: ['region', 'channel'] }];

// Stacked-pair decision: Submitted and Updated are the same kind of
// measurement (a date) at two points, genuinely meant to be compared, not
// two unrelated columns that happen to share a header. Unlike a group,
// there's no label spanning them, the two stacked headers are the whole
// story, and the pair only forms once both are visible together.
const PAIRS = [{ keys: ['submitted', 'updated'] }];

// The Intl API's own 'short' month format isn't reliably 3 characters:
// en-AU and en-GB give September as "Sept" (4 chars) while every other
// month is 3, a real British/Australian convention, not a bug, but it
// breaks the uniform width a table column needs. An explicit list
// sidesteps relying on any locale's own abbreviation data for this.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso) {
  if (!iso) return '–';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatAsOf(date) {
  const datePart = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  const timePart = date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' });
  return `${datePart}, ${timePart}`;
}

// Negative-number-format decision: leading minus sign. Empty/NA/zero decision:
// en dash for not-applicable, "0" written out for a genuine zero.
function formatAmount(value) {
  if (value === null || value === undefined) return '–';
  if (value === 0) return '$0';
  const abs = Math.abs(value).toLocaleString();
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

function formatNumber(value) {
  if (value === null || value === undefined) return '–';
  if (value === 0) return '0';
  return value < 0 ? `-${Math.abs(value)}` : `${value}`;
}

function formatCell(column, value) {
  if (value === null || value === undefined || value === '') return '–';
  if (column.type === 'currency') return formatAmount(value);
  if (column.type === 'number') return formatNumber(value);
  if (column.type === 'date') return formatDate(value);
  return String(value);
}

// Color-not-sole-indicator standard: each status maps to a semantic tone,
// but the coloured dot only ever sits next to the existing text, it never
// replaces it. Open and In review read as active/pending states rather
// than a success or failure, so they map to info and warning respectively,
// not the green/red pair that would overstate a routine, ongoing claim as
// good or bad news.
const STATUS_TONE = {
  Open: 'info',
  'In review': 'warning',
  Approved: 'success',
  Closed: 'neutral',
};

function StatusIndicator({ value }) {
  const tone = STATUS_TONE[value];
  if (!tone) return null;
  return <span className={`status-dot status-dot-${tone}`} aria-hidden="true" />;
}

// Numeric/alphanumeric font-treatment standard: numeric columns get tabular
// figures so digits align down the column; ID/code-shaped columns get a
// monospace font so mixed letters and numbers stay predictable to scan.
function fontStyleFor(column) {
  if (column.type === 'currency' || column.type === 'number') {
    return { fontVariantNumeric: 'tabular-nums' };
  }
  if (column.mono) {
    return { fontFamily: 'var(--font-mono)' };
  }
  return {};
}

// Sort-default-direction standard: the first click sorts in the direction
// that's actually the useful default for that data type, not always
// ascending regardless of what the column holds.
function defaultDirFor(column) {
  return column?.type === 'date' ? 'desc' : 'asc';
}

// Truncation-reveal decision: tooltip on hover AND keyboard focus, not
// native title (which fails keyboard users outright).
function TruncatedCell({ text }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <span
      className="truncate-cell"
      tabIndex={0}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onFocus={() => setShowTip(true)}
      onBlur={() => setShowTip(false)}
    >
      {text}
      {showTip && <span className="truncate-tooltip" role="tooltip">{text}</span>}
    </span>
  );
}

export default function DemoGrid({ selections, derived }) {
  const [rows, setRows] = useState(sampleRows);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [flaggedIds, setFlaggedIds] = useState(new Set());
  const [sortChain, setSortChain] = useState([]); // [{ key, dir }]
  const [columnOrder, setColumnOrder] = useState(null); // array of keys, or null = natural order
  const [draggedKey, setDraggedKey] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { rowId, key }
  const [editValues, setEditValues] = useState({}); // `${rowId}:${key}` -> value
  const [modalRowId, setModalRowId] = useState(null);
  const [openPanelRowId, setOpenPanelRowId] = useState(null); // one at a time, for whichever of panel / containedPanel is active
  const [expandedIds, setExpandedIds] = useState(new Set()); // many at a time
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [filterUIOpen, setFilterUIOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => new Date());

  // realTimeUpdates decision: simulate one row updating asynchronously,
  // aria-busy while in progress rather than swapping the value silently.
  useEffect(() => {
    if (!selections.realTimeUpdates) return;
    const targetId = sampleRows[0].id;
    const start = setTimeout(() => setUpdatingRowId(targetId), 1200);
    const finish = setTimeout(() => {
      setRows((prev) => prev.map((r) => (r.id === targetId ? { ...r, status: 'Approved' } : r)));
      setUpdatingRowId(null);
      setLastUpdatedAt(new Date());
    }, 3200);
    return () => { clearTimeout(start); clearTimeout(finish); };
  }, [selections.realTimeUpdates]);

  const tierCap = TIER_ORDER[selections.dataPoints] ?? 0;
  const columns = sampleColumns.filter((c) => TIER_ORDER[c.tier] <= tierCap);

  const activeGroups = selections.groupedHeaders
    ? GROUPS.filter((g) => g.keys.every((k) => columns.some((c) => c.key === k)))
    : [];
  function groupFor(key) {
    return activeGroups.find((g) => g.keys.includes(key));
  }

  const activePairs = selections.stackedValues
    ? PAIRS.filter((p) => p.keys.every((k) => columns.some((c) => c.key === k)))
    : [];
  function pairFor(key) {
    return activePairs.find((p) => p.keys.includes(key));
  }

  // Reorderable-columns: a stored key order, ignored (falls back to natural
  // order) if the visible column set has changed since it was set, e.g. the
  // data-points tier changed. Grouped or paired columns can't be moved and
  // nothing can be moved past them, so neither a group's nor a pair's
  // contiguity can ever be broken by reordering.
  const naturalKeys = columns.map((c) => c.key);
  const orderedColumns = (() => {
    if (!columnOrder) return columns;
    const sameSet = columnOrder.length === naturalKeys.length && columnOrder.every((k) => naturalKeys.includes(k));
    if (!sameSet) return columns;
    return columnOrder.map((k) => columns.find((c) => c.key === k));
  })();
  const orderedKeys = orderedColumns.map((c) => c.key);

  function moveColumnTo(fromKey, toKey) {
    if (fromKey === toKey) return;
    if (groupFor(fromKey) || groupFor(toKey) || pairFor(fromKey) || pairFor(toKey)) return;
    const keys = [...orderedKeys];
    const from = keys.indexOf(fromKey);
    const to = keys.indexOf(toKey);
    keys.splice(from, 1);
    keys.splice(to, 0, fromKey);
    setColumnOrder(keys);
  }

  function moveColumnStep(key, direction) {
    const idx = orderedKeys.indexOf(key);
    const swapWith = idx + direction;
    if (swapWith < 0 || swapWith >= orderedKeys.length) return;
    if (groupFor(orderedKeys[idx]) || groupFor(orderedKeys[swapWith]) || pairFor(orderedKeys[idx]) || pairFor(orderedKeys[swapWith])) return;
    const next = [...orderedKeys];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    setColumnOrder(next);
  }

  const bulkMode = selections.actions === 'bulk';
  const canSelect = selections.selection !== 'none';
  const hasDetailCol = selections.rowDetail !== 'none';
  const hasActionsCol = selections.actions !== 'none' && selections.actions !== 'bulk';
  const lockedColLeft = hasDetailCol ? DETAIL_COL_WIDTH : 0;

  function cellValue(row, column) {
    const override = editValues[`${row.id}:${column.key}`];
    return override !== undefined ? override : row[column.key];
  }

  // Filtering: genuinely filters the visible rows, not just a decorative
  // input. 'global' matches the query against every visible column;
  // 'inline' and 'panel' filter per column, 'panel' just hides the controls
  // behind a toggle rather than showing them by default.
  const filteredRows = rows.filter((row) => {
    if (selections.filtering === 'global' && filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      return columns.some((col) => String(formatCell(col, cellValue(row, col))).toLowerCase().includes(q));
    }
    if (selections.filtering === 'inline' || selections.filtering === 'panel') {
      return Object.entries(columnFilters).every(([key, val]) => {
        if (!val || !val.trim()) return true;
        const col = columns.find((c) => c.key === key);
        if (!col) return true;
        return String(formatCell(col, cellValue(row, col))).toLowerCase().includes(val.trim().toLowerCase());
      });
    }
    return true;
  });

  function toggleSort(key) {
    const col = columns.find((c) => c.key === key);
    if (selections.sorting === 'single') {
      setSortChain((prev) => {
        const current = prev[0];
        if (!current || current.key !== key) return [{ key, dir: defaultDirFor(col) }];
        if (current.dir === 'asc') return [{ key, dir: 'desc' }];
        return [];
      });
    } else if (selections.sorting === 'multi') {
      setSortChain((prev) => {
        const idx = prev.findIndex((s) => s.key === key);
        if (idx === -1) return [...prev, { key, dir: defaultDirFor(col) }];
        if (prev[idx].dir === 'asc') {
          const next = [...prev];
          next[idx] = { key, dir: 'desc' };
          return next;
        }
        return prev.filter((s) => s.key !== key);
      });
    }
  }

  const sortedRows = [...filteredRows].sort((a, b) => {
    for (const { key, dir } of sortChain) {
      const col = columns.find((c) => c.key === key);
      let av = a[key];
      let bv = b[key];
      if (col?.type === 'currency' || col?.type === 'number') {
        av = av ?? -Infinity;
        bv = bv ?? -Infinity;
      } else {
        av = (av ?? '').toString();
        bv = (bv ?? '').toString();
      }
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
    }
    return 0;
  });

  function toggleRowSelected(id) {
    setSelectedIds((prev) => {
      const next = new Set(selections.selection === 'multi' ? prev : []);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Select-all operates on what's currently visible (filtered), not every
  // row in the dataset regardless of filter.
  const allSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map((r) => r.id)));
    }
  }

  function moveRow(id, direction) {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const swapWith = idx + direction;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  }

  function toggleFlag(id) {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Refresh-preserves-state standard: this deliberately touches nothing
  // except its own loading flag. Sort, filters, and selection are untouched
  // state elsewhere in this component, so "preserving" them isn't an extra
  // step, it's just not writing code that would clear them.
  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdatedAt(new Date());
    }, 900);
  }

  // Export-scope decision: exports sortedRows (the current filtered and
  // sorted view) using orderedColumns (the current column order), not the
  // raw underlying dataset. A real xlsx or pdf library isn't part of this
  // project's dependencies, so every format produces a genuine CSV file
  // rather than a mislabelled fake binary; the format selection still
  // demonstrates which schema choice is in effect, the file itself is
  // honest about what it actually is.
  function handleExport() {
    setIsExporting(true);
    const escapeCsv = (value) => {
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const header = orderedColumns.map((c) => escapeCsv(c.label)).join(',');
    const csvRows = sortedRows.map((row) =>
      orderedColumns.map((col) => escapeCsv(formatCell(col, cellValue(row, col)))).join(',')
    );
    const csv = [header, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'claims-export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 400);
  }

  function commitEdit(rowId, key, value) {
    setEditValues((prev) => ({ ...prev, [`${rowId}:${key}`]: value }));
    setEditingCell(null);
  }

  function toggleDetail(rowId) {
    if (selections.rowDetail === 'drawer') {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.has(rowId) ? next.delete(rowId) : next.add(rowId);
        return next;
      });
    } else if (selections.rowDetail === 'panel' || selections.rowDetail === 'containedPanel') {
      // Single-open: opening a new row's panel closes whichever was open.
      setOpenPanelRowId((prev) => (prev === rowId ? null : rowId));
    } else if (selections.rowDetail === 'modal') {
      setModalRowId(rowId);
    }
  }

  const modalRow = rows.find((r) => r.id === modalRowId);
  const panelRow = rows.find((r) => r.id === openPanelRowId);

  function sortCaret(col) {
    if (selections.sorting === 'none') return null;
    const sortEntry = sortChain.find((s) => s.key === col.key);
    if (!sortEntry) {
      return (
        <span className="sort-caret sort-caret-inactive" aria-hidden="true">
          <ChevronsUpDown size={14} />
        </span>
      );
    }
    return (
      <span className="sort-caret sort-caret-active" aria-hidden="true">
        {sortEntry.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </span>
    );
  }

  // Shared between the flat single-row header and the grouped two-row header
  // so the sort button / drag handle / label markup only exists once.
  function headerCellContent(col) {
    const sortEntry = sortChain.find((s) => s.key === col.key);
    const sortIndex = sortChain.findIndex((s) => s.key === col.key);
    const sortable = selections.sorting !== 'none';
    const isGrouped = Boolean(groupFor(col.key)) || Boolean(pairFor(col.key));
    const canReorder = selections.reorderableColumns && !isGrouped;
    // Right-aligned columns (numeric/currency) need the label text itself
    // flush against the right edge, matching the values below it. Without
    // this, the sort caret sitting after the label in DOM order is what
    // ends up flush right instead, leaving the label visibly short of
    // where the numbers actually line up.
    const align = col.type === 'currency' || col.type === 'number' ? 'right' : 'left';
    const flexDirection = align === 'right' ? 'row-reverse' : 'row';

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', flexDirection }}>
        {sortable ? (
          <button
            type="button"
            className={`sort-header${sortEntry ? ' sort-header-active' : ''}`}
            style={{ flexDirection }}
            onClick={() => toggleSort(col.key)}
          >
            {col.label}
            {sortCaret(col)}
            {sortEntry && selections.sorting === 'multi' && sortChain.length > 1 && (
              <span className="sort-priority">{sortIndex + 1}</span>
            )}
          </button>
        ) : (
          col.label
        )}
        {canReorder && (
          <span
            className="col-drag-handle"
            role="button"
            tabIndex={0}
            aria-label={`Drag to reorder ${col.label}, or use the arrow keys`}
            draggable
            onDragStart={() => setDraggedKey(col.key)}
            onDragEnd={() => { setDraggedKey(null); setDragOverKey(null); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') { e.preventDefault(); moveColumnStep(col.key, -1); }
              if (e.key === 'ArrowRight') { e.preventDefault(); moveColumnStep(col.key, 1); }
            }}
          >
            <GripVertical size={14} />
          </span>
        )}
      </span>
    );
  }

  function headerAriaSort(col) {
    const sortEntry = sortChain.find((s) => s.key === col.key);
    const sortable = selections.sorting !== 'none';
    return sortEntry ? (sortEntry.dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined;
  }

  function headerDragProps(col) {
    if (!selections.reorderableColumns || groupFor(col.key) || pairFor(col.key)) return {};
    return {
      onDragOver: (e) => { e.preventDefault(); setDragOverKey(col.key); },
      onDragLeave: () => setDragOverKey((k) => (k === col.key ? null : k)),
      onDrop: (e) => {
        e.preventDefault();
        if (draggedKey) moveColumnTo(draggedKey, col.key);
        setDraggedKey(null);
        setDragOverKey(null);
      },
    };
  }

  const totalColSpan =
    (hasDetailCol ? 1 : 0) +
    (canSelect ? 1 : 0) +
    (selections.dragReorder ? 1 : 0) +
    orderedColumns.length +
    (hasActionsCol ? 1 : 0);

  function DetailContent({ row }) {
    return (
      <div className="expand-content">
        {sampleColumns.filter((c) => !columns.includes(c)).map((c) => (
          <div key={c.key}><strong>{c.label}:</strong> {formatCell(c, row[c.key])}</div>
        ))}
        {sampleColumns.filter((c) => !columns.includes(c)).length === 0 && (
          <div>{row.notes}</div>
        )}
      </div>
    );
  }

  // Shared row-rendering so the flat case and the grouped case use the same
  // markup rather than two copies drifting apart.
  function renderDataRow(row) {
    const isSelected = selectedIds.has(row.id);
    const isFlagged = flaggedIds.has(row.id);
    const isExpanded = expandedIds.has(row.id);
    const isPanelOpen = openPanelRowId === row.id;
    const isUpdating = updatingRowId === row.id;
    const showInlineDetail = selections.rowDetail === 'drawer' && isExpanded;
    const isOverlayVariant = selections.rowDetail === 'modal' || selections.rowDetail === 'panel' || selections.rowDetail === 'containedPanel';
    const isOverlayOpen = selections.rowDetail === 'modal' ? modalRowId === row.id : isPanelOpen;

    return (
      <Fragment key={row.id}>
        <tr className={isSelected ? 'row-selected' : undefined} aria-busy={isUpdating || undefined}>
          {hasDetailCol && (
            <td className="detail-col">
              <button
                type="button"
                className={`icon-button detail-toggle${isOverlayVariant ? ' detail-toggle-more' : ''}`}
                aria-expanded={isOverlayVariant ? isOverlayOpen : showInlineDetail}
                aria-haspopup={isOverlayVariant ? 'dialog' : undefined}
                aria-label={`${(isOverlayVariant ? isOverlayOpen : showInlineDetail) ? 'Hide' : 'Show'} details for ${row.id}`}
                onClick={() => toggleDetail(row.id)}
              >
                {isOverlayVariant ? <MoreHorizontal size={14} /> : <ChevronRight size={14} />}
              </button>
            </td>
          )}
          {canSelect && (
            <td className="select-col">
              <input
                type={selections.selection === 'multi' ? 'checkbox' : 'radio'}
                checked={isSelected}
                onChange={() => toggleRowSelected(row.id)}
                aria-label={`Select ${row.id}`}
              />
            </td>
          )}
          {selections.dragReorder && (
            <td className="reorder-col">
              <button type="button" className="reorder-btn" onClick={() => moveRow(row.id, -1)} aria-label={`Move ${row.id} up`}><ArrowUp size={14} /></button>
              <button type="button" className="reorder-btn" onClick={() => moveRow(row.id, 1)} aria-label={`Move ${row.id} down`}><ArrowDown size={14} /></button>
            </td>
          )}
          {(() => {
            const cells = [];
            const spannedByPair = new Set();
            orderedColumns.forEach((col, i) => {
              const isLocked = selections.lockedColumns && i === 0;
              const pair = pairFor(col.key);

              if (pair) {
                if (spannedByPair.has(col.key)) return; // rendered as part of the pair cell already
                pair.keys.forEach((k) => spannedByPair.add(k));
                cells.push(
                  <td key={`pair-${pair.keys.join('-')}`} colSpan={pair.keys.length}>
                    <div className="stacked-pair-cell">
                      {pair.keys.map((k) => {
                        const pcol = orderedColumns.find((c) => c.key === k) || columns.find((c) => c.key === k);
                        return (
                          <div key={k} className="stacked-pair-value" style={fontStyleFor(pcol)}>
                            <span className="sr-only">{pcol.label}: </span>
                            {formatCell(pcol, cellValue(row, pcol))}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                );
                return;
              }

              const value = cellValue(row, col);
              const isEditingThis = editingCell?.rowId === row.id && editingCell?.key === col.key;
              const editable = selections.editing === 'inline' && col.editable;
              const align = col.type === 'currency' || col.type === 'number' ? 'right' : 'left';

              let content;
              if (isEditingThis) {
                content = (
                  <input
                    autoFocus
                    defaultValue={value ?? ''}
                    onBlur={(e) => commitEdit(row.id, col.key, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingCell(null); }}
                  />
                );
              } else if (col.type === 'status') {
                content = (
                  <span className="status-cell">
                    {selections.legend && <StatusIndicator value={value} />}
                    {formatCell(col, value)}
                  </span>
                );
              } else if (selections.footnote && row.footnotes?.[col.key]) {
                content = (
                  <>
                    {formatCell(col, value)}
                    <sup className="footnote-marker" aria-describedby={footnoteIndex[row.footnotes[col.key]]}>*</sup>
                  </>
                );
              } else if (col.truncate && value && String(value).length > 40) {
                content = <TruncatedCell text={String(value).slice(0, 40) + '…'} />;
              } else if (editable) {
                content = <span className="editable-value">{formatCell(col, value)}</span>;
              } else {
                content = formatCell(col, value);
              }

              cells.push(
                <td
                  key={col.key}
                  className={[isLocked && 'locked-col', editable && 'editable-cell'].filter(Boolean).join(' ') || undefined}
                  style={{ textAlign: align, minWidth: col.width, left: isLocked ? lockedColLeft : undefined, ...fontStyleFor(col) }}
                  onClick={editable && !isEditingThis ? () => setEditingCell({ rowId: row.id, key: col.key }) : undefined}
                >
                  {content}
                </td>
              );
            });
            return cells;
          })()}
          {hasActionsCol && (
            <td className="actions-col">
              <span className="actions-buttons">
                <button type="button" className="button" aria-pressed={isFlagged} onClick={() => toggleFlag(row.id)}>
                  {isFlagged ? 'Flagged' : 'Flag'}
                </button>
                {selections.actions === 'multiple' && (
                  <button type="button" className="button" onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}>
                    Archive
                  </button>
                )}
              </span>
            </td>
          )}
        </tr>
        {showInlineDetail && (
          <tr className="expand-row">
            <td colSpan={totalColSpan}>
              <DetailContent row={row} />
            </td>
          </tr>
        )}
      </Fragment>
    );
  }

  // A totals row (grand or per-group) reuses the same column structure as a
  // data row, so the amount lands right-aligned under the Amount column
  // rather than as a single spanning line of text.
  function renderTotalsRow(rowsForTotal, label, keySuffix) {
    const spannedByPair = new Set();
    return (
      <tr key={`totals-${keySuffix}`} className="totals-row">
        {hasDetailCol && <td className="detail-col" />}
        {canSelect && <td className="select-col" />}
        {selections.dragReorder && <td className="reorder-col" />}
        {orderedColumns.map((col, i) => {
          const pair = pairFor(col.key);
          if (pair) {
            if (spannedByPair.has(col.key)) return null;
            pair.keys.forEach((k) => spannedByPair.add(k));
            return <td key={`pair-${pair.keys.join('-')}`} colSpan={pair.keys.length} />;
          }
          return (
            <td
              key={col.key}
              style={{
                textAlign: col.type === 'currency' || col.type === 'number' ? 'right' : 'left',
                fontWeight: 600,
                ...fontStyleFor(col),
              }}
            >
              {col.key === 'amount'
                ? formatAmount(rowsForTotal.reduce((sum, r) => sum + (r.amount || 0), 0))
                : i === 0 ? label : ''}
            </td>
          );
        })}
        {hasActionsCol && <td className="actions-col" />}
      </tr>
    );
  }

  // Row-grouping decision: rows group by status (a real categorical field
  // in the sample data), each group shown with a header row and, when
  // totals includes per-group, its own subtotal directly beneath it.
  function buildGroupedSections() {
    if (!selections.rowGrouping) return [{ label: null, rows: sortedRows }];
    const map = {};
    sortedRows.forEach((row) => {
      const key = row.status || 'Unspecified';
      (map[key] ||= []).push(row);
    });
    return Object.keys(map).sort().map((label) => ({ label, rows: map[label] }));
  }

  const showPerGroupTotals = selections.rowGrouping && (selections.totals === 'perGroup' || selections.totals === 'both');
  const showGrandTotal = (selections.totals === 'grand' || selections.totals === 'both') && columns.some((c) => c.key === 'amount');

  // Footnote decision: one marker per unique disclaimer text, not per row,
  // so a caveat that happened to apply to several rows wouldn't repeat
  // itself in the footer. Built from filteredRows, not the full dataset,
  // consistent with the export-scope decision: a disclaimer on a row
  // that's currently filtered out has nothing on screen to explain.
  const footnoteIndex = {};
  const activeFootnotes = [];
  if (selections.footnote) {
    filteredRows.forEach((row) => {
      if (!row.footnotes) return;
      Object.values(row.footnotes).forEach((text) => {
        if (!(text in footnoteIndex)) {
          const id = `footnote-${activeFootnotes.length + 1}`;
          footnoteIndex[text] = id;
          activeFootnotes.push({ id, text });
        }
      });
    });
  }

  const itemCountLabel = filteredRows.length === rows.length
    ? `Claims (${rows.length})`
    : `Claims (${filteredRows.length} of ${rows.length})`;

  return (
    <div className="card demo-card">
      <div className="demo-card-header">
        <div className="demo-card-header-left">
          <h3 role="status" aria-live="polite">{itemCountLabel}</h3>
          {(selections.filtering === 'global' || selections.filtering === 'panel') && (
            <>
              <span className="header-separator" aria-hidden="true">|</span>
              <button
                type="button"
                className="filters-trigger no-print"
                onClick={() => setFilterUIOpen((o) => !o)}
                aria-expanded={filterUIOpen}
              >
                <Filter size={14} />
                Filters
              </button>
            </>
          )}
        </div>
        <div className="demo-card-actions no-print">
          {(selections.manualRefresh || selections.realTimeUpdates) && (
            <>
              <span className="as-of-timestamp" role="status" aria-live="polite">
                As of {formatAsOf(lastUpdatedAt)}
              </span>
              <span className="header-separator" aria-hidden="true">|</span>
            </>
          )}
          {selections.manualRefresh && (
            <button type="button" className="icon-button" onClick={handleRefresh} disabled={isRefreshing} aria-busy={isRefreshing} aria-label={isRefreshing ? 'Refreshing' : 'Refresh'} title="Refresh">
              <RefreshCw size={16} className={isRefreshing ? 'icon-spin' : undefined} />
            </button>
          )}
          {selections.exportFormat !== 'none' && (
            <button
              type="button"
              className="icon-button"
              onClick={handleExport}
              disabled={isExporting}
              aria-busy={isExporting}
              aria-label={isExporting ? 'Exporting' : selections.exportFormat === 'screen' ? 'Download' : `Export as ${selections.exportFormat.toUpperCase()}`}
              title={selections.exportFormat === 'screen' ? 'Download' : `Export as ${selections.exportFormat.toUpperCase()}`}
            >
              <Download size={16} />
            </button>
          )}
          {selections.printSupport && (
            <button type="button" className="icon-button no-print" onClick={() => window.print()} aria-label="Print" title="Print">
              <Printer size={16} />
            </button>
          )}
        </div>
      </div>

      {(selections.filtering === 'inline' || ((selections.filtering === 'panel' || selections.filtering === 'global') && filterUIOpen)) && (
        <div className="filter-bar no-print">
          {selections.filtering === 'global' ? (
            <input
              type="search"
              className="filter-input filter-input-global"
              placeholder="Search all columns"
              aria-label="Search all columns"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          ) : (
            orderedColumns.map((col) => (
              <input
                key={col.key}
                type="text"
                className="filter-input"
                placeholder={col.label}
                aria-label={`Filter by ${col.label}`}
                value={columnFilters[col.key] || ''}
                onChange={(e) => setColumnFilters((prev) => ({ ...prev, [col.key]: e.target.value }))}
              />
            ))
          )}
        </div>
      )}

      {bulkMode && selectedIds.size > 0 && (
        <div className="bulk-bar no-print">
          <span>{selectedIds.size} selected</span>
          <button type="button" className="button" onClick={() => setSelectedIds(new Set())}>Tag</button>
          <button type="button" className="button" onClick={() => setConfirmBulkDelete(true)}>Delete</button>
        </div>
      )}

      <div className="demo-table-wrap" aria-busy={isRefreshing || undefined}>
        <table className="demo-table" data-density={selections.density}>
          <thead>
            <tr>
              {hasDetailCol && (
                <th className="detail-col" rowSpan={activeGroups.length > 0 ? 2 : undefined} aria-hidden="true" />
              )}
              {canSelect && selections.selection === 'multi' && (
                <th className="select-col" rowSpan={activeGroups.length > 0 ? 2 : undefined}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {canSelect && selections.selection === 'single' && (
                <th className="select-col" rowSpan={activeGroups.length > 0 ? 2 : undefined} aria-hidden="true" />
              )}
              {selections.dragReorder && (
                <th className="reorder-col" rowSpan={activeGroups.length > 0 ? 2 : undefined} aria-hidden="true" />
              )}
              {(() => {
                const cells = [];
                const spannedByGroup = new Set();
                const spannedByPair = new Set();
                orderedColumns.forEach((col, i) => {
                  const group = groupFor(col.key);
                  const pair = pairFor(col.key);
                  const isLocked = selections.lockedColumns && i === 0;
                  const align = col.type === 'currency' || col.type === 'number' ? 'right' : 'left';

                  if (group) {
                    if (spannedByGroup.has(col.key)) return; // rendered as part of the group cell already
                    group.keys.forEach((k) => spannedByGroup.add(k));
                    cells.push(
                      <th key={`group-${group.label}`} colSpan={group.keys.length} scope="colgroup" className="group-header">
                        {group.label}
                      </th>
                    );
                    return;
                  }

                  if (pair) {
                    if (spannedByPair.has(col.key)) return; // rendered as part of the pair cell already
                    pair.keys.forEach((k) => spannedByPair.add(k));
                    cells.push(
                      <th
                        key={`pair-${pair.keys.join('-')}`}
                        colSpan={pair.keys.length}
                        rowSpan={activeGroups.length > 0 ? 2 : undefined}
                        className="stacked-pair-header"
                      >
                        {pair.keys.map((k) => {
                          const pcol = orderedColumns.find((c) => c.key === k) || columns.find((c) => c.key === k);
                          return (
                            <div key={k} className="stacked-pair-header-line">
                              {headerCellContent(pcol)}
                            </div>
                          );
                        })}
                      </th>
                    );
                    return;
                  }

                  cells.push(
                    <th
                      key={col.key}
                      rowSpan={activeGroups.length > 0 ? 2 : undefined}
                      className={[isLocked && 'locked-col', dragOverKey === col.key && 'col-drag-over'].filter(Boolean).join(' ') || undefined}
                      style={{ textAlign: align, minWidth: col.width, left: isLocked ? lockedColLeft : undefined }}
                      aria-sort={headerAriaSort(col)}
                      {...headerDragProps(col)}
                    >
                      {headerCellContent(col)}
                    </th>
                  );
                });
                return cells;
              })()}
              {hasActionsCol && (
                <th className="actions-col" rowSpan={activeGroups.length > 0 ? 2 : undefined}>Actions</th>
              )}
            </tr>
            {activeGroups.length > 0 && (
              <tr>
                {orderedColumns.map((col, i) => {
                  const group = groupFor(col.key);
                  if (!group) return null; // already rendered with rowSpan in the row above
                  const isLocked = selections.lockedColumns && i === 0;
                  const align = col.type === 'currency' || col.type === 'number' ? 'right' : 'left';
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={isLocked ? 'locked-col' : undefined}
                      style={{ textAlign: align, minWidth: col.width, left: isLocked ? lockedColLeft : undefined }}
                      aria-sort={headerAriaSort(col)}
                    >
                      {headerCellContent(col)}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={totalColSpan} className="empty-row">No claims match the current filter.</td>
              </tr>
            ) : (
              buildGroupedSections().map((section) => (
                <Fragment key={section.label || 'all'}>
                  {section.label && (
                    <tr className="group-header-row">
                      <td colSpan={totalColSpan}>{section.label} ({section.rows.length})</td>
                    </tr>
                  )}
                  {section.rows.map((row) => renderDataRow(row))}
                  {section.label && showPerGroupTotals && renderTotalsRow(section.rows, 'Subtotal', section.label)}
                </Fragment>
              ))
            )}
          </tbody>
          {showGrandTotal && (
            <tfoot>
              {renderTotalsRow(filteredRows, 'Total', 'grand')}
            </tfoot>
          )}
        </table>
      </div>

      {(activeFootnotes.length > 0 || selections.legend) && (
        <div className="demo-table-footer no-print">
          {activeFootnotes.length > 0 && (
            <ul className="footnote-list">
              {activeFootnotes.map((fn) => (
                <li key={fn.id} id={fn.id}>* {fn.text}</li>
              ))}
            </ul>
          )}
          {selections.legend && (
            <ul className="status-legend">
              {Object.entries(STATUS_TONE).map(([label, tone]) => (
                <li key={label} className="status-legend-item">
                  <span className={`status-dot status-dot-${tone}`} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selections.editing === 'viaDetail' && (
        <p className="demo-note">
          {'Editing through the row detail view isn’t implemented in this demo, the drawer, modal, side panel, or contained panel still shows read-only fields. Shown here as a scope note rather than built out.'}
        </p>
      )}

      <Drawer
        open={(selections.rowDetail === 'panel' || selections.rowDetail === 'containedPanel') && panelRow !== undefined}
        onClose={() => setOpenPanelRowId(null)}
        title={panelRow ? `${panelRow.id}: ${panelRow.customer}` : ''}
        variant={selections.rowDetail === 'containedPanel' ? 'containedPanel' : 'panel'}
      >
        {panelRow && sampleColumns.map((c) => (
          <p key={c.key} style={{ margin: '0 0 var(--space-sm)' }}>
            <strong>{c.label}:</strong> {formatCell(c, cellValue(panelRow, c))}
          </p>
        ))}
      </Drawer>

      <Drawer
        open={selections.rowDetail === 'modal' && modalRowId !== null}
        onClose={() => setModalRowId(null)}
        title={modalRow ? `${modalRow.id}: ${modalRow.customer}` : ''}
        variant="modal"
      >
        {modalRow && sampleColumns.map((c) => (
          <p key={c.key} style={{ margin: '0 0 var(--space-sm)' }}>
            <strong>{c.label}:</strong> {formatCell(c, cellValue(modalRow, c))}
          </p>
        ))}
      </Drawer>

      <Drawer
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        title="Delete selected claims?"
        variant="modal"
      >
        <p>This will permanently delete {selectedIds.size} claim{selectedIds.size === 1 ? '' : 's'}. This can’t be undone.</p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          <button type="button" className="button" onClick={() => setConfirmBulkDelete(false)}>Cancel</button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
              setSelectedIds(new Set());
              setConfirmBulkDelete(false);
            }}
          >
            Delete {selectedIds.size}
          </button>
        </div>
      </Drawer>
    </div>
  );
}
