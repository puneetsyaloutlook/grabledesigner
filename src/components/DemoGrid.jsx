import { Fragment, useEffect, useState } from 'react';
import { sampleColumns, sampleRows } from '../lib/sampleData';
import Drawer from './Drawer';

const TIER_ORDER = { low: 0, mid: 1, high: 2 };

// Grouped-headers decision: Region and Channel are genuinely sub-values of
// one broader "where/how this claim came in" question, and they're adjacent
// in column order, so a group can only form (and only should) when both are
// visible together. If only one is visible at a lower data-points tier, it
// just renders as a normal ungrouped column \u2014 a group split apart isn't
// rendered as a broken group, it's just not a group.
const GROUPS = [{ label: 'Origin', keys: ['region', 'channel'] }];

function formatDate(iso) {
  if (!iso) return '\u2014';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Negative-number-format decision: leading minus sign. Empty/NA/zero decision:
// em dash for not-applicable, "0" written out for a genuine zero.
function formatAmount(value) {
  if (value === null || value === undefined) return '\u2014';
  if (value === 0) return '$0';
  const abs = Math.abs(value).toLocaleString();
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

function formatNumber(value) {
  if (value === null || value === undefined) return '\u2014';
  if (value === 0) return '0';
  return value < 0 ? `-${Math.abs(value)}` : `${value}`;
}

function formatCell(column, value) {
  if (value === null || value === undefined || value === '') return '\u2014';
  if (column.type === 'currency') return formatAmount(value);
  if (column.type === 'number') return formatNumber(value);
  if (column.type === 'date') return formatDate(value);
  return String(value);
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
  const [sortChain, setSortChain] = useState([]); // [{ key, dir }]
  const [editingCell, setEditingCell] = useState(null); // { rowId, key }
  const [editValues, setEditValues] = useState({}); // `${rowId}:${key}` -> value
  const [detailRowId, setDetailRowId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [updatingRowId, setUpdatingRowId] = useState(null);

  // realTimeUpdates decision: simulate one row updating asynchronously,
  // aria-busy while in progress rather than swapping the value silently.
  useEffect(() => {
    if (!selections.realTimeUpdates) return;
    const targetId = sampleRows[0].id;
    const start = setTimeout(() => setUpdatingRowId(targetId), 1200);
    const finish = setTimeout(() => {
      setRows((prev) => prev.map((r) => (r.id === targetId ? { ...r, status: 'Approved' } : r)));
      setUpdatingRowId(null);
    }, 3200);
    return () => { clearTimeout(start); clearTimeout(finish); };
  }, [selections.realTimeUpdates]);

  const tierCap = TIER_ORDER[selections.dataPoints] ?? 0;
  const columns = sampleColumns.filter((c) => TIER_ORDER[c.tier] <= tierCap);

  const bulkMode = selections.actions === 'bulk';
  const canSelect = selections.selection !== 'none';

  function toggleSort(key) {
    if (selections.sorting === 'single') {
      setSortChain((prev) => {
        const current = prev[0];
        if (!current || current.key !== key) return [{ key, dir: 'asc' }];
        if (current.dir === 'asc') return [{ key, dir: 'desc' }];
        return [];
      });
    } else if (selections.sorting === 'multi') {
      setSortChain((prev) => {
        const idx = prev.findIndex((s) => s.key === key);
        if (idx === -1) return [...prev, { key, dir: 'asc' }];
        if (prev[idx].dir === 'asc') {
          const next = [...prev];
          next[idx] = { key, dir: 'desc' };
          return next;
        }
        return prev.filter((s) => s.key !== key);
      });
    }
  }

  const sortedRows = [...rows].sort((a, b) => {
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

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
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

  function commitEdit(rowId, key, value) {
    setEditValues((prev) => ({ ...prev, [`${rowId}:${key}`]: value }));
    setEditingCell(null);
  }

  function cellValue(row, column) {
    const override = editValues[`${row.id}:${column.key}`];
    return override !== undefined ? override : row[column.key];
  }

  const detailRow = rows.find((r) => r.id === detailRowId);

  const activeGroups = selections.groupedHeaders
    ? GROUPS.filter((g) => g.keys.every((k) => columns.some((c) => c.key === k)))
    : [];
  function groupFor(key) {
    return activeGroups.find((g) => g.keys.includes(key));
  }

  // Shared between the flat single-row header and the grouped two-row header
  // so the sort button/label markup only exists once.
  function headerCellContent(col) {
    const sortEntry = sortChain.find((s) => s.key === col.key);
    const sortIndex = sortChain.findIndex((s) => s.key === col.key);
    const sortable = selections.sorting !== 'none';
    if (!sortable) return col.label;
    return (
      <button type="button" className="sort-header" onClick={() => toggleSort(col.key)}>
        {col.label}
        {sortEntry && (
          <span className="sort-indicator">
            {sortEntry.dir === 'asc' ? '\u2191' : '\u2193'}
            {selections.sorting === 'multi' && sortChain.length > 1 && (
              <span className="sort-priority">{sortIndex + 1}</span>
            )}
          </span>
        )}
      </button>
    );
  }

  function headerAriaSort(col) {
    const sortEntry = sortChain.find((s) => s.key === col.key);
    const sortable = selections.sorting !== 'none';
    return sortEntry ? (sortEntry.dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined;
  }

  return (
    <div>
      {bulkMode && selectedIds.size > 0 && (
        <div className="bulk-bar">
          <span>{selectedIds.size} selected</span>
          <button type="button" className="button" onClick={() => setSelectedIds(new Set())}>Tag</button>
          <button type="button" className="button" onClick={() => setConfirmBulkDelete(true)}>Delete</button>
        </div>
      )}

      <div className="demo-table-wrap">
        <table className="demo-table" data-density={selections.density}>
          <thead>
            <tr>
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
                columns.forEach((col, i) => {
                  const group = groupFor(col.key);
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

                  cells.push(
                    <th
                      key={col.key}
                      rowSpan={activeGroups.length > 0 ? 2 : undefined}
                      className={isLocked ? 'locked-col' : undefined}
                      style={{ textAlign: align }}
                      aria-sort={headerAriaSort(col)}
                    >
                      {headerCellContent(col)}
                    </th>
                  );
                });
                return cells;
              })()}
              {selections.actions !== 'none' && selections.actions !== 'bulk' && (
                <th className="actions-col" rowSpan={activeGroups.length > 0 ? 2 : undefined}>Actions</th>
              )}
            </tr>
            {activeGroups.length > 0 && (
              <tr>
                {columns.map((col, i) => {
                  const group = groupFor(col.key);
                  if (!group) return null; // already rendered with rowSpan in the row above
                  const isLocked = selections.lockedColumns && i === 0;
                  const align = col.type === 'currency' || col.type === 'number' ? 'right' : 'left';
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={isLocked ? 'locked-col' : undefined}
                      style={{ textAlign: align }}
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
            {sortedRows.map((row) => {
              const isSelected = selectedIds.has(row.id);
              const isExpanded = expandedIds.has(row.id);
              const isUpdating = updatingRowId === row.id;
              return (
                <Fragment key={row.id}>
                  <tr className={isSelected ? 'row-selected' : undefined} aria-busy={isUpdating || undefined}>
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
                        <button type="button" className="reorder-btn" onClick={() => moveRow(row.id, -1)} aria-label={`Move ${row.id} up`}>{'\u2191'}</button>
                        <button type="button" className="reorder-btn" onClick={() => moveRow(row.id, 1)} aria-label={`Move ${row.id} down`}>{'\u2193'}</button>
                      </td>
                    )}
                    {columns.map((col, i) => {
                      const isLocked = selections.lockedColumns && i === 0;
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
                      } else if (col.truncate && value && String(value).length > 40) {
                        content = <TruncatedCell text={String(value).slice(0, 40) + '\u2026'} />;
                      } else {
                        content = formatCell(col, value);
                      }

                      return (
                        <td
                          key={col.key}
                          className={[isLocked && 'locked-col', editable && 'editable-cell'].filter(Boolean).join(' ') || undefined}
                          style={{ textAlign: align }}
                          onClick={editable && !isEditingThis ? () => setEditingCell({ rowId: row.id, key: col.key }) : undefined}
                        >
                          {content}
                        </td>
                      );
                    })}
                    {selections.actions !== 'none' && selections.actions !== 'bulk' && (
                      <td className="actions-col">
                        {selections.rowDetail !== 'none' && selections.rowDetail !== 'expandRow' && (
                          <button type="button" className="button" onClick={() => setDetailRowId(row.id)}>View</button>
                        )}
                        {selections.rowDetail === 'expandRow' && (
                          <button
                            type="button"
                            className="button"
                            onClick={() => setExpandedIds((prev) => {
                              const next = new Set(prev);
                              next.has(row.id) ? next.delete(row.id) : next.add(row.id);
                              return next;
                            })}
                          >
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                  {selections.rowDetail === 'expandRow' && isExpanded && (
                    <tr className="expand-row">
                      <td colSpan={columns.length + (canSelect ? 1 : 0) + 1}>
                        <div className="expand-content">
                          {sampleColumns.filter((c) => !columns.includes(c)).map((c) => (
                            <div key={c.key}><strong>{c.label}:</strong> {formatCell(c, row[c.key])}</div>
                          ))}
                          {sampleColumns.filter((c) => !columns.includes(c)).length === 0 && (
                            <div>{row.notes}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          {selections.totals !== 'none' && columns.some((c) => c.key === 'amount') && (
            <tfoot>
              <tr>
                {canSelect && <td className="select-col" />}
                {selections.dragReorder && <td className="reorder-col" />}
                {columns.map((col, i) => (
                  <td key={col.key} style={{ textAlign: col.type === 'currency' || col.type === 'number' ? 'right' : 'left', fontWeight: 600 }}>
                    {col.key === 'amount'
                      ? formatAmount(rows.reduce((sum, r) => sum + (r.amount || 0), 0))
                      : i === 0 ? 'Total' : ''}
                  </td>
                ))}
                {selections.actions !== 'none' && selections.actions !== 'bulk' && <td className="actions-col" />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {selections.rowGrouping && (
        <p className="demo-note">
          Row grouping isn\u2019t implemented in this demo \u2014 shown here as a scope note rather than built out.
        </p>
      )}

      <Drawer
        open={selections.rowDetail !== 'none' && selections.rowDetail !== 'expandRow' && detailRowId !== null}
        onClose={() => setDetailRowId(null)}
        title={detailRow ? `${detailRow.id} \u2014 ${detailRow.customer}` : ''}
        variant={selections.rowDetail === 'modal' ? 'modal' : 'drawer'}
      >
        {detailRow && sampleColumns.map((c) => (
          <p key={c.key} style={{ margin: '0 0 var(--space-sm)' }}>
            <strong>{c.label}:</strong> {formatCell(c, cellValue(detailRow, c))}
          </p>
        ))}
      </Drawer>

      <Drawer
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        title="Delete selected claims?"
        variant="modal"
      >
        <p>This will permanently delete {selectedIds.size} claim{selectedIds.size === 1 ? '' : 's'}. This can\u2019t be undone.</p>
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
