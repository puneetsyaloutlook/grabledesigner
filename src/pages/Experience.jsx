import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { computeDerivedFlags } from '../lib/selectionSchema';
import { applicableStandards } from '../lib/standards';
import { applicableDecisions } from '../lib/decisions';
import { accentFor } from '../lib/categoryAccent';
import DemoGrid from '../components/DemoGrid';

export default function Experience() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);
  const requirements = applicableStandards(selections, derived);
  const decisions = applicableDecisions(selections, derived);

  return (
    <div>
      <div className="content-header">
        <p className="eyebrow">Grid and table UX reference</p>
        <h1>Experience</h1>
        <p className="intro-copy">
          A working demo built from what was selected on Features needed,
          implementing the applicable standards and the specific rendering
          choices below &mdash; not just illustrating them.
        </p>
      </div>

      <DemoGrid selections={selections} derived={derived} />

      {decisions.length > 0 && (
        <section style={{ marginTop: 'var(--space-2xl)' }}>
          <h2>Decisions made</h2>
          <p className="intro-copy">
            Places where more than one legitimate rendering exists. Each one
            shows the option this demo uses and the trade-off against the
            alternative.
          </p>
          <div className="reading-list">
            {decisions.map((entry) => (
              <div
                key={entry.id}
                className="card"
                style={{ borderLeft: `3px solid ${accentFor(entry.category)}` }}
              >
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-action)', fontWeight: 600, margin: '0 0 var(--space-xs)' }}>
                  {entry.category}
                </p>
                <p style={{ fontWeight: 500, margin: '0 0 var(--space-sm)' }}>{entry.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: 'var(--space-sm)' }}>
                  {entry.options.map((opt, i) => (
                    <p key={i} style={{ fontSize: 'var(--text-sm-size)', margin: 0, color: opt.chosen ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {opt.chosen ? '\u2713 ' : '\u2717 '}
                      <strong>{opt.label}</strong> &mdash; {opt.note}
                    </p>
                  ))}
                </div>
                <p style={{ fontSize: 'var(--text-sm-size)', color: 'var(--text-secondary)', margin: 0 }}>
                  <strong>Trade-off: </strong>{entry.tradeoff}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 'var(--space-2xl)' }}>
        <h2>Standards this satisfies</h2>
        <p className="intro-copy">
          {requirements.length} applicable requirement{requirements.length === 1 ? '' : 's'},
          the same filtered list as Applicable standards.
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
