import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <nav className="navigation">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            <h2>ScreenScore</h2>
          </Link>
          
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${isActive('/')}`}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/sessions" className={`nav-link ${isActive('/sessions')}`}>
                Sessions
              </Link>
            </li>
            <li>
              <Link to="/categories" className={`nav-link ${isActive('/categories')}`}>
                Categories
              </Link>
            </li>
            <li>
              <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>
                Analytics
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;