import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { computeDerivedFlags } from '../lib/selectionSchema';
import DemoGrid from '../components/DemoGrid';

export default function Experience() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);

  return (
    <div>
      <div className="content-header">
        <h1>Experience</h1>
      </div>

      <DemoGrid selections={selections} derived={derived} />

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify({ selections, derived }, null, 2)}</pre>
      </div>
    </div>
  );
}
