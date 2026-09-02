import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeSelections } from '../lib/selectionState';
import { selectionSchema, computeDerivedFlags } from '../lib/selectionSchema';
import { applicableStandards } from '../lib/standards';
import { applicableDecisions } from '../lib/decisions';

function summariseSelections(selections) {
  const items = [];
  selectionSchema.forEach((group) => {
    const groupItems = [];
    group.fields.forEach((field) => {
      const value = selections[field.key];
      if (field.type === 'boolean') {
        if (value) groupItems.push(field.question);
        return;
      }
      const chosen = field.options.find((o) => o.value === value);
      if (chosen && value !== 'none') {
        groupItems.push(`${field.question} ${chosen.label}`);
      }
    });
    if (groupItems.length > 0) items.push({ group: group.group, items: groupItems });
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

function buildPlainText(selections, summary, requirementsByCategory, decisionsByCategory, scopeText, deliveryText) {
  const lines = [];
  lines.push('DOCUMENTATION');
  lines.push('');
  lines.push('Functionality');
  summary.forEach(({ group, items }) => {
    lines.push('');
    lines.push(group);
    items.forEach((i) => lines.push(`- ${i}`));
  });
  lines.push('');
  lines.push('Requirements');
  Object.entries(requirementsByCategory).forEach(([category, entries]) => {
    lines.push('');
    lines.push(category);
    entries.forEach((e) => {
      lines.push(`- ${e.requirement}`);
      lines.push(`  Why: ${e.why}`);
      lines.push(`  Typically satisfied by: ${e.typical}`);
    });
  });
  lines.push('');
  lines.push('Design decisions');
  Object.entries(decisionsByCategory).forEach(([category, entries]) => {
    lines.push('');
    lines.push(category);
    entries.forEach((d) => {
      lines.push(`${d.title}`);
      const chosen = d.options.filter((o) => o.chosen).map((o) => o.label).join('; ');
      const rejected = d.options.filter((o) => !o.chosen);
      lines.push(`  Chosen: ${chosen}`);
      rejected.forEach((r) => lines.push(`  Not used: ${r.label}. ${r.note}`));
      lines.push(`  Rationale: ${d.tradeoff}`);
    });
  });
  lines.push('');
  lines.push('Scope');
  lines.push(scopeText);
  lines.push('');
  lines.push('Delivery approach');
  lines.push(deliveryText);
  return lines.join('\n');
}

export default function Documentation() {
  const [searchParams] = useSearchParams();
  const selections = decodeSelections(searchParams);
  const derived = computeDerivedFlags(selections);
  const requirements = applicableStandards(selections, derived);
  const decisions = applicableDecisions(selections, derived);
  const summary = summariseSelections(selections);
  const requirementsByCategory = groupByCategory(requirements);
  const decisionsByCategory = groupByCategory(decisions);
  const [copied, setCopied] = useState(false);

  const totalComplexity = requirements.length + decisions.length;
  const scopeText = 'Grid and table work sits at the "put it in a table" and "visualise the table" stages of the analytics product journey, the display layer underneath insights, actions, predictions and automation. See the Framework page for the full seven-stage picture.';
  const deliveryText = totalComplexity >= 15
    ? `This configuration carries ${totalComplexity} standards and decisions combined. Build it incrementally: ship the simpler capabilities first and add the rest in later passes, rather than one release carrying all of it.`
    : `This configuration carries ${totalComplexity} standards and decisions combined, a contained amount. Incremental and single-release delivery are both reasonable here. The choice is a team preference, not a risk-driven one.`;

  function handleCopy() {
    const text = buildPlainText(selections, summary, requirementsByCategory, decisionsByCategory, scopeText, deliveryText);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
        <div>
          <p className="eyebrow">Grid and table UX reference</p>
          <h1>Documentation</h1>
          <p className="intro-copy" style={{ marginBottom: 0 }}>
            What to build for this configuration, and why. {summary.reduce((n, g) => n + g.items.length, 0)} functionality items,{' '}
            {requirements.length} requirements, {decisions.length} decisions.
          </p>
        </div>
        <button type="button" className="button button-primary" onClick={handleCopy} style={{ flexShrink: 0 }}>
          {copied ? 'Copied' : 'Copy as text'}
        </button>
      </div>

      <div className="doc-sheet">
        <section>
          <h2>1. Functionality</h2>
          {summary.length === 0 ? (
            <p>Nothing selected yet. Go to Features needed to start.</p>
          ) : (
            summary.map(({ group, items }) => (
              <div key={group} className="doc-group">
                <h3>{group}</h3>
                <ul>
                  {items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))
          )}
        </section>

        <section>
          <h2>2. Requirements</h2>
          {requirements.length === 0 ? (
            <p>No requirements beyond the baseline data-formatting rules.</p>
          ) : (
            Object.entries(requirementsByCategory).map(([category, entries]) => (
              <div key={category} className="doc-group">
                <h3>{category}</h3>
                <ul>
                  {entries.map((entry) => (
                    <li key={entry.id}>
                      {entry.requirement}
                      <ul className="doc-sublist">
                        <li>Why: {entry.why}</li>
                        <li>Typically satisfied by: {entry.typical}</li>
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>

        <section>
          <h2>3. Design decisions</h2>
          {decisions.length === 0 ? (
            <p>No decision points apply to this configuration.</p>
          ) : (
            Object.entries(decisionsByCategory).map(([category, entries]) => (
              <div key={category} className="doc-group">
                <h3>{category}</h3>
                {entries.map((entry) => {
                  const chosen = entry.options.filter((o) => o.chosen);
                  const rejected = entry.options.filter((o) => !o.chosen);
                  return (
                    <div key={entry.id} className="doc-decision">
                      <p className="doc-decision-title">{entry.title}</p>
                      <p><strong>Chosen:</strong> {chosen.map((o) => o.label).join('; ')}</p>
                      {rejected.length > 0 && (
                        <ul className="doc-sublist">
                          {rejected.map((r, i) => <li key={i}>Not used: {r.label}. {r.note}</li>)}
                        </ul>
                      )}
                      <p><strong>Rationale:</strong> {entry.tradeoff}</p>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </section>

        <section>
          <h2>4. Scope</h2>
          <p>{scopeText}</p>
        </section>

        <section>
          <h2>5. Delivery approach</h2>
          <p>{deliveryText}</p>
        </section>
      </div>

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify({ selections, derived }, null, 2)}</pre>
      </div>
    </div>
  );
}
