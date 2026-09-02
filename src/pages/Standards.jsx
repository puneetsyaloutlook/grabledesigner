import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { computeDerivedFlags } from '../lib/selectionSchema';
import { applicableStandards } from '../lib/standards';
import { accentFor } from '../lib/categoryAccent';

export default function Standards() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);
  const results = applicableStandards(selections, derived);

  const byCategory = results.reduce((acc, entry) => {
    (acc[entry.category] ||= []).push(entry);
    return acc;
  }, {});

  return (
    <div>
      <div className="content-header">
        <h1>Applicable standards</h1>
        <p className="intro-copy">
          Not a checklist to opt into. These are functional requirements
          that already apply, given what was selected on the features page.
          Nothing here is optional once the triggering feature is present.
        </p>
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
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="card"
                style={{ borderLeft: `3px solid ${accentFor(entry.category)}` }}
              >
                <p style={{ fontWeight: 500, margin: '0 0 var(--space-sm)' }}>{entry.requirement}</p>
                <p style={{ fontSize: 'var(--text-sm-size)', color: 'var(--text-secondary)', margin: '0 0 var(--space-xs)' }}>
                  <strong>Why: </strong>{entry.why}
                </p>
                <p style={{ fontSize: 'var(--text-sm-size)', color: 'var(--text-secondary)', margin: 0 }}>
                  <strong>Typically satisfied by: </strong>{entry.typical}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify({ selections, derived }, null, 2)}</pre>
      </div>
    </div>
  );
}
