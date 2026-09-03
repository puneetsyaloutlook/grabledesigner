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
        rows.push({ name: field.docLabel, description: `${chosen.label}.` });
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

function buildPlainText(specification, requirementsByCategory, decisionsByCategory, references) {
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
  const tabCounts = {
    specification: specification.reduce((n, g) => n + g.rows.length, 0),
    requirements: requirements.length,
    decisions: decisions.length,
    references: references.length,
  };
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('specification');

  function handleCopy() {
    const text = buildPlainText(specification, requirementsByCategory, decisionsByCategory, references);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="content-header">
        <h1>Documentation</h1>
      </div>

      <div className="doc-sheet">
        <div className="doc-tabs-row">
          <div className="doc-tabs">
            {TABS.map((tab) => {
              const count = tabCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`doc-tab${activeTab === tab.id ? ' doc-tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}{count !== undefined ? ` (${count})` : ''}
                </button>
              );
            })}
          </div>
          <button type="button" className="button button-primary doc-copy-button" onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy as text'}
          </button>
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
              <p>No specific systems stand out for this configuration; it’s simple enough that most general-purpose table components would do.</p>
            ) : (
              <DocTable
                columnLabels={['System', 'Why it fits, and the trade-offs']}
                rows={references.map((r) => ({ name: r.name, description: describeReference(r) }))}
              />
            )}
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
