import { Database, Table, PieChart, Lightbulb, MousePointerClick, TrendingUp, Cog } from 'lucide-react';

const STAGES = [
  {
    name: 'Get the data',
    icon: Database,
    detail: 'Validate that the data actually exists, is accessible, and is reliable enough to build on. This is a feasibility question before it\u2019s a design question: nothing downstream works if the data supply itself isn\u2019t sound.',
  },
  {
    name: 'Put it in a table',
    icon: Table,
    current: true,
    detail: 'Make the raw data available to users in its most direct form. This is the baseline: before any interpretation or visual treatment, users need to be able to see the numbers themselves.',
  },
  {
    name: 'Visualise the table',
    icon: PieChart,
    detail: 'Help users process what they\u2019re looking at through charts, summaries, or other visual treatments. The data is the same as the previous stage, presented in a form that\u2019s faster to read and compare.',
  },
  {
    name: 'Draw out insights',
    icon: Lightbulb,
    detail: 'Instead of leaving users to spot patterns on their own, surface the insights directly. The work shifts from the user interpreting the data to the product doing some of that interpretation for them.',
  },
  {
    name: 'Drive actions',
    icon: MousePointerClick,
    detail: 'Connect an insight to the action it implies, so users move from understanding what happened to deciding what to do about it, rather than that step being left entirely to them.',
  },
  {
    name: 'Draw out predictions',
    icon: TrendingUp,
    detail: 'Move from reacting to what\u2019s already happened to anticipating what\u2019s likely to happen next, so users can act ahead of an issue rather than after it.',
  },
  {
    name: 'Automate actions',
    icon: Cog,
    detail: 'Remove the repetitive or low-value parts of the response entirely, so the system acts on the user\u2019s behalf where that response is well understood enough to trust.',
  },
];

export default function Framework() {
  return (
    <div>
      <div className="content-header">
        <h1>The data display journey</h1>
      </div>

      <div className="framework-card">
        <div className="framework-intro">
          <h2>The 7 stages</h2>
          <p>This framework describes the evolution of data display interactions in enterprise applications.</p>
          <p>Every stage builds one on top of the previous, as the experience evolves to fit users\u2019 needs better.</p>
          <p>Each stage needs more investment in understanding deeper workflow and business process needs.</p>
          <span className="framework-current-marker" aria-hidden="true" />
          <p>This tool helps visualise and design tabular data display.</p>
        </div>

        <div className="framework-stages">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div key={stage.name} className={`framework-stage-card${stage.current ? ' framework-stage-current' : ''}`}>
                <Icon size={22} className="framework-stage-icon" aria-hidden="true" />
                <div>
                  <h3>{stage.name}</h3>
                  <p>{stage.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
        <h2>Two approaches</h2>
        <div className="framework-approaches">
          <div className="framework-approach">
            <h3>In leaps</h3>
            <p>
              The right approach when the workflow and the business process
              are already well understood, well enough that a whole stage,
              or several, can be designed with confidence upfront. Value
              jumps further with each release, but the trade-off is a
              longer gap where nothing ships while that larger scope is
              being built, and a wrong assumption is more expensive to
              unwind once it\u2019s baked into something bigger.
            </p>
          </div>
          <div className="framework-approach framework-approach-alt">
            <h3>Through stages</h3>
            <p>
              The right approach when the workflow or business process
              isn\u2019t yet fully understood. Each stage becomes a chance to
              test an assumption against real usage before committing
              further, so the team discovers and documents how the work
              actually happens as they go. Value grows steadily, and
              because each release is small, a wrong assumption is cheap to
              correct.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
