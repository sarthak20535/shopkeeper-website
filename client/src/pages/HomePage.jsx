import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { publicApi } from '../api';
import './HomePage.css';

export default function HomePage() {
  const { settings } = useSettings();
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    publicApi.getTabs().then(setTabs).catch(console.error);
  }, []);

  return (
    <Layout tabs={tabs} settings={settings}>
      <section className="hero">
        <h2>Welcome to {settings?.website_name || 'Our Shop'}</h2>
        <p>Browse our products below. Visit us in store — no online ordering.</p>
      </section>

      {settings?.shopkeeper_name && (
        <div className="shop-preview">
          <p><strong>{settings.shopkeeper_name}</strong></p>
          {settings.city && <p>{settings.city}</p>}
        </div>
      )}

      <section className="categories-section">
        <h3>Categories</h3>
        {tabs.length === 0 ? (
          <p className="empty-msg">No categories yet. Shopkeeper can add them from admin.</p>
        ) : (
          <div className="category-grid">
            {tabs.map((tab) => (
              <Link key={tab.id} to={`/category/${tab.id}`} className="category-card">
                <span className="cat-icon">{tab.icon}</span>
                <span className="cat-name">{tab.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Link to="/contact" className="contact-cta">View shop address & contact →</Link>
    </Layout>
  );
}
