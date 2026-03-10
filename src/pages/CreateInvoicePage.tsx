import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { InvoiceItem, SubItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { formatAmount, formatDateDMY } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, Trash2, Save, Send, X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { FBR_SALE_TYPE_OPTIONS, SCENARIO_MAPPINGS } from '@/services/fbrService';
import { HsCodeInput, HS_CODE_REGEX } from '@/components/HsCodeInput';

const UOM_OPTIONS = [
  'Sq Feet', 'Sq Meter', 'Pcs', 'Side', 'Skin', 'Hide', 'Bundle', 'Dozen', 'Roll',
  'KG', 'Liter', 'ML', 'Drum', 'Carboy', 'Bag', 'Unit', 'Box', 'Carton', 'Case', 'Pallet',
];

const CreateInvoicePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { customers, products, categories, addInvoice, getNextInvoiceNo } = useData();

  const [invoiceNo, setInvoiceNo] = useState('');
  useEffect(() => { getNextInvoiceNo().then(no => setInvoiceNo(no)); }, []);
  const [customerId, setCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSubItems, setExpandedSubItems] = useState<Record<number, boolean>>({});
  const [scenarioId, setScenarioId] = useState('');
  const [buyerRegistrationType, setBuyerRegistrationType] = useState('');
  const [cartage, setCartage] = useState<number>(0);

  const selectedCustomer = customers.find(c => c.id === customerId);
  const getProductsForCategory = (categoryName: string) => products.filter(p => p.status === 'Active' && p.category === categoryName);

  const getProductCategory = (productId: string) => {
    if (productId.startsWith('cat-')) {
      const cat = categories.find(c => `cat-${c.id}` === productId);
      return cat?.name || '';
    }
    const prod = products.find(p => p.id === productId);
    return prod?.category || '';
  };

  const addItem = () => {
    setItems([...items, {
      id: String(Date.now()), productId: '', productName: '',
      hsCode: '', uom: '', quantity: 1, rate: 0, amount: 0, subItems: [],
    }]);
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    const item = { ...updated[idx], [field]: value };
    if (field === 'productId') {
      const cat = categories.find(c => `cat-${c.id}` === value);
      if (cat) { item.productName = cat.name; item.rate = 0; }
    }
    item.amount = item.quantity * item.rate;
    updated[idx] = item;
    setItems(updated);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const toggleSubItems = (idx: number) => setExpandedSubItems(prev => ({ ...prev, [idx]: !prev[idx] }));

  const addSubItem = (itemIdx: number) => {
    const updated = [...items];
    const item = { ...updated[itemIdx] };
    item.subItems = [...(item.subItems || []), {
      id: String(Date.now()), article: '', color: '', pcs: 0,
      quantity: 0, rate: item.rate || 0, amount: 0,
    }];
    updated[itemIdx] = item;
    setItems(updated);
    setExpandedSubItems(prev => ({ ...prev, [itemIdx]: true }));
  };

  const recalcParentFromSubs = (item: InvoiceItem): InvoiceItem => {
    const subs = item.subItems || [];
    if (subs.length > 0) {
      item.quantity = subs.reduce((s, si) => s + si.quantity, 0);
      item.amount = subs.reduce((s, si) => s + si.amount, 0);
    }
    return item;
  };

  const updateSubItem = (itemIdx: number, subIdx: number, field: string, value: any) => {
    const updated = [...items];
    const item = { ...updated[itemIdx] };
    const subs = [...(item.subItems || [])];
    const sub = { ...subs[subIdx], [field]: value };
    if (field === 'article') {
      const catName = getProductCategory(item.productId);
      const catProducts = getProductsForCategory(catName);
      const selectedProduct = catProducts.find(p => p.name === value);
      if (selectedProduct) sub.rate = selectedProduct.standardPrice;
    }
    sub.amount = sub.quantity * sub.rate;
    subs[subIdx] = sub;
    item.subItems = subs;
    updated[itemIdx] = recalcParentFromSubs(item);
    setItems(updated);
  };

  const removeSubItem = (itemIdx: number, subIdx: number) => {
    const updated = [...items];
    const item = { ...updated[itemIdx] };
    item.subItems = (item.subItems || []).filter((_, i) => i !== subIdx);
    updated[itemIdx] = recalcParentFromSubs(item);
    setItems(updated);
  };

  const getSubItemsTotal = (subs: SubItem[]) => subs.reduce((s, si) => s + si.amount, 0);

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + (cartage || 0) + gstAmount;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!customerId) errs.customer = 'Please select a customer';
    if (!scenarioId) errs.scenarioId = 'Please select an FBR Sale Type';
    if (items.length === 0) errs.items = 'Please add at least one item';
    items.forEach((item, idx) => {
      if (!item.hsCode) errs[`hsCode_${idx}`] = 'HS Code is required';
      else if (!HS_CODE_REGEX.test(item.hsCode)) errs[`hsCode_${idx}`] = 'HS Code must be 8 digits e.g. 4112.0000';
      if (!item.uom) errs[`uom_${idx}`] = `Item ${idx + 1}: Unit of Measure is required`;
      if (item.quantity <= 0) errs[`qty_${idx}`] = `Item ${idx + 1}: Quantity must be > 0`;
      const hasSubItems = (item.subItems?.length || 0) > 0;
      if (!hasSubItems && item.rate <= 0) errs[`rate_${idx}`] = `Item ${idx + 1}: Rate must be > 0`;
      if (hasSubItems) {
        item.subItems?.forEach((sub, sIdx) => {
          if (sub.rate <= 0) errs[`subRate_${idx}_${sIdx}`] = `Item ${idx + 1}, Sub-item ${sIdx + 1}: Rate must be > 0`;
        });
      }
    });
    return errs;
  };

  const handleSave = (submit: boolean) => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast({ title: 'Please fix validation errors', variant: 'destructive' });
      return;
    }

    const inv = addInvoice({
      invoiceNo,
      invoiceDate: format(invoiceDate, 'yyyy-MM-dd'),
      customerId,
      customerName: selectedCustomer?.companyName || '',
      customerNtn: selectedCustomer?.ntn || '',
      customerStrn: selectedCustomer?.strn || '',
      customerAddress: `${selectedCustomer?.address || ''}, ${selectedCustomer?.city || ''}, ${selectedCustomer?.province || ''}`,
      customerProvince: selectedCustomer?.province || '',
      items, subtotal, cartage: cartage || 0, gstAmount, grandTotal,
      fbrStatus: 'Not Sent', fbrInvoiceNo: '',
      scenarioId, buyerRegistrationType,
      status: submit ? 'Submitted' : 'Draft',
    });

    toast({ title: submit ? 'Invoice submitted!' : 'Invoice saved as draft!' });
    navigate(`/invoices/${inv.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Create Invoice</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/invoices')}><X className="w-4 h-4 mr-2" /> Cancel</Button>
          <Button variant="outline" onClick={() => handleSave(false)}><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
          <Button onClick={() => handleSave(true)}><Send className="w-4 h-4 mr-2" /> Submit Invoice</Button>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-1">
          {Object.values(errors).map((err, i) => (
            <p key={i} className="text-sm text-destructive">• {err}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input value={invoiceNo} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDMY(invoiceDate.toISOString())}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={invoiceDate} onSelect={(d) => d && setInvoiceDate(d)} className="p-3 pointer-events-auto" /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>FBR Sale Type <span className="text-destructive">*</span></Label>
              <Select value={scenarioId} onValueChange={v => {
                setScenarioId(v);
                const mapping = SCENARIO_MAPPINGS[v];
                if (mapping) setBuyerRegistrationType(mapping.buyerRegistrationType);
              }}>
                <SelectTrigger className={errors.scenarioId ? 'border-destructive' : ''}><SelectValue placeholder="Select FBR Sale Type..." /></SelectTrigger>
                <SelectContent>
                  {FBR_SALE_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.scenarioId && <p className="text-xs text-destructive">{errors.scenarioId}</p>}
              {buyerRegistrationType && (
                <p className="text-xs text-muted-foreground">Buyer Registration Type: <span className="font-medium text-foreground">{buyerRegistrationType}</span></p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className={errors.customer ? 'border-destructive' : ''}><SelectValue placeholder="Select customer..." /></SelectTrigger>
              <SelectContent>
                {customers.filter(c => c.status === 'Active').map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer && <p className="text-xs text-destructive">{errors.customer}</p>}
            {selectedCustomer && (
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>NTN: <span className="text-foreground font-medium">{selectedCustomer.ntn}</span></p>
                <p>STRN: <span className="text-foreground">{selectedCustomer.strn}</span></p>
                <p>{selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.province}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoice Items</CardTitle>
          <Button size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
        </CardHeader>
        <CardContent>
          {errors.items && <p className="text-sm text-destructive mb-3">{errors.items}</p>}
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items added yet. Click "Add Item" to begin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Sr</TableHead>
                    <TableHead className="min-w-[180px]">Product</TableHead>
                    <TableHead className="w-32">HS Code</TableHead>
                    <TableHead className="w-32">UoM</TableHead>
                    <TableHead className="w-20">Qty</TableHead>
                    <TableHead className="w-36 text-right">Amount</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <>
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Select value={item.productId} onValueChange={v => updateItem(idx, 'productId', v)}>
                            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                              {categories.map(c => <SelectItem key={`cat-${c.id}`} value={`cat-${c.id}`}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant={expandedSubItems[idx] ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => expandedSubItems[idx] ? toggleSubItems(idx) : addSubItem(idx)}
                            className="mt-2 h-7 text-xs gap-1.5"
                          >
                            {expandedSubItems[idx] ? <><ChevronDown className="w-3.5 h-3.5" /> Hide Sub-items ({item.subItems?.length || 0})</> : <><Plus className="w-3.5 h-3.5" /> Add Sub-items</>}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <HsCodeInput value={item.hsCode} onChange={v => updateItem(idx, 'hsCode', v)} error={errors[`hsCode_${idx}`]} />
                        </TableCell>
                        <TableCell>
                          <Select value={item.uom} onValueChange={v => updateItem(idx, 'uom', v)}>
                            <SelectTrigger className={cn("w-28", errors[`uom_${idx}`] ? 'border-destructive' : '')}>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>{UOM_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                          </Select>
                          {errors[`uom_${idx}`] && <p className="text-xs text-destructive mt-1">{errors[`uom_${idx}`]}</p>}
                        </TableCell>
                        <TableCell>
                          {(item.subItems?.length || 0) > 0 ? (
                            <Input type="number" value={item.quantity} readOnly className="w-20 bg-muted cursor-not-allowed font-semibold" />
                          ) : (
                            <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} className="w-20" />
                          )}
                          {errors[`qty_${idx}`] && <p className="text-xs text-destructive mt-1">{errors[`qty_${idx}`]}</p>}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span className="inline-block px-2 py-1 bg-muted border border-border rounded-md font-semibold text-sm cursor-not-allowed">{formatAmount(item.amount)}</span>
                        </TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button></TableCell>
                      </TableRow>

                      {/* Sub-items */}
                      {expandedSubItems[idx] && (
                        <TableRow key={`sub-${item.id}`}>
                          <TableCell colSpan={7} className="bg-muted/30 p-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Sub-items for {item.productName || 'this product'}</span>
                                <Button size="sm" variant="outline" onClick={() => addSubItem(idx)} className="h-7 text-xs">
                                  <Plus className="w-3 h-3 mr-1" /> Add Sub-item
                                </Button>
                              </div>
                              {(item.subItems?.length || 0) > 0 && (
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-xs">Article</TableHead>
                                        <TableHead className="text-xs">Color</TableHead>
                                        <TableHead className="text-xs w-16">Pcs</TableHead>
                                        <TableHead className="text-xs w-16">Qty</TableHead>
                                        <TableHead className="text-xs w-20">Rate</TableHead>
                                        <TableHead className="text-xs text-right">Amount</TableHead>
                                        <TableHead className="w-8"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {item.subItems?.map((sub, sIdx) => (
                                        <TableRow key={sub.id}>
                                          <TableCell>
                                            {(() => {
                                              const catName = getProductCategory(item.productId);
                                              const catProducts = getProductsForCategory(catName);
                                              return catProducts.length > 0 ? (
                                                <Select value={sub.article} onValueChange={v => updateSubItem(idx, sIdx, 'article', v)}>
                                                  <SelectTrigger className="h-8 text-xs min-w-[100px]"><SelectValue placeholder="Select..." /></SelectTrigger>
                                                  <SelectContent>{catProducts.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                              ) : (
                                                <Input value={sub.article} onChange={e => updateSubItem(idx, sIdx, 'article', e.target.value)} className="h-8 text-xs" placeholder="Article" />
                                              );
                                            })()}
                                          </TableCell>
                                          <TableCell><Input value={sub.color} onChange={e => updateSubItem(idx, sIdx, 'color', e.target.value)} className="h-8 text-xs min-w-[80px]" placeholder="e.g. Black" /></TableCell>
                                          <TableCell><Input type="number" value={sub.pcs} onChange={e => updateSubItem(idx, sIdx, 'pcs', Number(e.target.value))} className="h-8 text-xs w-16" /></TableCell>
                                          <TableCell><Input type="number" value={sub.quantity} onChange={e => updateSubItem(idx, sIdx, 'quantity', Number(e.target.value))} className="h-8 text-xs w-16" /></TableCell>
                                          <TableCell><Input type="number" value={sub.rate} onChange={e => updateSubItem(idx, sIdx, 'rate', Number(e.target.value))} className="h-8 text-xs w-20" /></TableCell>
                                          <TableCell className="text-right text-xs whitespace-nowrap">
                                            <span className="inline-block px-2 py-1 bg-muted border border-border rounded font-semibold cursor-not-allowed">{formatAmount(sub.amount)}</span>
                                          </TableCell>
                                          <TableCell><Button variant="ghost" size="sm" onClick={() => removeSubItem(idx, sIdx)} className="h-6 w-6 p-0 text-destructive"><Trash2 className="w-3 h-3" /></Button></TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cartage & Totals */}
      <div className="flex justify-end">
        <Card className="w-full sm:w-96">
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="pkr-format whitespace-nowrap">{formatAmount(subtotal)}</span></div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Cartage</Label>
                <Input type="number" min={0} value={cartage || ''} onChange={e => setCartage(Number(e.target.value))} placeholder="Enter cartage amount if applicable" className="h-8" />
              </div>
              {(cartage || 0) > 0 && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cartage</span><span className="pkr-format whitespace-nowrap">{formatAmount(cartage)}</span></div>
              )}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (18%)</span><span className="pkr-format whitespace-nowrap">{formatAmount(gstAmount)}</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Grand Total</span><span className="pkr-format text-primary whitespace-nowrap">PKR {formatAmount(grandTotal)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
