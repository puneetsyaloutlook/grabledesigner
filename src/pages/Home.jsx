import { STEPS } from '../lib/navSteps';

// The chip on each row echoes the sidebar's own label/detail exactly (from
// the shared STEPS data), the paragraph beside it is the longer version
// that only makes sense once you're not already looking at the sidebar.
// These rows are informational only, not links: the left nav is the only
// clickable way to move between pages.
const SUMMARIES = {
  '/features': 'Start with the patterns your users need to find in the data. Then map the functionality specified here to those needs, not the reverse.',
  '/standards': 'UX and accessibility standards that apply, based on what was selected on Features needed. Each one is triggered by a specific selection.',
  '/experience': 'A working demo built from what was selected on Features needed, implementing the applicable standards and the specific rendering choices behind it.',
  '/documentation': 'The net result: what to build for this configuration, and why, synthesised from your selections, the applicable standards, and the decisions made in Experience.',
};

export default function Home() {
  return (
    <div>
      <div className="content-header">
        <h1>How this works</h1>
      </div>

      <div className="doc-sheet">
        <p className="intro-copy" style={{ maxWidth: 'none' }}>
          Four steps, each one feeding the next. Specify what a data display
          needs, see which UX standards that triggers, try it as a working
          demo, then export the result as documentation.
        </p>
        <p style={{ margin: '0 0 var(--space-xl)' }}>
          Framework, on its own in the sidebar, is background reading rather
          than a step.
        </p>

        <div className="home-steps">
          {STEPS.map((step) => (
            <div className="home-step-row" key={step.to}>
              <div className="home-step-chip">
                <h3>{step.label}</h3>
                <p>{step.detail}</p>
              </div>
              <p className="home-step-description">{SUMMARIES[step.to]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
