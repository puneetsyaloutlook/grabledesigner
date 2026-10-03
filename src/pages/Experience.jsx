import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { computeDerivedFlags } from '../lib/selectionSchema';
import DemoGrid from '../components/DemoGrid';
import MobileDemoGrid from '../components/MobileDemoGrid';

export default function Experience() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);
  const mobileSimAvailable = selections.responsiveRequired && selections.breakpoints?.includes('mobile');
  const [view, setView] = useState('desktop');
  const activeView = mobileSimAvailable ? view : 'desktop';

  return (
    <div>
      <div className="content-header">
        <h1>Experience</h1>
      </div>

      {mobileSimAvailable && (
        <div className="view-toggle" role="radiogroup" aria-label="Simulated viewport">
          <button
            type="button"
            role="radio"
            aria-checked={activeView === 'desktop'}
            className={`view-toggle-button${activeView === 'desktop' ? ' view-toggle-button-active' : ''}`}
            onClick={() => setView('desktop')}
          >
            Desktop
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={activeView === 'mobile'}
            className={`view-toggle-button${activeView === 'mobile' ? ' view-toggle-button-active' : ''}`}
            onClick={() => setView('mobile')}
          >
            Mobile
          </button>
        </div>
      )}

      {activeView === 'mobile'
        ? <MobileDemoGrid selections={selections} />
        : <DemoGrid selections={selections} derived={derived} />}

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify({ selections, derived }, null, 2)}</pre>
      </div>
    </div>
  );
}
