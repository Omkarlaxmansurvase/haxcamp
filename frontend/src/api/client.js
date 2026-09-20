const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const isForm = body instanceof FormData
  const headers = isForm ? {} : { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { auth: true }),

  getProducts: (category) =>
    request(`/products${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getProduct: (id) => request(`/products/${id}`),
  updateProduct: (id, payload) =>
    request(`/products/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', auth: true }),
  createProduct: (formData) => request('/products', { method: 'POST', body: formData, auth: true }),

  getCart: () => request('/cart', { auth: true }),
  addToCart: (productId, quantity = 1) =>
    request('/cart', { method: 'POST', body: { productId, quantity }, auth: true }),
  updateCartItem: (itemId, quantity) =>
    request(`/cart/${itemId}`, { method: 'PATCH', body: { quantity }, auth: true }),
  removeCartItem: (itemId) => request(`/cart/${itemId}`, { method: 'DELETE', auth: true }),

  checkout: () => request('/orders/checkout', { method: 'POST', auth: true }),
  buyNow: (productId, quantity = 1) =>
    request('/orders/buy-now', { method: 'POST', body: { productId, quantity }, auth: true }),
  myOrders: () => request('/orders/mine', { auth: true }),

  adminStats: () => request('/admin/stats', { auth: true }),
  adminOrders: () => request('/admin/orders', { auth: true }),
}

export function productImage(path) {
  if (!path) return '/images/products/placeholder.jpg'
  return path.startsWith('/') || path.startsWith('http')
    ? path
    : `/images/products/${path}`
}
