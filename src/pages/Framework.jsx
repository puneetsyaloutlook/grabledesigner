const STAGES = [
  {
    name: 'Get the data',
    detail: 'Validate that the data actually exists, is accessible, and is reliable enough to build on. This is a feasibility question before it\u2019s a design question: nothing downstream works if the data supply itself isn\u2019t sound.',
  },
  {
    name: 'Put it in a table',
    detail: 'Make the raw data available to users in its most direct form. This is the baseline: before any interpretation or visual treatment, users need to be able to see the numbers themselves.',
  },
  {
    name: 'Visualise the table',
    detail: 'Help users process what they\u2019re looking at through charts, summaries, or other visual treatments. The data is the same as the previous stage, presented in a form that\u2019s faster to read and compare.',
  },
  {
    name: 'Draw out insights',
    detail: 'Instead of leaving users to spot patterns on their own, surface the insights directly. The work shifts from the user interpreting the data to the product doing some of that interpretation for them.',
  },
  {
    name: 'Drive actions',
    detail: 'Connect an insight to the action it implies, so users move from understanding what happened to deciding what to do about it, rather than that step being left entirely to them.',
  },
  {
    name: 'Draw out predictions',
    detail: 'Move from reacting to what\u2019s already happened to anticipating what\u2019s likely to happen next, so users can act ahead of an issue rather than after it.',
  },
  {
    name: 'Automate actions',
    detail: 'Remove the repetitive or low-value parts of the response entirely, so the system acts on the user\u2019s behalf where that response is well understood enough to trust.',
  },
];

export default function Framework() {
  return (
    <div>
      <div className="content-header">
        <h1>The product maturity framework</h1>
        <p className="intro-copy">
          This framework describes how products enable enterprise users to
          do their work faster, do it better, and bring more value to what
          they produce. Getting there follows a well-understood route, but
          products can take that route in two different ways: in leaps, when
          the workflow and the business process are already well understood,
          or through stages, when the team still needs to discover and
          document how the work actually happens as they build.
        </p>
      </div>

      <div className="card">
        <h2>The seven stages</h2>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 0, minWidth: '1200px', alignItems: 'stretch' }}>
            {STAGES.map((stage, i) => (
              <div key={stage.name} style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    style={{
                      alignSelf: 'center',
                      flexShrink: 0,
                      width: 0,
                      height: 0,
                      margin: '0 var(--space-sm)',
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderLeft: '6px solid var(--teal-500)',
                    }}
                  />
                )}
                <div
                  style={{
                    flex: 1,
                    padding: 'var(--space-md) var(--space-md) 0',
                    borderTop: '3px solid',
                    borderImage: 'var(--gradient-brand) 1',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.75rem', color: 'var(--neutral-500)', margin: '0 0 2px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <p style={{ fontWeight: 600, margin: '0 0 var(--space-xs)' }}>{stage.name}</p>
                  <p style={{ fontSize: 'var(--text-sm-size)', color: 'var(--text-secondary)', margin: 0 }}>
                    {stage.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="canvas-grid" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card" style={{ borderLeft: '3px solid var(--color-action)' }}>
          <h2>In leaps</h2>
          <p>
            The right approach when the workflow and the business process
            are already well understood, well enough that a whole stage, or
            several, can be designed with confidence upfront. Value jumps
            further with each release, but the trade-off is a longer gap
            where nothing ships while that larger scope is being built, and
            a wrong assumption is more expensive to unwind once it\u2019s baked
            into something bigger.
          </p>
        </div>
        <div className="card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <h2>Through stages</h2>
          <p>
            The right approach when the workflow or business process isn\u2019t
            yet fully understood. Each stage becomes a chance to test an
            assumption against real usage before committing further, so the
            team discovers and documents how the work actually happens as
            they go. Value grows steadily, and because each release is
            small, a wrong assumption is cheap to correct.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
        <h2>Where this tool fits</h2>
        <p style={{ margin: 0 }}>
          Everything else in this reference, features, standards, decisions,
          documentation, sits at stages two and three: put it in a table,
          and visualise the table. That\u2019s real, necessary work, but it\u2019s
          also only the display layer beneath insights, actions,
          predictions, and automation. A team that\u2019s shipped a well-built
          table has covered two of seven stages, not the whole journey.
        </p>
      </div>
    </div>
  );
}
