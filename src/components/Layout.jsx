import { NavLink, Outlet, useSearchParams } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Features needed', detail: 'What functionality does the data display need to have?', end: true },
  { to: '/standards', label: 'Applicable standards', detail: 'Based on that functionality, which UX standards apply?' },
  { to: '/experience', label: 'Experience', detail: 'A quick demo of how those functions and standards look in the UI.' },
  { to: '/documentation', label: 'Documentation', detail: 'The net result: what to actually build, and why.' },
  { to: '/framework', label: 'Framework', detail: 'The bigger picture this tool\u2019s work sits inside.', separate: true },
];

export default function Layout() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : '';

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="side-nav-brand">
          <NavLink to={`/${suffix}`} className="side-nav-title">
            Grid & Table Designer
          </NavLink>
          <p className="side-nav-tagline">Encouraging your data display behaviours.</p>
        </div>
        <div className="side-nav-cards">
          {NAV_ITEMS.map((item, i) => (
            <div key={item.to}>
              {item.separate ? (
                <div className="nav-separator" aria-hidden="true" />
              ) : (
                i > 0 && <span className="nav-step-arrow" aria-hidden="true" />
              )}
              <NavLink
                to={`${item.to}${suffix}`}
                end={item.end}
                className={({ isActive }) =>
                  `nav-card${isActive ? ' nav-card-active' : ''}${item.separate ? ' nav-card-standalone' : ''}`
                }
              >
                <span className="nav-card-label">{item.label}</span>
                <span className="nav-card-detail">{item.detail}</span>
              </NavLink>
            </div>
          ))}
        </div>
      </aside>
      <main className="canvas">
        <Outlet />
      </main>
    </div>
  );
}
