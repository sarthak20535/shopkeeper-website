import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi, clearToken, getToken } from '../api';
import ProductTile from '../components/ProductTile';
import './AdminDashboard.css';

const EMPTY_PRODUCT = {
  tab_id: '',
  name: '',
  image_url: '',
  size: '',
  price: '',
  description: '',
  tile_bg_color: '#ffffff',
  tile_text_color: '#1f2937',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('settings');
  const [settings, setSettings] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [products, setProducts] = useState([]);
  const [tabForm, setTabForm] = useState({ name: '', icon: '📦' });
  const [editingTab, setEditingTab] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate('/admin');
      return;
    }
    loadAll();
  }, [navigate]);

  async function loadAll() {
    try {
      const [s, t, p] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getTabs(),
        adminApi.getProducts(),
      ]);
      setSettings(s);
      setTabs(t);
      setProducts(p);
    } catch {
      clearToken();
      navigate('/admin');
    }
  }

  function flash(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  async function saveSettings(e) {
    e.preventDefault();
    const updated = await adminApi.updateSettings(settings);
    setSettings(updated);
    flash('Shop settings saved!');
  }

  async function saveTab(e) {
    e.preventDefault();
    if (editingTab) {
      await adminApi.updateTab(editingTab.id, tabForm);
      flash('Category updated!');
    } else {
      await adminApi.createTab(tabForm);
      flash('Category added!');
    }
    setTabForm({ name: '', icon: '📦' });
    setEditingTab(null);
    setTabs(await adminApi.getTabs());
  }

  async function deleteTab(id) {
    if (!confirm('Delete this category and all its products?')) return;
    await adminApi.deleteTab(id);
    setTabs(await adminApi.getTabs());
    setProducts(await adminApi.getProducts());
    flash('Category deleted.');
  }

  async function saveProduct(e) {
    e.preventDefault();
    if (!productForm.tab_id) {
      flash('Please select a category first.');
      return;
    }
    const payload = { ...productForm, tab_id: productForm.tab_id };
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
        flash('Product updated!');
      } else {
        await adminApi.createProduct(payload);
        flash('Product added!');
      }
      setProductForm(EMPTY_PRODUCT);
      setEditingProduct(null);
      setProducts(await adminApi.getProducts());
    } catch (err) {
      flash(err.message);
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    await adminApi.deleteProduct(id);
    setProducts(await adminApi.getProducts());
    flash('Product deleted.');
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminApi.uploadImage(file);
      setProductForm((f) => ({ ...f, image_url: url }));
      flash('Image uploaded!');
    } catch (err) {
      flash(err.message);
    } finally {
      setUploading(false);
    }
  }

  function startEditTab(tab) {
    setEditingTab(tab);
    setTabForm({ name: tab.name, icon: tab.icon });
    setActiveSection('tabs');
  }

  function startEditProduct(product) {
    setEditingProduct(product);
    setProductForm({
      tab_id: String(product.tab_id),
      name: product.name,
      image_url: product.image_url,
      size: product.size,
      price: product.price,
      description: product.description,
      tile_bg_color: product.tile_bg_color,
      tile_text_color: product.tile_text_color,
    });
    setActiveSection('products');
  }

  function logout() {
    clearToken();
    navigate('/admin');
  }

  if (!settings) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p>{settings.website_name}</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/" className="btn-secondary">View Shop</Link>
          <button onClick={logout} className="btn-outline">Logout</button>
        </div>
      </header>

      {message && <div className="admin-toast">{message}</div>}

      <nav className="admin-nav">
        {['settings', 'tabs', 'products'].map((s) => (
          <button
            key={s}
            className={activeSection === s ? 'active' : ''}
            onClick={() => setActiveSection(s)}
          >
            {s === 'settings' && 'Shop Settings'}
            {s === 'tabs' && 'Menu Categories'}
            {s === 'products' && 'Products'}
          </button>
        ))}
      </nav>

      <div className="admin-content">
        {activeSection === 'settings' && (
          <section className="admin-section">
            <h2>Shop Settings</h2>
            <form className="admin-form" onSubmit={saveSettings}>
              <label>Website Name<input value={settings.website_name} onChange={(e) => setSettings({ ...settings, website_name: e.target.value })} /></label>
              <label>Shopkeeper Name<input value={settings.shopkeeper_name} onChange={(e) => setSettings({ ...settings, shopkeeper_name: e.target.value })} /></label>
              <label>Mobile<input value={settings.mobile} onChange={(e) => setSettings({ ...settings, mobile: e.target.value })} /></label>
              <label>Address<textarea value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} rows={2} /></label>
              <label>City<input value={settings.city} onChange={(e) => setSettings({ ...settings, city: e.target.value })} /></label>
              <div className="color-row">
                <label>Primary Color<input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} /></label>
                <label>Accent Color<input type="color" value={settings.accent_color} onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })} /></label>
              </div>
              <button type="submit" className="btn-primary">Save Settings</button>
            </form>
          </section>
        )}

        {activeSection === 'tabs' && (
          <section className="admin-section">
            <h2>{editingTab ? 'Edit Category' : 'Add Menu Category'}</h2>
            <p className="section-desc">Categories appear as tabs in the hamburger menu.</p>
            <form className="admin-form inline-form" onSubmit={saveTab}>
              <label>Name<input value={tabForm.name} onChange={(e) => setTabForm({ ...tabForm, name: e.target.value })} required placeholder="e.g. Groceries" /></label>
              <label>Icon (emoji)<input value={tabForm.icon} onChange={(e) => setTabForm({ ...tabForm, icon: e.target.value })} placeholder="📦" /></label>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{editingTab ? 'Update' : 'Add Category'}</button>
                {editingTab && <button type="button" className="btn-outline" onClick={() => { setEditingTab(null); setTabForm({ name: '', icon: '📦' }); }}>Cancel</button>}
              </div>
            </form>

            <h3>Your Categories</h3>
            <ul className="admin-list">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <span>{tab.icon} {tab.name}</span>
                  <div>
                    <button onClick={() => startEditTab(tab)}>Edit</button>
                    <button className="danger" onClick={() => deleteTab(tab.id)}>Delete</button>
                  </div>
                </li>
              ))}
              {tabs.length === 0 && <li className="empty">No categories yet.</li>}
            </ul>
          </section>
        )}

        {activeSection === 'products' && (
          <section className="admin-section">
            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <p className="section-desc">Customize each product tile — name, image, size, colors, and more.</p>

            {tabs.length === 0 ? (
              <p className="section-desc">Add at least one category under <strong>Menu Categories</strong> before adding products.</p>
            ) : (
            <form className="admin-form product-form" onSubmit={saveProduct}>
              <label>
                Category
                <select value={productForm.tab_id} onChange={(e) => setProductForm({ ...productForm, tab_id: e.target.value })} required>
                  <option value="">Select category</option>
                  {tabs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label>Product Name<input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required /></label>
              <label>Size<input value={productForm.size} onChange={(e) => setProductForm({ ...productForm, size: e.target.value })} placeholder="e.g. 500g, Large, 32 inch" /></label>
              <label>Price (display only)<input value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="e.g. ₹299" /></label>
              <label>Description<textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={2} /></label>

              <label>
                Product Image
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {uploading && <span className="upload-status">Uploading...</span>}
              </label>
              {productForm.image_url && (
                <div className="image-preview">
                  <img src={productForm.image_url} alt="Preview" />
                  <input value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="Or paste image URL" />
                </div>
              )}

              <div className="color-row">
                <label>Tile Background<input type="color" value={productForm.tile_bg_color} onChange={(e) => setProductForm({ ...productForm, tile_bg_color: e.target.value })} /></label>
                <label>Tile Text Color<input type="color" value={productForm.tile_text_color} onChange={(e) => setProductForm({ ...productForm, tile_text_color: e.target.value })} /></label>
              </div>

              <div className="tile-preview-wrap">
                <p>Tile Preview</p>
                <div className="tile-preview-box">
                  <ProductTile product={{ ...productForm, name: productForm.name || 'Product Name' }} />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={!productForm.tab_id}>{editingProduct ? 'Update Product' : 'Add Product'}</button>
                {editingProduct && <button type="button" className="btn-outline" onClick={() => { setEditingProduct(null); setProductForm(EMPTY_PRODUCT); }}>Cancel</button>}
              </div>
            </form>
            )}

            <h3>All Products ({products.length})</h3>
            <div className="admin-products-grid">
              {products.map((p) => {
                const tab = tabs.find((t) => t.id === p.tab_id);
                return (
                  <div key={p.id} className="admin-product-item">
                    <ProductTile product={p} />
                    <p className="product-tab-label">{tab?.name || 'Unknown'}</p>
                    <div className="product-item-actions">
                      <button onClick={() => startEditProduct(p)}>Edit</button>
                      <button className="danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
