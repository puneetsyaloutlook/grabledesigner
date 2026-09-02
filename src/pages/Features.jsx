import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { selectionSchema, defaultSelections } from '../lib/selectionSchema';
import { decodeSelections, encodeSelections } from '../lib/selectionState';

function isOptionEnabled(option, selections) {
  if (!option.requires) return true;
  return Object.entries(option.requires).every(([key, allowed]) =>
    allowed.includes(selections[key])
  );
}

export default function Features() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selections, setSelections] = useState(() =>
    searchParams.toString() ? decodeSelections(searchParams) : defaultSelections()
  );

  // Keep the URL live-synced to the current selections. The sidebar (and any
  // other nav link) builds its href from the URL's own query string, so
  // without this, navigating away via the sidebar would silently carry
  // stale selections rather than whatever was just edited. `replace: true`
  // so every toggle doesn't add a new browser-history entry.
  useEffect(() => {
    setSearchParams(encodeSelections(selections), { replace: true });
  }, [selections]);

  function setField(key, value) {
    setSelections((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <div className="content-header">
        <h1>Features needed</h1>
        <p className="intro-copy">
          Specify what functions you need for the data display in your app,
          then use the sidebar to see the applicable standards or the demo.
        </p>
      </div>

      <div className="canvas-grid">
        {selectionSchema.map((group) => (
          <section key={group.group} className="card">
            <h2>{group.group}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {group.fields.map((field) => (
                <FieldControl
                  key={field.key}
                  field={field}
                  value={selections[field.key]}
                  selections={selections}
                  onChange={(value) => setField(field.key, value)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="debug-panel">
        <strong>Current selections (debug)</strong>
        <pre>{JSON.stringify(selections, null, 2)}</pre>
      </div>
    </div>
  );
}

function FieldControl({ field, value, selections, onChange }) {
  if (field.type === 'boolean') {
    return (
      <div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span>
            {field.question}
            {field.detail && (
              <span style={{ display: 'block', fontSize: 'var(--text-sm-size)', color: 'var(--text-secondary)', marginTop: 2 }}>
                {field.detail}
              </span>
            )}
          </span>
        </label>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontWeight: 500, margin: '0 0 var(--space-xs)' }}>{field.question}</p>
      {field.detail && (
        <p style={{ fontSize: 'var(--text-sm-size)', color: 'var(--text-secondary)', margin: '0 0 var(--space-sm)' }}>
          {field.detail}
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        {field.options.map((option) => {
          const enabled = isOptionEnabled(option, selections);
          return (
            <button
              key={option.value}
              type="button"
              disabled={!enabled}
              onClick={() => onChange(option.value)}
              className="button"
              style={{
                background: value === option.value ? 'var(--teal-100)' : undefined,
                borderColor: value === option.value ? 'var(--color-primary)' : undefined,
                opacity: enabled ? 1 : 0.4,
                cursor: enabled ? 'pointer' : 'not-allowed',
              }}
              title={option.detail}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
