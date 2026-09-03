import { Link, useSearchParams } from 'react-router-dom';

const STEPS = [
  {
    to: '/features',
    label: 'Features needed',
    summary: 'Specify what functions you need for the data display in your app.',
  },
  {
    to: '/standards',
    label: 'Applicable standards',
    summary: 'Functional requirements that apply, based on what was selected on Features needed. Each one is triggered by a specific selection.',
  },
  {
    to: '/experience',
    label: 'Experience',
    summary: 'A working demo built from what was selected on Features needed, implementing the applicable standards and the specific rendering choices behind it.',
  },
  {
    to: '/documentation',
    label: 'Documentation',
    summary: 'The net result: what to build for this configuration, and why, synthesised from your selections, the applicable standards, and the decisions made in Experience.',
  },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return (
    <div>
      <div className="content-header">
        <h1>How this works</h1>
        <p className="intro-copy">
          Four steps, each one feeding the next. Specify what a data display
          needs, see which UX standards that triggers, try it as a working
          demo, then export the result as documentation. Framework, on its
          own in the sidebar, is background reading rather than a step.
        </p>
      </div>

      <div className="canvas-grid">
        {STEPS.map((step, i) => (
          <Link key={step.to} to={`${step.to}${suffix}`} className="card home-step-card">
            <p className="home-step-number">{String(i + 1).padStart(2, '0')}</p>
            <h2>{step.label}</h2>
            <p style={{ margin: 0 }}>{step.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
