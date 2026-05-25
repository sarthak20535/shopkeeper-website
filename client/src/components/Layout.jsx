import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';
import './Layout.css';

export default function Layout({ children, tabs, settings }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="layout">
      <header className="site-header">
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>
        <h1 className="site-title">{settings?.website_name || 'Shop'}</h1>
      </header>

      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        tabs={tabs}
        settings={settings}
      />

      <main className="site-main">{children}</main>
    </div>
  );
}
