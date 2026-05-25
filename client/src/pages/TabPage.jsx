import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductTile from '../components/ProductTile';
import { useSettings } from '../context/SettingsContext';
import { publicApi } from '../api';
import './TabPage.css';

export default function TabPage() {
  const { tabId } = useParams();
  const { settings } = useSettings();
  const [tabs, setTabs] = useState([]);
  const [tab, setTab] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getTabs().then(setTabs).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    publicApi.getTabProducts(tabId)
      .then(({ tab: t, products: p }) => {
        setTab(t);
        setProducts(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tabId]);

  return (
    <Layout tabs={tabs} settings={settings}>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : !tab ? (
        <p className="empty-msg">Category not found.</p>
      ) : (
        <>
          <header className="tab-header">
            <span className="tab-icon">{tab.icon}</span>
            <h2>{tab.name}</h2>
          </header>

          {products.length === 0 ? (
            <p className="empty-msg">No products in this category yet.</p>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductTile key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
