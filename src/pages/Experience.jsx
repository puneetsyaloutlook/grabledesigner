import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { computeDerivedFlags } from '../lib/selectionSchema';

export default function Experience() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);

  return (
    <div>
      <div className="content-header">
        <p className="eyebrow">Grid and table UX reference</p>
        <h1>Experience</h1>
        <p className="intro-copy">
          This page will carry the selections from Features needed into a live
          demo grid, with an accessibility and reference-system report
          underneath it, filtered to what's actually selected. Not yet built
          &mdash; this stub confirms the selections are arriving correctly.
        </p>
      </div>

      <div className="canvas-grid">
        <div className="card">
          <h3>Received selections</h3>
          <pre style={{ fontSize: 'var(--text-sm-size)', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(selections, null, 2)}
          </pre>
        </div>

        <div className="card">
          <h3>Derived flags</h3>
          <pre style={{ fontSize: 'var(--text-sm-size)', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(derived, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
