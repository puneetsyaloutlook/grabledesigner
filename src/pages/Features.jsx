import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { selectionSchema, defaultSelections } from '../lib/selectionSchema';
import { decodeSelections, encodeSelections } from '../lib/selectionState';

function isOptionEnabled(option, selections) {
  if (!option.requires) return true;
  return Object.entries(option.requires).every(([key, allowed]) =>
    allowed.includes(selections[key])
  );
}

export default function Features() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selections, setSelections] = useState(() =>
    searchParams.toString() ? decodeSelections(searchParams) : defaultSelections()
  );

  function setField(key, value) {
    setSelections((prev) => ({ ...prev, [key]: value }));
  }

  function goToExperience() {
    navigate(`/experience?${encodeSelections(selections)}`);
  }

  function goToStandards() {
    navigate(`/standards?${encodeSelections(selections)}`);
  }

  return (
    <div className="page">
      <header>
        <p className="eyebrow">Grid and table UX reference</p>
        <h1>Features needed</h1>
        <p className="intro-copy">
          Answer what this screen needs. These selections carry through to the
          demo and the applicable standards, so only what's relevant shows up
          on either.
        </p>
      </header>

      {selectionSchema.map((group) => (
        <section key={group.group} style={{ marginBottom: 'var(--space-2xl)' }}>
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

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
        <button type="button" className="button button-primary" onClick={goToExperience}>
          See the experience
        </button>
        <button type="button" className="button" onClick={goToStandards}>
          See applicable standards
        </button>
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
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{field.question}</span>
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
