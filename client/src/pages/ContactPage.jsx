import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { publicApi } from '../api';
import './ContactPage.css';

export default function ContactPage() {
  const { settings } = useSettings();
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    publicApi.getTabs().then(setTabs).catch(console.error);
  }, []);

  const s = settings || {};

  return (
    <Layout tabs={tabs} settings={settings}>
      <div className="contact-page">
        <h2>Shop Information</h2>
        <p className="contact-note">Visit us in person — we do not take online orders.</p>

        <div className="contact-card">
          {s.shopkeeper_name && (
            <div className="contact-row">
              <span className="contact-label">Shopkeeper</span>
              <span className="contact-value">{s.shopkeeper_name}</span>
            </div>
          )}
          {s.website_name && (
            <div className="contact-row">
              <span className="contact-label">Shop Name</span>
              <span className="contact-value">{s.website_name}</span>
            </div>
          )}
          {s.mobile && (
            <div className="contact-row">
              <span className="contact-label">Mobile</span>
              <a href={`tel:${s.mobile}`} className="contact-value link">{s.mobile}</a>
            </div>
          )}
          {s.address && (
            <div className="contact-row">
              <span className="contact-label">Address</span>
              <span className="contact-value">{s.address}</span>
            </div>
          )}
          {s.city && (
            <div className="contact-row">
              <span className="contact-label">City</span>
              <span className="contact-value">{s.city}</span>
            </div>
          )}
          {!s.shopkeeper_name && !s.mobile && !s.address && !s.city && (
            <p className="empty-contact">Shop details will appear here once the shopkeeper adds them.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
