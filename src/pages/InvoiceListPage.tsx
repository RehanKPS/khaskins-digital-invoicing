import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { formatAmount, formatDateDMY } from '@/lib/format';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, Printer, RefreshCw, Send, FileText, Loader2, Pencil, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fbrBadgeClass = (status: string) => {
  if (status === 'Accepted') return 'bg-[#16a34a] text-white';
  if (status === 'Failed') return 'bg-[#dc2626] text-white';
  if (status === 'Rejected') return 'bg-[#991b1b] text-white';
  if (status === 'Pending') return 'bg-[#f97316] text-white';
  return 'bg-[#6b7280] text-white';
};

const InvoiceListPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { invoices, updateInvoice } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [confirmInvoice, setConfirmInvoice] = useState<{ id: string; invoiceNo: string } | null>(null);

  const filtered = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.fbrStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filtered.reduce((s, i) => s + i.grandTotal, 0);
  const totalGst = filtered.reduce((s, i) => s + i.gstAmount, 0);

  const handleSendToFbr = (id: string) => {
    setSendingId(id);
    updateInvoice(id, { fbrStatus: 'Pending' });
    setTimeout(() => {
      const random = Math.random();
      if (random > 0.3) {
        const fbrNo = `FBR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
        updateInvoice(id, { fbrStatus: 'Accepted', fbrInvoiceNo: fbrNo });
        toast({ title: 'Invoice accepted by FBR', description: `FBR Invoice No: ${fbrNo}` });
      } else if (random > 0.15) {
        updateInvoice(id, { fbrStatus: 'Failed' });
        toast({ title: 'FBR submission failed', variant: 'destructive' });
      } else {
        updateInvoice(id, { fbrStatus: 'Rejected' });
        toast({ title: 'Invoice rejected by FBR', variant: 'destructive' });
      }
      setSendingId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Invoices</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Invoices</p><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Amount</p><p className="text-2xl font-bold pkr-format whitespace-nowrap">{formatAmount(totalAmount)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total GST</p><p className="text-2xl font-bold pkr-format whitespace-nowrap">{formatAmount(totalGst)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Not Sent">Not Sent</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No invoices found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>FBR Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(inv => (
                    <TableRow key={inv.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
                      <TableCell>{formatDateDMY(inv.invoiceDate)}</TableCell>
                      <TableCell>{inv.customerName}</TableCell>
                      <TableCell className="text-right pkr-format whitespace-nowrap">{formatAmount(inv.subtotal)}</TableCell>
                      <TableCell className="text-right pkr-format whitespace-nowrap">{formatAmount(inv.gstAmount)}</TableCell>
                      <TableCell className="text-right pkr-format font-medium whitespace-nowrap">{formatAmount(inv.grandTotal)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Badge className={fbrBadgeClass(inv.fbrStatus)}>
                            {inv.fbrStatus === 'Pending' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                            {inv.fbrStatus === 'Accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {(inv.fbrStatus === 'Failed' || inv.fbrStatus === 'Rejected') && <XCircle className="w-3 h-3 mr-1" />}
                            {inv.fbrStatus}
                          </Badge>
                          {inv.fbrStatus === 'Accepted' && inv.fbrInvoiceNo && (
                            <span className="text-[10px] text-muted-foreground mt-0.5">{inv.fbrInvoiceNo}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${inv.id}`)}><Eye className="w-4 h-4" /></Button>
                          {['Not Sent', 'Failed', 'Rejected'].includes(inv.fbrStatus) && (
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${inv.id}/edit`)}><Pencil className="w-4 h-4" /></Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => { navigate(`/invoices/${inv.id}`); setTimeout(() => window.print(), 500); }}><Printer className="w-4 h-4" /></Button>
                          {inv.fbrStatus === 'Not Sent' && (
                            <Button size="sm" className="bg-[#0496c7] hover:bg-[#0496c7]/90 text-white" disabled={sendingId === inv.id}
                              onClick={() => setConfirmInvoice({ id: inv.id, invoiceNo: inv.invoiceNo })}>
                              {sendingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                          )}
                          {(inv.fbrStatus === 'Failed' || inv.fbrStatus === 'Rejected') && (
                            <Button size="sm" variant="outline" className="border-[#f97316] text-[#f97316] hover:bg-[#f97316]/10" disabled={sendingId === inv.id}
                              onClick={() => setConfirmInvoice({ id: inv.id, invoiceNo: inv.invoiceNo })}>
                              {sendingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmInvoice} onOpenChange={() => setConfirmInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to FBR?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send Invoice {confirmInvoice?.invoiceNo} to FBR? This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-[#0496c7] hover:bg-[#0496c7]/90" onClick={() => {
              if (confirmInvoice) handleSendToFbr(confirmInvoice.id);
              setConfirmInvoice(null);
            }}>Send to FBR</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoiceListPage;
