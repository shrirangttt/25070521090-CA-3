import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

const Nav = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('mediconnect_token');
    setIsLoggedIn(!!token);
  }, [location]);

  return (
    <nav className="my-nav">
      <div className="nav-wrapper">
        <Link to="/" className="brand-logo">
          <span>🏥</span> MediConnect
        </Link>
        <ul className="d-flex" style={{ listStyle: "none" }}>
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
              About
            </Link>
          </li>
          <li>
            <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>
              Services & OPD
            </Link>
          </li>
          <li>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
              Appointments (CRUD)
            </Link>
          </li>
          <li>
            <Link to="/login" className={location.pathname === '/login' ? 'nav-btn' : 'nav-login-link'}>
              {isLoggedIn ? '🧑‍⚕️ My Profile' : '🔐 Sign In / Register'}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
