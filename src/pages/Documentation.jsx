import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { selectionSchema, computeDerivedFlags } from '../lib/selectionSchema';
import { applicableStandards } from '../lib/standards';
import { applicableDecisions } from '../lib/decisions';
import { accentFor } from '../lib/categoryAccent';

// Plain-language summary of what was actually selected, skipping anything
// left at "none" (which means the feature isn't needed, not that it was
// forgotten).
function summariseSelections(selections) {
  const items = [];
  selectionSchema.forEach((group) => {
    group.fields.forEach((field) => {
      const value = selections[field.key];
      if (field.type === 'boolean') {
        if (value) items.push(field.question);
        return;
      }
      const chosen = field.options.find((o) => o.value === value);
      if (chosen && value !== 'none') {
        items.push(`${field.question} \u2014 ${chosen.label}`);
      }
    });
  });
  return items;
}

export default function Documentation() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);
  const requirements = applicableStandards(selections, derived);
  const decisions = applicableDecisions(selections, derived);
  const summary = summariseSelections(selections);

  const totalComplexity = requirements.length + decisions.length;
  const suggestIncremental = totalComplexity >= 15;

  return (
    <div>
      <div className="content-header">
        <p className="eyebrow">Grid and table UX reference</p>
        <h1>Documentation</h1>
        <p className="intro-copy">
          The net result for this configuration: what was selected, which
          standards apply, which implementation decisions were made on
          Experience, and where this sits in the bigger picture. This page
          is the one to hand to someone else, or come back to later.
        </p>
      </div>

      <div className="card">
        <h2>At a glance</h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          {summary.length} feature{summary.length === 1 ? '' : 's'} selected,{' '}
          {requirements.length} applicable standard{requirements.length === 1 ? '' : 's'},{' '}
          {decisions.length} implementation decision{decisions.length === 1 ? '' : 's'}.
        </p>
      </div>

      <section style={{ marginTop: 'var(--space-2xl)' }}>
        <h2>What was selected</h2>
        {summary.length === 0 ? (
          <p className="intro-copy">Nothing selected yet \u2014 go to Features needed to start.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 'var(--space-lg)', color: 'var(--text-primary)' }}>
            {summary.map((s, i) => <li key={i} style={{ marginBottom: 'var(--space-xs)' }}>{s}</li>)}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 'var(--space-2xl)' }}>
        <h2>Where this fits</h2>
        <p className="intro-copy">
          Grid and table work like this sits at the "put it in a table" and
          "visualise the table" stages of the analytics product journey
          &mdash; the display layer beneath insights, actions, predictions, and
          automation. See the Framework page for the full seven-stage
          picture.
        </p>
        <div className="card">
          {suggestIncremental ? (
            <p style={{ margin: 0 }}>
              This configuration pulls in a meaningful amount ({totalComplexity} standards
              and decisions combined). The value-curve trade-off from the framework
              suggests incremental buildout is the safer path here &mdash; ship the
              simpler capabilities first and add the rest in later passes, rather
              than carrying all of it in one release.
            </p>
          ) : (
            <p style={{ margin: 0 }}>
              This is a relatively contained configuration ({totalComplexity} standards
              and decisions combined). Either incremental or big-bang delivery is
              viable here &mdash; the choice comes down to team preference more than risk.
            </p>
          )}
        </div>
      </section>

      {decisions.length > 0 && (
        <section style={{ marginTop: 'var(--space-2xl)' }}>
          <h2>Implementation decisions</h2>
          <p className="intro-copy">
            Places where more than one legitimate rendering exists, and which
            one this configuration uses.
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
        <h2>Applicable standards</h2>
        <p className="intro-copy">
          Functional requirements that already apply \u2014 not optional once
          the triggering feature is present.
        </p>
        {requirements.length === 0 ? (
          <p className="intro-copy">No standards beyond the baseline data-formatting rules.</p>
        ) : (
          <div className="reading-list">
            {requirements.map((entry) => (
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
        )}
      </section>

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify({ selections, derived }, null, 2)}</pre>
      </div>
    </div>
  );
}
