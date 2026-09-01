import { NavLink, Outlet, useSearchParams } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Features needed', detail: 'Answer what this screen needs.', end: true },
  { to: '/standards', label: 'Applicable standards', detail: 'What already applies, given your answers.' },
  { to: '/experience', label: 'Experience', detail: 'Built to satisfy those standards.' },
  { to: '/framework', label: 'Framework', detail: 'Where tabular data fits.' },
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
