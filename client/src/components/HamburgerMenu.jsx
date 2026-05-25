import { Link } from 'react-router-dom';
import './HamburgerMenu.css';

export default function HamburgerMenu({ isOpen, onClose, tabs, settings }) {
  return (
    <>
      <div className={`menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2>{settings?.website_name || 'Shop'}</h2>
          <button className="menu-close" onClick={onClose} aria-label="Close menu">×</button>
        </div>

        <ul className="menu-links">
          <li>
            <Link to="/" onClick={onClose}>🏠 Home</Link>
          </li>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <Link to={`/category/${tab.id}`} onClick={onClose}>
                {tab.icon} {tab.name}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/contact" onClick={onClose}>📍 Shop Info</Link>
          </li>
        </ul>

        <div className="menu-footer">
          <Link to="/admin" className="admin-link" onClick={onClose}>Admin Login</Link>
        </div>
      </nav>
    </>
  );
}
