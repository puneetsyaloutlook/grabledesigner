import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// variant: 'modal' (centred overlay), 'panel' (slides from the browser's own
// right edge, full viewport height), or 'containedPanel' (slides from the
// grid's own right edge instead, constrained to the grid's own container
// rather than the browser, for when the component doesn't have portal
// access to render above the rest of the page). All three share the same
// focus-management requirement from the standards data (row-detail-focus):
// move focus in on open, trap it while open, return it to whatever
// triggered the open on close.
export default function Drawer({ open, onClose, title, children, variant = 'panel' }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement;

    const raf = requestAnimationFrame(() => {
      const heading = panelRef.current?.querySelector('h2, h3');
      (heading || panelRef.current)?.focus();
    });

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const panelClass =
    variant === 'modal' ? 'overlay-panel overlay-modal' :
    variant === 'containedPanel' ? 'overlay-panel overlay-contained-panel' :
    'overlay-panel overlay-side-panel';

  return (
    <div
      className={variant === 'containedPanel' ? 'overlay-backdrop overlay-backdrop-contained' : 'overlay-backdrop'}
      onMouseDown={onClose}
    >
      <div
        ref={panelRef}
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="overlay-header">
          <h2 id="overlay-title" tabIndex={-1}>{title}</h2>
          <button type="button" className="overlay-close" onClick={onClose} aria-label="Close">
            {'✕'}
          </button>
        </div>
        <div className="overlay-body">{children}</div>
      </div>
    </div>
  );
}
