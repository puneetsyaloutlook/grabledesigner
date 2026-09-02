import { NavLink, Outlet, useSearchParams } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Features needed', detail: 'What functionality does the data display need to have?', end: true },
  { to: '/standards', label: 'Applicable standards', detail: 'Based on that functionality, which UX standards apply?' },
  { to: '/experience', label: 'Experience', detail: 'A quick demo of how those functions and standards look in the UI.' },
  { to: '/documentation', label: 'Documentation', detail: 'The net result \u2014 what to actually build, and why.' },
  { to: '/framework', label: 'Framework', detail: 'Where does tabular data fit in the bigger picture?' },
];

export default function Layout() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : '';

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <NavLink to={`/${suffix}`} className="side-nav-title">
          Grid and table<br />UX reference
        </NavLink>
        <div className="side-nav-cards">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={`${item.to}${suffix}`}
              end={item.end}
              className={({ isActive }) => `nav-card${isActive ? ' nav-card-active' : ''}`}
            >
              <span className="nav-card-label">{item.label}</span>
              <span className="nav-card-detail">{item.detail}</span>
            </NavLink>
          ))}
        </div>
      </aside>
      <main className="canvas">
        <Outlet />
      </main>
    </div>
  );
}
