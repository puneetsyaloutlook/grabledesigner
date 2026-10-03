import { selectionSchema, defaultSelections } from './selectionSchema';

// Flat list of every field, regardless of group, for lookup by key.
const allFields = selectionSchema.flatMap((group) => group.fields);

export function encodeSelections(selections) {
  const params = new URLSearchParams();
  allFields.forEach((field) => {
    const value = selections[field.key];
    if (value === undefined || value === null) return;
    if (field.type === 'multi') {
      if (Array.isArray(value) && value.length > 0) params.set(field.key, value.join(','));
      return;
    }
    params.set(field.key, String(value));
  });
  return params.toString();
}

export function decodeSelections(searchParams) {
  const defaults = defaultSelections();
  const result = { ...defaults };
  allFields.forEach((field) => {
    const raw = searchParams.get(field.key);
    if (raw === null) return;
    if (field.type === 'boolean') {
      result[field.key] = raw === 'true';
    } else if (field.type === 'multi') {
      result[field.key] = raw === '' ? [] : raw.split(',');
    } else {
      result[field.key] = raw;
    }
  });
  return result;
}
