import { NavLink, Outlet, useSearchParams } from 'react-router-dom';
import { STEPS, FRAMEWORK_ITEM } from '../lib/navSteps';
import logoIcon from '../assets/icon-logo.svg';
import checkIcon from '../assets/icon-check.svg';

const NAV_ITEMS = [...STEPS, FRAMEWORK_ITEM];

export default function Layout() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : '';

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="side-nav-brand">
          <NavLink to={`/${suffix}`} className="side-nav-title">
            <img src={logoIcon} alt="" className="side-nav-logo" />
            <span>Grid &amp; Table Designer</span>
          </NavLink>
          <p className="side-nav-tagline">Encouraging your data display behaviours.</p>
        </div>
        <div className="side-nav-cards">
          {NAV_ITEMS.map((item) => (
            <div key={item.to}>
              {item.separate && (
                <div className="nav-separator" aria-hidden="true" />
              )}
              <NavLink
                to={`${item.to}${suffix}`}
                end={item.end}
                className={({ isActive }) =>
                  `nav-card${isActive ? ' nav-card-active' : ''}${item.separate ? ' nav-card-standalone' : ''}`
                }
              >
                {!item.separate && (
                  <img src={checkIcon} alt="" className="nav-card-icon" />
                )}
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
