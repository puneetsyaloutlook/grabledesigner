import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { computeDerivedFlags } from '../lib/selectionSchema';
import { applicableStandards } from '../lib/standards';
import { accentFor } from '../lib/categoryAccent';

export default function Experience() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);
  const requirements = applicableStandards(selections, derived);

  return (
    <div>
      <div className="content-header">
        <p className="eyebrow">Grid and table UX reference</p>
        <h1>Experience</h1>
        <p className="intro-copy">
          This page will carry the selections from Features needed into a live
          demo grid. The demo isn't built yet, but the requirements list below
          is real &mdash; it's the same filtered list as the Applicable standards
          page, pulled from the same source. Once the grid exists, it has to
          satisfy every item here, not just illustrate the feature that
          triggered it.
        </p>
      </div>

      <div className="card">
        <h2>Demo grid</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Not yet built.
        </p>
      </div>

      <section style={{ marginTop: 'var(--space-2xl)' }}>
        <h2>Requirements this demo must satisfy</h2>
        <p className="intro-copy">
          {requirements.length} requirement{requirements.length === 1 ? '' : 's'} apply,
          based on what was selected on Features needed.
        </p>
        <div className="reading-list">
          {requirements.map((entry) => (
            <div
              key={entry.id}
              className="card"
              style={{ borderLeft: `3px solid ${accentFor(entry.category)}` }}
            >
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-action)', fontWeight: 600, margin: '0 0 var(--space-xs)' }}>
                {entry.category}
              </p>
              <p style={{ fontWeight: 500, margin: 0 }}>{entry.requirement}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify({ selections, derived }, null, 2)}</pre>
      </div>
    </div>
  );
}
