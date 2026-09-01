const STAGES = [
  { name: 'Get the data', detail: 'Validate data availability, feasibility, build data supply systems.' },
  { name: 'Put it in a table', detail: 'As the first level of UI, make the data available to users in tabular form.' },
  { name: 'Visualise the table', detail: 'Help users process the data through visualisations.' },
  { name: 'Draw out insights', detail: 'Instead of having users extract insights on their own, pull out the insights they need.' },
  { name: 'Drive actions', detail: 'Lead users from insights into actions they might take in response to the insight.' },
  { name: 'Draw out predictions', detail: 'Support predictive or proactive responses versus reactive ones.' },
  { name: 'Automate actions', detail: 'Automate actions to remove all repetitive or low-value work from the user\u2019s task.' },
];

export default function Framework() {
  return (
    <div>
      <div className="content-header">
        <p className="eyebrow">Grid and table UX reference</p>
        <h1>The analytics product journey</h1>
        <p className="intro-copy">
          Where tabular data sits, and how value tends to build from there.
          Grid and table work covers the second and third stages below;
          everything after that is built on top of what those two stages
          surface.
        </p>
      </div>

      <div className="card">
        <h2>The seven stages</h2>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 0, minWidth: '1000px' }}>
            {STAGES.map((stage, i) => (
              <div
                key={stage.name}
                style={{
                  flex: 1,
                  padding: '0 var(--space-md)',
                  borderLeft: i === 0 ? 'none' : '1px solid var(--border-default)',
                }}
              >
                <p style={{ fontWeight: 600, margin: '0 0 var(--space-xs)' }}>{stage.name}</p>
                <p style={{ fontSize: 'var(--text-sm-size)', color: 'var(--text-secondary)', margin: 0 }}>
                  {stage.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="canvas-grid" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card">
          <h2>Incremental buildout</h2>
          <p>
            Smaller value gains at each stage, but a steady climb, without
            long gaps where nothing ships.
          </p>
        </div>
        <div className="card">
          <h2>Big-bang delivery</h2>
          <p>
            Can reach higher value at a given stage, but with longer
            incubation cycles in between &mdash; periods where nothing new is
            shipping while the next jump is being built.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
        <p style={{ margin: 0 }}>
          Neither is correct by default. The right approach for a given stage
          depends on how much is already understood about what users are
          actually trying to do in their jobs, and how well that's been
          tested with what exists today.
        </p>
      </div>
    </div>
  );
}
