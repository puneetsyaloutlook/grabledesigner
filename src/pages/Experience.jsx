import { useSearchParams, Link } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { computeDerivedFlags } from '../lib/selectionSchema';
import DemoGrid from '../components/DemoGrid';

export default function Experience() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);
  const query = searchParams.toString();

  return (
    <div>
      <div className="content-header">
        <h1>Experience</h1>
        <p className="intro-copy">
          A working demo built from what was selected on Features needed,
          implementing the applicable standards and the specific rendering
          choices behind it. The full write-up of those standards and
          decisions lives on{' '}
          <Link to={`/documentation${query ? `?${query}` : ''}`}>Documentation</Link>.
        </p>
      </div>

      <DemoGrid selections={selections} derived={derived} />

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify({ selections, derived }, null, 2)}</pre>
      </div>
    </div>
  );
}
