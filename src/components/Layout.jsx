import { NavLink, Outlet, useSearchParams } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Features needed', end: true },
  { to: '/experience', label: 'Experience' },
  { to: '/standards', label: 'Applicable standards' },
  { to: '/framework', label: 'Framework' },
];

export default function Layout() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : '';

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="top-nav-inner">
          <NavLink to={`/${suffix}`} className="site-title">
            Grid and table UX reference
          </NavLink>
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={`${item.to}${suffix}`}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
