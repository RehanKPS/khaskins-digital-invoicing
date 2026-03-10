import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Customer, Product, ProductCategory, Invoice, FbrSettings } from '@/types';

interface DataContextType {
  customers: Customer[];
  products: Product[];
  categories: ProductCategory[];
  invoices: Invoice[];
  fbrSettings: FbrSettings;
  setFbrSettings: (s: FbrSettings) => void;
  addCustomer: (c: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (c: Omit<ProductCategory, 'id'>) => ProductCategory;
  deleteCategory: (id: string) => void;
  addInvoice: (inv: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, inv: Partial<Invoice>) => void;
  getNextInvoiceNo: () => string;
}

const DataContext = createContext<DataContextType>(null!);

const LS_KEYS = {
  customers: 'khaskins_customers',
  products: 'khaskins_products',
  invoices: 'khaskins_invoices',
  categories: 'khaskins_categories',
  settings: 'khaskins_settings',
};

const loadFromLS = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
};

const defaultFbrSettings: FbrSettings = {
  sellerNtn: '0709343',
  apiToken: 'c8763407-71df-317d-9698-0d201540e71c',
  mode: 'Sandbox',
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromLS(LS_KEYS.customers, []));
  const [products, setProducts] = useState<Product[]>(() => loadFromLS(LS_KEYS.products, []));
  const [categories, setCategories] = useState<ProductCategory[]>(() => loadFromLS(LS_KEYS.categories, []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromLS(LS_KEYS.invoices, []));
  const [fbrSettings, setFbrSettingsState] = useState<FbrSettings>(() => loadFromLS(LS_KEYS.settings, defaultFbrSettings));

  useEffect(() => { localStorage.setItem(LS_KEYS.customers, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(LS_KEYS.products, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(LS_KEYS.categories, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(LS_KEYS.invoices, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(LS_KEYS.settings, JSON.stringify(fbrSettings)); }, [fbrSettings]);

  const setFbrSettings = useCallback((s: FbrSettings) => { setFbrSettingsState(s); }, []);

  const addCustomer = useCallback((c: Omit<Customer, 'id'>) => {
    const newC = { ...c, id: String(Date.now()) };
    setCustomers(prev => [...prev, newC]);
    return newC;
  }, []);

  const updateCustomer = useCallback((id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    const newP = { ...p, id: String(Date.now()) };
    setProducts(prev => [...prev, newP]);
    return newP;
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addCategory = useCallback((c: Omit<ProductCategory, 'id'>) => {
    const newC = { ...c, id: String(Date.now()) };
    setCategories(prev => [...prev, newC]);
    return newC;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const getNextInvoiceNo = useCallback(() => {
    const year = new Date().getFullYear();
    const maxNo = invoices
      .map(inv => {
        const parts = inv.invoiceNo?.split('-');
        return parts?.length === 3 ? parseInt(parts[2]) : 0;
      })
      .reduce((max, n) => Math.max(max, n), 0);
    return `KHK-${year}-${String(maxNo + 1).padStart(4, '0')}`;
  }, [invoices]);

  const addInvoice = useCallback((inv: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInv: Invoice = { ...inv, id: String(Date.now()), createdAt: new Date().toISOString() };
    setInvoices(prev => [...prev, newInv]);
    return newInv;
  }, []);

  const updateInvoice = useCallback((id: string, data: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...data } : inv));
  }, []);

  return (
    <DataContext.Provider value={{
      customers, products, categories, invoices,
      fbrSettings, setFbrSettings,
      addCustomer, updateCustomer, deleteCustomer,
      addProduct, updateProduct, deleteProduct,
      addCategory, deleteCategory,
      addInvoice, updateInvoice, getNextInvoiceNo,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
