import { STATUS_TONE } from '../lib/formatCell';

export default function StatusIndicator({ value }) {
  const tone = STATUS_TONE[value];
  if (!tone) return null;
  return <span className={`status-dot status-dot-${tone}`} aria-hidden="true" />;
}
