export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Customer {
  id: string;
  companyName: string;
  ntn: string;
  strn: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  standardPrice: number;
  status: 'Active' | 'Inactive';
  category?: string;
}

export interface SubItem {
  id: string;
  article: string;
  color: string;
  pcs: number;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  hsCode: string;
  uom: string;
  quantity: number;
  rate: number;
  amount: number;
  subItems?: SubItem[];
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  customerId: string;
  customerName: string;
  customerNtn: string;
  customerStrn: string;
  customerAddress: string;
  customerProvince: string;
  items: InvoiceItem[];
  subtotal: number;
  cartage: number;
  gstAmount: number;
  grandTotal: number;
  fbrStatus: 'Not Sent' | 'Pending' | 'Accepted' | 'Failed' | 'Rejected';
  fbrInvoiceNo: string;
  fbrQrCode?: string;
  fbrSubmittedAt?: string;
  fbrErrorResponse?: string;
  scenarioId?: string;
  buyerRegistrationType?: string;
  status: 'Draft' | 'Submitted';
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  ntn: string;
  strn: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

export interface FbrSettings {
  sellerNtn: string;
  apiToken: string;
  mode: 'Sandbox' | 'Production';
}

export interface BankSettings {
  bankName: string;
  branchName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
}
