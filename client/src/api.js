const TOKEN_KEY = 'shop_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(url, options = {}) {
  const headers = { ...options.headers };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.auth) {
    headers.Authorization = `Bearer ${getToken()}`;
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const publicApi = {
  getSettings: () => request('/api/public/settings'),
  getTabs: () => request('/api/public/tabs'),
  getTabProducts: (tabId) => request(`/api/public/tabs/${tabId}/products`),
};

export const adminApi = {
  login: (username, password) =>
    request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getSettings: () => request('/api/admin/settings', { auth: true }),
  updateSettings: (data) =>
    request('/api/admin/settings', { method: 'PUT', auth: true, body: JSON.stringify(data) }),
  getTabs: () => request('/api/admin/tabs', { auth: true }),
  createTab: (data) =>
    request('/api/admin/tabs', { method: 'POST', auth: true, body: JSON.stringify(data) }),
  updateTab: (id, data) =>
    request(`/api/admin/tabs/${id}`, { method: 'PUT', auth: true, body: JSON.stringify(data) }),
  deleteTab: (id) => request(`/api/admin/tabs/${id}`, { method: 'DELETE', auth: true }),
  getProducts: (tabId) =>
    request(`/api/admin/products${tabId ? `?tab_id=${tabId}` : ''}`, { auth: true }),
  createProduct: (data) =>
    request('/api/admin/products', { method: 'POST', auth: true, body: JSON.stringify(data) }),
  updateProduct: (id, data) =>
    request(`/api/admin/products/${id}`, { method: 'PUT', auth: true, body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE', auth: true }),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return request('/api/admin/upload', { method: 'POST', auth: true, body: form });
  },
};
