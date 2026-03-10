import axios from 'axios';
import { Invoice, FbrSettings } from '@/types';

export interface ScenarioMapping {
  rate: string;
  saleType: string;
  taxMultiplier: number;
  buyerRegistrationType: 'Registered' | 'Unregistered';
  sroScheduleNo?: string;
  sroItemSerialNo?: string;
}

export const SCENARIO_MAPPINGS: Record<string, ScenarioMapping> = {
  SN001: { rate: '18%', saleType: 'Goods at standard rate (default)', taxMultiplier: 0.18, buyerRegistrationType: 'Registered' },
  SN002: { rate: '18%', saleType: 'Goods at standard rate (default)', taxMultiplier: 0.18, buyerRegistrationType: 'Unregistered' },
  SN005: { rate: '1%', saleType: 'Goods at Reduced Rate', taxMultiplier: 0.01, buyerRegistrationType: 'Unregistered', sroScheduleNo: 'EIGHTH SCHEDULE Table 1', sroItemSerialNo: '82' },
  SN006: { rate: 'Exempt', saleType: 'Exempt goods', taxMultiplier: 0, buyerRegistrationType: 'Registered', sroScheduleNo: '6th Schd Table I', sroItemSerialNo: '100' },
  SN007: { rate: '0%', saleType: 'Goods at zero-rate', taxMultiplier: 0, buyerRegistrationType: 'Unregistered' },
  SN016: { rate: '5%', saleType: 'Processing/Conversion of Goods', taxMultiplier: 0.05, buyerRegistrationType: 'Unregistered' },
  SN017: { rate: '8%', saleType: 'Goods (FED in ST Mode)', taxMultiplier: 0.08, buyerRegistrationType: 'Unregistered' },
  SN024: { rate: '25%', saleType: 'Goods as per SRO.297(|)/2023', taxMultiplier: 0.25, buyerRegistrationType: 'Unregistered', sroScheduleNo: '297(I)/2023-Table-I', sroItemSerialNo: '12' },
};

export const FBR_SALE_TYPE_OPTIONS = [
  { value: 'SN001', label: 'SN001 — Standard Rate (Registered)' },
  { value: 'SN002', label: 'SN002 — Standard Rate (Unregistered)' },
  { value: 'SN005', label: 'SN005 — Reduced Rate (8th Schedule)' },
  { value: 'SN006', label: 'SN006 — Exempt Goods (6th Schedule)' },
  { value: 'SN007', label: 'SN007 — Zero Rated (5th Schedule)' },
  { value: 'SN016', label: 'SN016 — Processing / Conversion' },
  { value: 'SN017', label: 'SN017 — FED in ST Mode (Goods)' },
  { value: 'SN024', label: 'SN024 — SRO 297(I)/2023 Goods' },
];

export const UOM_FBR_MAP: Record<string, string> = {
  'Sq Feet': 'Square feet',
  'Sq Meter': 'Square meter',
  'KG': 'KG',
  'Liter': 'Litre',
  'ML': 'Millilitre',
  'Pcs': 'Numbers, pieces, units',
  'Unit': 'Numbers, pieces, units',
  'Side': 'Numbers, pieces, units',
  'Skin': 'Numbers, pieces, units',
  'Hide': 'Numbers, pieces, units',
  'Bundle': 'Numbers, pieces, units',
  'Dozen': 'Numbers, pieces, units',
  'Roll': 'Numbers, pieces, units',
  'Drum': 'Numbers, pieces, units',
  'Carboy': 'Numbers, pieces, units',
  'Bag': 'Numbers, pieces, units',
  'Box': 'Numbers, pieces, units',
  'Carton': 'Numbers, pieces, units',
  'Case': 'Numbers, pieces, units',
  'Pallet': 'Numbers, pieces, units',
};

const mapProvince = (province: string): string => {
  const map: Record<string, string> = {
    'Punjab':      'Punjab',
    'Sindh':       'Sindh',
    'KPK':         'Khyber Pakhtunkhwa',
    'Balochistan': 'Balochistan',
    'ICT':         'Islamabad',
    'AJK':         'Azad Jammu & Kashmir',
    'GB':          'Gilgit Baltistan',
  };
  return map[province] || province || 'Sindh';
};

export const getFbrApiUrl = (mode: 'Sandbox' | 'Production') => {
  return mode === 'Production'
    ? 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata'
    : 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb';
};

const mapProvince = (province: string): string => {
  const map: Record<string, string> = {
    'Punjab':      'Punjab',
    'Sindh':       'Sindh',
    'KPK':         'Khyber Pakhtunkhwa',
    'Balochistan': 'Balochistan',
    'ICT':         'Islamabad',
    'AJK':         'Azad Jammu & Kashmir',
    'GB':          'Gilgit Baltistan',
  };
  return map[province] || province || 'Sindh';
};

export const buildFbrPayload = (invoice: Invoice, settings: FbrSettings) => {
  const scenario = SCENARIO_MAPPINGS[invoice.scenarioId || 'SN001'];
  const rawBuyerNtn = invoice.customerNtn?.replace(/\D/g, '') || '';
  const buyerNtn = rawBuyerNtn.length === 13
    ? rawBuyerNtn                          // individual CNIC — send all 13 digits
    : rawBuyerNtn.substring(0, 7) || '1000000000000'; // company NTN — first 7 digits

  return {
    invoiceType: 'Sale Invoice',
    invoiceDate: invoice.invoiceDate,
    sellerNTNCNIC: settings.sellerNtn.replace(/\D/g, '').substring(0, 7),
    sellerBusinessName: 'KHASKINS (PVT) LTD',
    sellerProvince: 'Sindh',
    sellerAddress: 'Plot#179 Sector 7-A Korangi Industrial Area Karachi',
    buyerNTNCNIC: buyerNtn,
    buyerBusinessName: invoice.customerName,
    buyerProvince: mapProvince(invoice.customerProvince || 'Sindh'),
    buyerAddress: invoice.customerAddress,
    buyerRegistrationType: invoice.buyerRegistrationType || scenario.buyerRegistrationType,
    invoiceRefNo: invoice.invoiceNo,
    scenarioId: invoice.scenarioId || 'SN001',
    items: invoice.items
      .filter(i => i.productName.toLowerCase() !== 'cartage')
      .map(item => {
        const valueSalesExcludingST = item.quantity * item.rate;
        return {
          hsCode: item.hsCode,
          productDescription: item.productName.substring(0, 100),
          rate: scenario.rate,
          uoM: UOM_FBR_MAP[item.uom] || 'Numbers, pieces, units',
          quantity: item.quantity,
          totalValues: 0,
          valueSalesExcludingST,
          fixedNotifiedValueOrRetailPrice: 0,
          salesTaxApplicable: Math.round(valueSalesExcludingST * scenario.taxMultiplier * 100) / 100,
          salesTaxWithheldAtSource: 0,
          extraTax: '',
          furtherTax: 0,
          sroScheduleNo: scenario.sroScheduleNo || '',
          fedPayable: 0,
          discount: 0,
          saleType: scenario.saleType,
          sroItemSerialNo: scenario.sroItemSerialNo || '',
        };
      }),
  };
};

export interface FbrSubmissionResult {
  success: boolean;
  fbrInvoiceNo?: string;
  fbrQrCode?: string;
  errorCode?: string;
  errorMessage?: string;
  fullResponse?: string;
  httpStatus?: number;
}

export const submitToFbr = async (
  invoice: Invoice,
  settings: FbrSettings
): Promise<FbrSubmissionResult> => {
  const payload = buildFbrPayload(invoice, settings);
  const apiUrl = getFbrApiUrl(settings.mode);

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${settings.apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    if (response.status === 200) {
      const data = response.data;
      const fbrInvoiceNo = data.InvoiceNumber || data.invoiceNumber || data.invoiceNo || '';
      const fbrQrCode = data.QRCode || data.qrCode || data.qrcode || '';

      return {
        success: true,
        fbrInvoiceNo,
        fbrQrCode,
      };
    } else {
      return {
        success: false,
        errorCode: String(response.status),
        errorMessage: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        fullResponse: JSON.stringify({ status: response.status, data: response.data, payload }, null, 2),
        httpStatus: response.status,
      };
    }
  } catch (error: any) {
    if (error.response) {
      // Server responded with non-2xx
      const data = error.response.data;
      return {
        success: false,
        errorCode: data?.errorCode || data?.code || String(error.response.status),
        errorMessage: data?.errorMessage || data?.message || data?.error || 'FBR rejected the invoice',
        fullResponse: JSON.stringify({ status: error.response.status, data: error.response.data, payload }, null, 2),
        httpStatus: error.response.status,
      };
    } else {
      // Network error / CORS / timeout
      throw new Error('Network error — check connection or CORS proxy settings');
    }
  }
};
