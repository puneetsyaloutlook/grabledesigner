import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { sampleColumns, sampleRows } from '../lib/sampleData';
import { formatCell, fontStyleFor } from '../lib/formatCell';
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

export default function MobileDemoGrid({ selections }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [modalRowId, setModalRowId] = useState(null);
  const [openPanelRowId, setOpenPanelRowId] = useState(null);

  const tierCap = TIER_ORDER[selections.dataPoints] ?? 0;
  const visibleColumns = sampleColumns.filter((c) => TIER_ORDER[c.tier] <= tierCap);
  const useFourCorners = visibleColumns.length >= FOUR_CORNERS_MIN;
  const cornerColumns = useFourCorners ? visibleColumns.slice(0, CORNER_COUNT) : visibleColumns;
  // Everything not shown as a corner, whether it's beyond the four-corner
  // cap or outside the data-points tier entirely, lives behind the same
  // overflow method already chosen for row detail on the desktop demo.
  const overflowColumns = sampleColumns.filter((c) => !cornerColumns.includes(c));
  const hasOverflow = overflowColumns.length > 0;
  const canSelect = selections.selection !== 'none';
  const rowDetail = selections.rowDetail;

  function toggleRowSelected(id) {
    setSelectedIds((prev) => {
      const next = new Set(selections.selection === 'multi' ? prev : []);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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

  const modalRow = sampleRows.find((r) => r.id === modalRowId);
  const panelRow = sampleRows.find((r) => r.id === openPanelRowId);
  const itemCountLabel = `Claims (${sampleRows.length})`;

  return (
    <div className="card demo-card mobile-demo-card">
      <div className="demo-card-header">
        <div className="demo-card-header-left">
          <h3 role="status" aria-live="polite">{itemCountLabel}</h3>
        </div>
      </div>

      <div className="mobile-card-list">
        {sampleRows.map((row) => {
          const isSelected = selectedIds.has(row.id);
          const isExpanded = expandedIds.has(row.id);
          const isOverlayVariant = rowDetail === 'modal' || rowDetail === 'panel' || rowDetail === 'containedPanel';
          const isOverlayOpen = rowDetail === 'modal' ? modalRowId === row.id : openPanelRowId === row.id;

          return (
            <div key={row.id} className={`mobile-row-card${isSelected ? ' mobile-row-card-selected' : ''}`}>
              <div className="mobile-row-card-top">
                {canSelect && (
                  <input
                    type={selections.selection === 'multi' ? 'checkbox' : 'radio'}
                    checked={isSelected}
                    onChange={() => toggleRowSelected(row.id)}
                    aria-label={`Select ${row.id}`}
                  />
                )}
                {hasOverflow && rowDetail !== 'none' && (
                  <button
                    type="button"
                    className={`icon-button detail-toggle${isOverlayVariant ? ' detail-toggle-more' : ''}`}
                    aria-expanded={isOverlayVariant ? isOverlayOpen : isExpanded}
                    aria-haspopup={isOverlayVariant ? 'dialog' : undefined}
                    aria-label={`${(isOverlayVariant ? isOverlayOpen : isExpanded) ? 'Hide' : 'Show'} details for ${row.id}`}
                    onClick={() => toggleOverflow(row.id)}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                )}
              </div>

              <div className={useFourCorners ? 'mobile-row-corners' : 'mobile-row-stack'}>
                {cornerColumns.map((col) => (
                  <div key={col.key} className="mobile-row-field">
                    <span className="mobile-row-field-label">{col.label}</span>
                    <span className="mobile-row-field-value" style={fontStyleFor(col)}>
                      {col.type === 'status' && selections.legend && <StatusIndicator value={row[col.key]} />}
                      {formatCell(col, row[col.key])}
                    </span>
                  </div>
                ))}
              </div>

              {rowDetail === 'drawer' && isExpanded && (
                <div className="expand-content mobile-row-overflow">
                  {overflowColumns.map((c) => (
                    <div key={c.key}><strong>{c.label}:</strong> {formatCell(c, row[c.key])}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="demo-note">
        {'This simulates the layout adaptation only. Sorting, filtering, editing, column controls, bulk actions, and the other desktop-only interactions are demonstrated in the desktop view, not rebuilt here a second time.'}
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
    </div>
  );
}
