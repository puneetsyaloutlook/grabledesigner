import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { computeDerivedFlags } from '../lib/selectionSchema';
import { applicableStandards } from '../lib/standards';
import { accentFor } from '../lib/categoryAccent';
import Drawer from '../components/Drawer';

const TRUNCATE_AT = 150;

function truncate(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '\u2026';
}

export default function Standards() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);
  const results = applicableStandards(selections, derived);
  const [openId, setOpenId] = useState(null);

  const byCategory = results.reduce((acc, entry) => {
    (acc[entry.category] ||= []).push(entry);
    return acc;
  }, {});

  const openEntry = results.find((e) => e.id === openId);

  return (
    <div>
      <div className="content-header">
        <h1>Applicable standards</h1>
      </div>

      {results.length === 0 && (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            No selections yet, or nothing selected triggers a standard beyond
            the baseline data-formatting rules. Go to Features needed to set
            what this grid requires.
          </p>
        </div>
      )}

      {Object.entries(byCategory).map(([category, entries]) => (
        <section key={category} style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2>{category}</h2>
          <div className="canvas-grid-capped">
            {entries.map((entry) => {
              const whyNeedsMore = entry.why.length > TRUNCATE_AT;
              const typicalNeedsMore = entry.typical.length > TRUNCATE_AT;
              const needsMore = whyNeedsMore || typicalNeedsMore;

              return (
                <div
                  key={entry.id}
                  className="card"
                  style={{ borderLeft: `3px solid ${accentFor(entry.category)}` }}
                >
                  <p style={{ fontWeight: 500, margin: '0 0 var(--space-sm)' }}>{entry.requirement}</p>
                  <p style={{ fontSize: 'var(--text-sm-size)', color: 'var(--text-secondary)', margin: '0 0 var(--space-xs)' }}>
                    <strong>Why: </strong>{whyNeedsMore ? truncate(entry.why, TRUNCATE_AT) : entry.why}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm-size)', color: 'var(--text-secondary)', margin: needsMore ? '0 0 var(--space-sm)' : 0 }}>
                    <strong>Typically satisfied by: </strong>{typicalNeedsMore ? truncate(entry.typical, TRUNCATE_AT) : entry.typical}
                  </p>
                  {needsMore && (
                    <button type="button" className="card-more-link" onClick={() => setOpenId(entry.id)}>
                      More details
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <Drawer
        open={openEntry !== undefined}
        onClose={() => setOpenId(null)}
        title={openEntry ? openEntry.requirement : ''}
        variant="modal"
      >
        {openEntry && (
          <>
            <p style={{ margin: '0 0 var(--space-md)' }}>
              <strong>Why: </strong>{openEntry.why}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Typically satisfied by: </strong>{openEntry.typical}
            </p>
          </>
        )}
      </Drawer>

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify({ selections, derived }, null, 2)}</pre>
      </div>
    </div>
  );
}
