const BASE_URL = '/api';

const getToken = () => localStorage.getItem('khaskins_token') || '';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

const req = async (method: string, path: string, body?: any) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export const api = {
  // Auth
  login: (password: string) => req('POST', '/login', { password }),

  // Customers
  getCustomers: () => req('GET', '/customers'),
  addCustomer: (data: any) => req('POST', '/customers', data),
  updateCustomer: (id: string, data: any) => req('PUT', `/customers/${id}`, data),
  deleteCustomer: (id: string) => req('DELETE', `/customers/${id}`),

  // Products
  getProducts: () => req('GET', '/products'),
  addProduct: (data: any) => req('POST', '/products', data),
  updateProduct: (id: string, data: any) => req('PUT', `/products/${id}`, data),
  deleteProduct: (id: string) => req('DELETE', `/products/${id}`),

  // Categories
  getCategories: () => req('GET', '/categories'),
  addCategory: (data: any) => req('POST', '/categories', data),
  deleteCategory: (id: string) => req('DELETE', `/categories/${id}`),

  // Invoices
  getInvoices: () => req('GET', '/invoices'),
  addInvoice: (data: any) => req('POST', '/invoices', data),
  updateInvoice: (id: string, data: any) => req('PUT', `/invoices/${id}`, data),
  getNextInvoiceNo: () => req('GET', '/invoices/next-no'),

  // Settings
  getFbrSettings: () => req('GET', '/settings/fbr'),
  saveFbrSettings: (data: any) => req('POST', '/settings/fbr', data),

  // FBR Submit proxy
  submitToFbr: (payload: any) => req('POST', '/fbr/submit', payload),
};
