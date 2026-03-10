import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Customer, Product, ProductCategory, Invoice, FbrSettings } from '@/types';
import { api } from '@/services/api';

interface DataContextType {
  customers: Customer[];
  products: Product[];
  categories: ProductCategory[];
  invoices: Invoice[];
  fbrSettings: FbrSettings;
  loading: boolean;
  setFbrSettings: (s: FbrSettings) => void;
  addCustomer: (c: Omit<Customer, 'id'>) => Promise<Customer>;
  updateCustomer: (id: string, c: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addProduct: (p: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (c: Omit<ProductCategory, 'id'>) => Promise<ProductCategory>;
  deleteCategory: (id: string) => Promise<void>;
  addInvoice: (inv: Omit<Invoice, 'id' | 'createdAt'>) => Promise<Invoice>;
  updateInvoice: (id: string, inv: Partial<Invoice>) => Promise<void>;
  getNextInvoiceNo: () => Promise<string>;
  refreshInvoices: () => Promise<void>;
}

const DataContext = createContext<DataContextType>(null!);

const defaultFbrSettings: FbrSettings = {
  sellerNtn: '0709343',
  apiToken: 'c8763407-71df-317d-9698-0d201540e71c',
  mode: 'Sandbox',
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fbrSettings, setFbrSettingsState] = useState<FbrSettings>(defaultFbrSettings);
  const [loading, setLoading] = useState(true);

  // Load all data from API on startup
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [c, p, cat, inv, fbr] = await Promise.all([
          api.getCustomers(),
          api.getProducts(),
          api.getCategories(),
          api.getInvoices(),
          api.getFbrSettings(),
        ]);
        setCustomers(c);
        setProducts(p);
        setCategories(cat);
        setInvoices(inv);
        if (fbr && fbr.sellerNtn) setFbrSettingsState(fbr);
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const setFbrSettings = useCallback(async (s: FbrSettings) => {
    setFbrSettingsState(s);
    await api.saveFbrSettings(s);
  }, []);

  // Customers
  const addCustomer = useCallback(async (c: Omit<Customer, 'id'>) => {
    const newC = await api.addCustomer(c);
    setCustomers(prev => [...prev, newC]);
    return newC;
  }, []);

  const updateCustomer = useCallback(async (id: string, data: Partial<Customer>) => {
    const existing = customers.find(c => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...data };
    await api.updateCustomer(id, updated);
    setCustomers(prev => prev.map(c => c.id === id ? updated : c));
  }, [customers]);

  const deleteCustomer = useCallback(async (id: string) => {
    await api.deleteCustomer(id);
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  // Products
  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {
    const newP = await api.addProduct(p);
    setProducts(prev => [...prev, newP]);
    return newP;
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const existing = products.find(p => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...data };
    await api.updateProduct(id, updated);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Categories
  const addCategory = useCallback(async (c: Omit<ProductCategory, 'id'>) => {
    const newC = await api.addCategory(c);
    setCategories(prev => [...prev, newC]);
    return newC;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // Invoices
  const addInvoice = useCallback(async (inv: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInv = await api.addInvoice(inv);
    setInvoices(prev => [newInv, ...prev]);
    return newInv;
  }, []);

  const updateInvoice = useCallback(async (id: string, data: Partial<Invoice>) => {
    const existing = invoices.find(inv => inv.id === id);
    if (!existing) return;
    const updated = { ...existing, ...data };
    await api.updateInvoice(id, updated);
    setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
  }, [invoices]);

  const getNextInvoiceNo = useCallback(async () => {
    const res = await api.getNextInvoiceNo();
    return res.invoiceNo;
  }, []);

  const refreshInvoices = useCallback(async () => {
    const inv = await api.getInvoices();
    setInvoices(inv);
  }, []);

  return (
    <DataContext.Provider value={{
      customers, products, categories, invoices,
      fbrSettings, loading, setFbrSettings,
      addCustomer, updateCustomer, deleteCustomer,
      addProduct, updateProduct, deleteProduct,
      addCategory, deleteCategory,
      addInvoice, updateInvoice, getNextInvoiceNo,
      refreshInvoices,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
