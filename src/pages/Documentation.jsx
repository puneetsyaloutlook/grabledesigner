import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { selectionSchema, computeDerivedFlags } from '../lib/selectionSchema';
import { applicableStandards } from '../lib/standards';
import { applicableDecisions } from '../lib/decisions';
import { applicableReferences } from '../lib/referenceSystems';

const TABS = [
  { id: 'specification', label: 'Specification' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'decisions', label: 'Design decisions' },
  { id: 'references', label: 'Reference systems' },
  { id: 'scope', label: 'Scope' },
  { id: 'delivery', label: 'Delivery approach' },
];

// Every row in every table is a { name, description } pair, one shape used
// throughout the page rather than a different structure per section.

function summariseSelections(selections) {
  const items = [];
  selectionSchema.forEach((group) => {
    const rows = [];
    group.fields.forEach((field) => {
      const value = selections[field.key];
      if (field.type === 'boolean') {
        if (value) rows.push({ name: field.docLabel, description: field.docDescription });
        return;
      }
      const chosen = field.options.find((o) => o.value === value);
      if (chosen && value !== 'none') {
        rows.push({ name: field.docLabel, description: `Specified as: ${chosen.label}.` });
      }
    });
    if (rows.length > 0) items.push({ group: group.group, rows });
  });
  return items;
}

function groupByCategory(list) {
  const byCategory = {};
  list.forEach((entry) => {
    (byCategory[entry.category] ||= []).push(entry);
  });
  return byCategory;
}

function describeRequirement(entry) {
  return `${entry.why} Typically satisfied by: ${entry.typical}`;
}

function describeDecision(entry) {
  const chosenOptions = entry.options.filter((o) => o.chosen);
  const chosenText = chosenOptions.map((o) => `${o.label} (${o.note})`).join('; ');
  const rejected = entry.options.filter((o) => !o.chosen);
  const rejectedText = rejected.length > 0
    ? ' Not used: ' + rejected.map((r) => `${r.label} (${r.note})`).join(' ')
    : '';
  return `Chosen: ${chosenText}.${rejectedText} ${entry.tradeoff}`;
}

function describeReference(entry) {
  return `${entry.summary} Pros: ${entry.pros.join('; ')}. Cons: ${entry.cons.join('; ')}.`;
}

function DocTable({ columnLabels, rows }) {
  return (
    <table className="doc-table">
      <thead>
        <tr>
          <th scope="col">{columnLabels[0]}</th>
          <th scope="col">{columnLabels[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td>{row.name}</td>
            <td>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function buildPlainText(specification, requirementsByCategory, decisionsByCategory, references, scopeText, deliveryText) {
  const lines = [];
  lines.push('DOCUMENTATION');

  lines.push('', 'Specification');
  specification.forEach(({ group, rows }) => {
    lines.push('', group);
    rows.forEach((r) => lines.push(`- ${r.name}: ${r.description}`));
  });

  lines.push('', 'Requirements');
  Object.entries(requirementsByCategory).forEach(([category, entries]) => {
    lines.push('', category);
    entries.forEach((e) => lines.push(`- ${e.requirement}: ${describeRequirement(e)}`));
  });

  lines.push('', 'Design decisions');
  Object.entries(decisionsByCategory).forEach(([category, entries]) => {
    lines.push('', category);
    entries.forEach((d) => lines.push(`- ${d.title}: ${describeDecision(d)}`));
  });

  lines.push('', 'Reference systems');
  references.forEach((r) => lines.push(`- ${r.name}: ${describeReference(r)}`));

  lines.push('', 'Scope', scopeText);
  lines.push('', 'Delivery approach', deliveryText);

  return lines.join('\n');
}

export default function Documentation() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);
  const requirements = applicableStandards(selections, derived);
  const decisions = applicableDecisions(selections, derived);
  const references = applicableReferences(selections, derived);
  const specification = summariseSelections(selections);
  const requirementsByCategory = groupByCategory(requirements);
  const decisionsByCategory = groupByCategory(decisions);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('specification');

  const totalComplexity = requirements.length + decisions.length;
  const scopeText = 'Grid and table work sits at the "put it in a table" and "visualise the table" stages of the analytics product journey, the display layer underneath insights, actions, predictions and automation. See the Framework page for the full seven-stage picture.';
  const deliveryText = totalComplexity >= 15
    ? `This configuration carries ${totalComplexity} standards and decisions combined. Build it incrementally: ship the simpler capabilities first and add the rest in later passes, rather than one release carrying all of it.`
    : `This configuration carries ${totalComplexity} standards and decisions combined, a contained amount. Incremental and single-release delivery are both reasonable here. The choice is a team preference, not a risk-driven one.`;

  function handleCopy() {
    const text = buildPlainText(specification, requirementsByCategory, decisionsByCategory, references, scopeText, deliveryText);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>Documentation</h1>
          <p className="intro-copy" style={{ maxWidth: 'none' }}>
            {specification.reduce((n, g) => n + g.rows.length, 0)} specified items,{' '}
            {requirements.length} requirements, {decisions.length} decisions, {references.length} reference systems.
          </p>
        </div>
        <button type="button" className="button button-primary" onClick={handleCopy} style={{ flexShrink: 0 }}>
          {copied ? 'Copied' : 'Copy as text'}
        </button>
      </div>

      <div className="doc-sheet">
        <div className="doc-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`doc-tab${activeTab === tab.id ? ' doc-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'specification' && (
          <section>
            {specification.length === 0 ? (
              <p>Nothing specified yet. Go to Features needed to start.</p>
            ) : (
              specification.map(({ group, rows }) => (
                <div key={group} className="doc-group">
                  <h3>{group}</h3>
                  <DocTable columnLabels={['Field', 'Specified value']} rows={rows} />
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === 'requirements' && (
          <section>
            {requirements.length === 0 ? (
              <p>No requirements beyond the baseline data-formatting rules.</p>
            ) : (
              Object.entries(requirementsByCategory).map(([category, entries]) => (
                <div key={category} className="doc-group">
                  <h3>{category}</h3>
                  <DocTable
                    columnLabels={['Requirement', 'Description']}
                    rows={entries.map((e) => ({ name: e.requirement, description: describeRequirement(e) }))}
                  />
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === 'decisions' && (
          <section>
            {decisions.length === 0 ? (
              <p>No decision points apply to this configuration.</p>
            ) : (
              Object.entries(decisionsByCategory).map(([category, entries]) => (
                <div key={category} className="doc-group">
                  <h3>{category}</h3>
                  <DocTable
                    columnLabels={['Decision', 'Description']}
                    rows={entries.map((d) => ({ name: d.title, description: describeDecision(d) }))}
                  />
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === 'references' && (
          <section>
            {references.length === 0 ? (
              <p>No specific systems stand out for this configuration; it\u2019s simple enough that most general-purpose table components would do.</p>
            ) : (
              <DocTable
                columnLabels={['System', 'Why it fits, and the trade-offs']}
                rows={references.map((r) => ({ name: r.name, description: describeReference(r) }))}
              />
            )}
          </section>
        )}

        {activeTab === 'scope' && (
          <section>
            <p>{scopeText}</p>
          </section>
        )}

        {activeTab === 'delivery' && (
          <section>
            <p>{deliveryText}</p>
          </section>
        )}
      </div>

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify({ selections, derived }, null, 2)}</pre>
      </div>
    </div>
  );
}
