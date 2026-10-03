import { useState } from 'react';
import { ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, MoreVertical, Filter } from 'lucide-react';
import { sampleColumns, sampleRows } from '../lib/sampleData';
import { formatCell, fontStyleFor, defaultDirFor, alignFor } from '../lib/formatCell';
import StatusIndicator from './StatusIndicator';
import Drawer from './Drawer';

const TIER_ORDER = { low: 0, mid: 1, high: 2 };

// Four-corners decision: once a row has three or more visible data points,
// a phone-width screen doesn't have room for a table at all, scrolling it
// sideways just moves the same problem rather than solving it. Four fixed
// corner positions (first four visible columns, in column order) is the
// adaptive layout instead: a compact card per row, no horizontal scroll.
// Below three, there's nothing to adapt, the handful of fields already fit
// as a simple stacked list.
const CORNER_COUNT = 4;
const FOUR_CORNERS_MIN = 3;

// Right-side preference: within each top/bottom pair, a numeric or currency
// column reads better right-aligned, so it takes the right-hand position
// (index 1 or 3) whenever the pairing gives it a choice. Only ever swaps
// within a pair, so the two left-to-right rows a column could appear in
// don't move relative to each other, just left and right within one row.
function preferNumericOnRight(columns) {
  const next = [...columns];
  [[0, 1], [2, 3]].forEach(([leftIdx, rightIdx]) => {
    if (rightIdx >= next.length) return;
    const left = next[leftIdx];
    const right = next[rightIdx];
    if (alignFor(left) === 'right' && alignFor(right) !== 'right') {
      next[leftIdx] = right;
      next[rightIdx] = left;
    }
  });
  return next;
}

export default function MobileDemoGrid({ selections }) {
  const [rows, setRows] = useState(sampleRows);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [flaggedIds, setFlaggedIds] = useState(new Set());
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [modalRowId, setModalRowId] = useState(null);
  const [openPanelRowId, setOpenPanelRowId] = useState(null);
  const [sortChain, setSortChain] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [filterUIOpen, setFilterUIOpen] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const tierCap = TIER_ORDER[selections.dataPoints] ?? 0;
  const visibleColumns = sampleColumns.filter((c) => TIER_ORDER[c.tier] <= tierCap);
  const useFourCorners = visibleColumns.length >= FOUR_CORNERS_MIN;
  const cornerColumns = useFourCorners
    ? preferNumericOnRight(visibleColumns.slice(0, CORNER_COUNT))
    : visibleColumns;
  // Right-hand grid position, whatever the column sitting there holds. The
  // user reads down the right edge expecting a straight line, so both
  // corners in that column of the grid stay right-aligned together rather
  // than switching with the data type.
  const isRightSlot = (index) => useFourCorners && index % 2 === 1;
  // Everything not shown as a corner, whether it's beyond the four-corner
  // cap or outside the data-points tier entirely, lives behind the same
  // overflow method already chosen for row detail on the desktop demo.
  const overflowColumns = sampleColumns.filter((c) => !cornerColumns.includes(c));
  const hasOverflow = overflowColumns.length > 0;
  const canSelect = selections.selection !== 'none';
  const rowDetail = selections.rowDetail;
  // Bulk actions are a selection-level concept, shown in a bar above the
  // list the same way the desktop table shows one, not a per-row menu
  // item. A single or multiple action set is the one that becomes a
  // per-row three-dot menu.
  const hasRowActionMenu = selections.actions === 'single' || selections.actions === 'multiple';
  const bulkMode = selections.actions === 'bulk';

  function toggleRowSelected(id) {
    setSelectedIds((prev) => {
      const next = new Set(selections.selection === 'multi' ? prev : []);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function toggleFlag(id) {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setOpenActionMenuId(null);
  }

  function archiveRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setOpenActionMenuId(null);
  }

  function toggleOverflow(rowId) {
    if (rowDetail === 'drawer') {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.has(rowId) ? next.delete(rowId) : next.add(rowId);
        return next;
      });
    } else if (rowDetail === 'panel' || rowDetail === 'containedPanel') {
      setOpenPanelRowId((prev) => (prev === rowId ? null : rowId));
    } else if (rowDetail === 'modal') {
      setModalRowId(rowId);
    }
  }

  // Sorting, by the headers box: same single/multi model as the desktop
  // table, scoped to the four corner columns since those are the only
  // ones with a visible header to click on.
  function toggleSort(key) {
    const col = cornerColumns.find((c) => c.key === key);
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

  // Filtering: 'global' and 'panel' both collapse to one search box on
  // mobile (there's no room for per-column inline controls at this width
  // the way the desktop table has), 'inline' keeps a text input per corner
  // column, same as the desktop table offers per visible column.
  const filteredRows = rows.filter((row) => {
    if ((selections.filtering === 'global' || selections.filtering === 'panel') && filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      return visibleColumns.some((col) => String(formatCell(col, row[col.key])).toLowerCase().includes(q));
    }
    if (selections.filtering === 'inline') {
      return Object.entries(columnFilters).every(([key, val]) => {
        if (!val || !val.trim()) return true;
        const col = cornerColumns.find((c) => c.key === key);
        if (!col) return true;
        return String(formatCell(col, row[col.key])).toLowerCase().includes(val.trim().toLowerCase());
      });
    }
    return true;
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    for (const { key, dir } of sortChain) {
      const col = cornerColumns.find((c) => c.key === key);
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

  function sortCaret(col) {
    if (selections.sorting === 'none') return null;
    const entry = sortChain.find((s) => s.key === col.key);
    if (!entry) return <ChevronsUpDown size={13} className="sort-caret sort-caret-inactive" aria-hidden="true" />;
    return entry.dir === 'asc'
      ? <ChevronUp size={13} className="sort-caret sort-caret-active" aria-hidden="true" />
      : <ChevronDown size={13} className="sort-caret sort-caret-active" aria-hidden="true" />;
  }

  function headerAriaSort(col) {
    const entry = sortChain.find((s) => s.key === col.key);
    const sortable = selections.sorting !== 'none';
    return entry ? (entry.dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined;
  }

  const modalRow = rows.find((r) => r.id === modalRowId);
  const panelRow = rows.find((r) => r.id === openPanelRowId);
  const itemCountLabel = filteredRows.length === rows.length
    ? `Claims (${rows.length})`
    : `Claims (${filteredRows.length} of ${rows.length})`;

  return (
    <div className="card demo-card mobile-demo-card">
      <div className="demo-card-header">
        <div className="demo-card-header-left">
          <h3 role="status" aria-live="polite">{itemCountLabel}</h3>
          {(selections.filtering === 'global' || selections.filtering === 'panel') && (
            <>
              <span className="header-separator" aria-hidden="true">|</span>
              <button
                type="button"
                className="filters-trigger"
                onClick={() => setFilterUIOpen((o) => !o)}
                aria-expanded={filterUIOpen}
              >
                <Filter size={14} />
                Filters
              </button>
            </>
          )}
        </div>
      </div>

      {(selections.filtering === 'inline' || ((selections.filtering === 'global' || selections.filtering === 'panel') && filterUIOpen)) && (
        <div className="filter-bar mobile-filter-bar">
          {selections.filtering === 'inline' ? (
            cornerColumns.map((col) => (
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
          ) : (
            <input
              type="search"
              className="filter-input filter-input-global"
              placeholder="Search all columns"
              aria-label="Search all columns"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          )}
        </div>
      )}

      {bulkMode && (
        <div className="mobile-bulk-row">
          <label className="mobile-select-all">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all rows" />
            Select all
          </label>
          {selectedIds.size > 0 && (
            <div className="bulk-bar">
              <span>{selectedIds.size} selected</span>
              <button type="button" className="button" onClick={() => setSelectedIds(new Set())}>Tag</button>
              <button type="button" className="button" onClick={() => setConfirmBulkDelete(true)}>Delete</button>
            </div>
          )}
        </div>
      )}

      {/* Headers box: names what each corner position holds, and is the
          only place sorting lives, since the per-row labels underneath it
          are gone. */}
      <div className="mobile-headers-box">
        <div className={useFourCorners ? 'mobile-row-corners' : 'mobile-row-stack'}>
          {cornerColumns.map((col, index) => {
            const sortable = selections.sorting !== 'none';
            const sortIndex = sortChain.findIndex((s) => s.key === col.key);
            const rightAligned = isRightSlot(index);
            return sortable ? (
              <button
                key={col.key}
                type="button"
                className={`mobile-header-cell mobile-header-cell-sortable${rightAligned ? ' mobile-corner-right' : ''}`}
                // Reversing the row swaps the caret and label so the label's
                // own edge, not the caret's, lines up with the numbers below
                // it. Flipping the row also flips which end "flex-end" means,
                // so pairing it with flex-end here would push both back to
                // the left, cancelling the reversal out. flex-start is what
                // actually lands the pair against the right edge once the
                // row itself is reversed.
                style={rightAligned ? { flexDirection: 'row-reverse', justifyContent: 'flex-start' } : undefined}
                onClick={() => toggleSort(col.key)}
                aria-sort={headerAriaSort(col)}
              >
                {col.label}
                {sortCaret(col)}
                {sortIndex > -1 && selections.sorting === 'multi' && sortChain.length > 1 && (
                  <span className="sort-priority">{sortIndex + 1}</span>
                )}
              </button>
            ) : (
              <span key={col.key} className={`mobile-header-cell${rightAligned ? ' mobile-corner-right' : ''}`}>
                {col.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mobile-card-list">
        {sortedRows.length === 0 ? (
          <p className="empty-row">No claims match the current filter.</p>
        ) : (
          sortedRows.map((row) => {
            const isSelected = selectedIds.has(row.id);
            const isFlagged = flaggedIds.has(row.id);
            const isExpanded = expandedIds.has(row.id);
            const isOverlayVariant = rowDetail === 'modal' || rowDetail === 'panel' || rowDetail === 'containedPanel';
            const isOverlayOpen = rowDetail === 'modal' ? modalRowId === row.id : openPanelRowId === row.id;
            const actionMenuOpen = openActionMenuId === row.id;
            const hasSideBlock = canSelect || hasRowActionMenu;

            return (
              <div key={row.id} className={`mobile-row-card${isSelected ? ' mobile-row-card-selected' : ''}`}>
                <div className="mobile-row-card-body">
                  <div className="mobile-row-card-content">
                    <div className={useFourCorners ? 'mobile-row-corners' : 'mobile-row-stack'}>
                      {cornerColumns.map((col, index) => (
                        <div
                          key={col.key}
                          className={`mobile-row-field${isRightSlot(index) ? ' mobile-corner-right' : ''}`}
                        >
                          <span className="sr-only">{col.label}: </span>
                          <span className="mobile-row-field-value" style={fontStyleFor(col)}>
                            {col.type === 'status' && selections.legend && <StatusIndicator value={row[col.key]} />}
                            {formatCell(col, row[col.key])}
                          </span>
                        </div>
                      ))}
                    </div>

                    {hasOverflow && rowDetail !== 'none' && (
                      <button
                        type="button"
                        className="mobile-overflow-trigger"
                        aria-expanded={isOverlayVariant ? isOverlayOpen : isExpanded}
                        aria-haspopup={isOverlayVariant ? 'dialog' : undefined}
                        onClick={() => toggleOverflow(row.id)}
                      >
                        {(isOverlayVariant ? isOverlayOpen : isExpanded) ? 'Hide details' : 'More details'}
                        <ChevronRight size={14} className={isExpanded && !isOverlayVariant ? 'mobile-overflow-chevron-open' : undefined} />
                      </button>
                    )}

                    {rowDetail === 'drawer' && isExpanded && (
                      <div className="expand-content mobile-row-overflow">
                        {overflowColumns.map((c) => (
                          <div key={c.key}><strong>{c.label}:</strong> {formatCell(c, row[c.key])}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {hasSideBlock && (
                    <div className="mobile-row-side-block">
                      {canSelect && (
                        <input
                          type={selections.selection === 'multi' ? 'checkbox' : 'radio'}
                          checked={isSelected}
                          onChange={() => toggleRowSelected(row.id)}
                          aria-label={`Select ${row.id}`}
                        />
                      )}
                      {hasRowActionMenu && (
                        <div className="mobile-action-menu-wrap">
                          <button
                            type="button"
                            className="icon-button"
                            aria-label={`Actions for ${row.id}`}
                            aria-haspopup="menu"
                            aria-expanded={actionMenuOpen}
                            onClick={() => setOpenActionMenuId(actionMenuOpen ? null : row.id)}
                          >
                            <MoreVertical size={14} />
                          </button>
                          {actionMenuOpen && (
                            <div className="mobile-action-menu" role="menu">
                              <button type="button" role="menuitem" onClick={() => toggleFlag(row.id)}>
                                {isFlagged ? 'Unflag' : 'Flag'}
                              </button>
                              {selections.actions === 'multiple' && (
                                <button type="button" role="menuitem" onClick={() => archiveRow(row.id)}>
                                  Archive
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="demo-note">
        {'This simulates the layout adaptation only. Editing, column controls, real-time updates, export, print, legend and footnote content, grouping and totals are demonstrated in the desktop view, not rebuilt here a second time.'}
      </p>

      <Drawer
        open={(rowDetail === 'panel' || rowDetail === 'containedPanel') && panelRow !== undefined}
        onClose={() => setOpenPanelRowId(null)}
        title={panelRow ? `${panelRow.id}: ${panelRow.customer}` : ''}
        variant={rowDetail === 'containedPanel' ? 'containedPanel' : 'panel'}
      >
        {panelRow && overflowColumns.map((c) => (
          <p key={c.key} style={{ margin: '0 0 var(--space-sm)' }}>
            <strong>{c.label}:</strong> {formatCell(c, panelRow[c.key])}
          </p>
        ))}
      </Drawer>

      <Drawer
        open={rowDetail === 'modal' && modalRowId !== null}
        onClose={() => setModalRowId(null)}
        title={modalRow ? `${modalRow.id}: ${modalRow.customer}` : ''}
        variant="modal"
      >
        {modalRow && overflowColumns.map((c) => (
          <p key={c.key} style={{ margin: '0 0 var(--space-sm)' }}>
            <strong>{c.label}:</strong> {formatCell(c, modalRow[c.key])}
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
