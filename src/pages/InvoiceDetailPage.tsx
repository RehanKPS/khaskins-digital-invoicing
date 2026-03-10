import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { formatAmount, formatDateDMY, numberToWords } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Printer, ArrowLeft, Send, RefreshCw, Loader2, Info, ChevronDown, Pencil, CheckCircle, XCircle, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PrintInvoice from '@/components/print/PrintInvoice';
import { submitToFbr, SCENARIO_MAPPINGS, FBR_SALE_TYPE_OPTIONS } from '@/services/fbrService';

const fbrBadgeClass = (status: string) => {
  if (status === 'Accepted') return 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]';
  if (status === 'Failed') return 'bg-destructive text-destructive-foreground';
  if (status === 'Rejected') return 'bg-destructive text-destructive-foreground';
  if (status === 'Pending') return 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]';
  return 'bg-muted-foreground text-background';
};

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invoices, updateInvoice, fbrSettings } = useData();
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const invoice = invoices.find(i => i.id === id);
  if (!invoice) return <div className="p-8 text-center text-muted-foreground">Invoice not found.</div>;

  const scenarioLabel = FBR_SALE_TYPE_OPTIONS.find(o => o.value === invoice.scenarioId)?.label || invoice.scenarioId || 'SN001';
  const fbrItemCount = invoice.items.filter(i => i.productName.toLowerCase() !== 'cartage').length;

  const handleSendToFbr = async () => {
    setSending(true);
    updateInvoice(invoice.id, { fbrStatus: 'Pending' });
    try {
      const result = await submitToFbr(invoice, fbrSettings);
      if (result.success) {
        updateInvoice(invoice.id, {
          fbrStatus: 'Accepted',
          fbrInvoiceNo: result.fbrInvoiceNo || '',
          fbrQrCode: result.fbrQrCode || '',
          fbrSubmittedAt: new Date().toISOString(),
        });
        toast({ title: 'Invoice accepted by FBR ✓', description: `FBR Invoice No: ${result.fbrInvoiceNo}` });
      } else {
        updateInvoice(invoice.id, {
          fbrStatus: 'Failed',
          fbrErrorResponse: result.fullResponse || result.errorMessage || '',
        });
        toast({ title: 'FBR submission failed', description: result.errorMessage, variant: 'destructive' });
      }
    } catch (error: any) {
      updateInvoice(invoice.id, { fbrStatus: 'Not Sent' });
      toast({ title: 'Network error', description: error.message || 'Check connection or CORS proxy settings', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handlePrint = () => {
    const target = document.getElementById('print-invoice');
    if (target) target.classList.add('active-print');
    window.print();
    setTimeout(() => {
      if (target) target.classList.remove('active-print');
    }, 1000);
  };

  const isEditable = ['Not Sent', 'Failed', 'Rejected'].includes(invoice.fbrStatus);

  let parsedError: { errorCode?: string; errorMessage?: string } = {};
  if (invoice.fbrErrorResponse) {
    try {
      const parsed = JSON.parse(invoice.fbrErrorResponse);
      parsedError = {
        errorCode: parsed.status || parsed.data?.errorCode || '',
        errorMessage: parsed.data?.errorMessage || parsed.data?.message || parsed.data?.error || '',
      };
    } catch {
      parsedError = { errorMessage: invoice.fbrErrorResponse };
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Action bar */}
      <div className="flex flex-wrap gap-2 no-print items-center">
        <Button variant="outline" size="sm" onClick={() => navigate('/invoices')}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Button size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> Print</Button>

        {isEditable && (
          <Button size="sm" variant="outline" onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
            <Pencil className="w-4 h-4 mr-1" /> Edit Invoice
          </Button>
        )}

        {(invoice.fbrStatus === 'Not Sent' || invoice.fbrStatus === 'Failed' || invoice.fbrStatus === 'Rejected') && (
          <Button
            size="sm"
            className={invoice.fbrStatus === 'Not Sent' ? 'bg-muted-foreground hover:bg-muted-foreground/90 text-background' : 'bg-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/90 text-[hsl(var(--warning-foreground))]'}
            onClick={() => setShowConfirm(true)}
            disabled={sending}
          >
            {sending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : invoice.fbrStatus === 'Not Sent' ? <Send className="w-4 h-4 mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            {invoice.fbrStatus === 'Not Sent' ? 'Send to FBR' : 'Resend to FBR'}
          </Button>
        )}
        <Badge className={fbrBadgeClass(invoice.fbrStatus)}>{invoice.fbrStatus}</Badge>
        {invoice.fbrInvoiceNo && <span className="text-sm text-muted-foreground">FBR: {invoice.fbrInvoiceNo}</span>}
      </div>

      {/* FBR Status Sections */}
      {invoice.fbrStatus === 'Accepted' && (
        <div className="no-print flex items-start gap-4 p-4 bg-[hsl(var(--success))]/10 rounded-lg border border-[hsl(var(--success))]/30">
          <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[hsl(var(--success))]">🟢 Accepted by FBR</p>
            <p className="text-sm text-muted-foreground">FBR Invoice No: <span className="font-medium text-foreground">{invoice.fbrInvoiceNo}</span></p>
            {invoice.fbrSubmittedAt && (
              <p className="text-sm text-muted-foreground">Submitted: {formatDateDMY(invoice.fbrSubmittedAt)} {new Date(invoice.fbrSubmittedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <QRCodeSVG value={invoice.fbrInvoiceNo || ''} size={100} />
            <p className="text-xs text-muted-foreground">FBR Verified — {invoice.fbrInvoiceNo}</p>
          </div>
        </div>
      )}

      {(invoice.fbrStatus === 'Failed' || invoice.fbrStatus === 'Rejected') && (
        <div className="no-print space-y-2">
          <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
            <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">🔴 {invoice.fbrStatus === 'Failed' ? 'FBR Submission Failed' : 'Rejected by FBR'}</p>
              {parsedError.errorCode && <p className="text-sm text-muted-foreground">Error Code: {parsedError.errorCode}</p>}
              {parsedError.errorMessage && <p className="text-sm text-muted-foreground">Error: {parsedError.errorMessage}</p>}
            </div>
          </div>
          {invoice.fbrErrorResponse && (
            <Collapsible open={showErrorDetails} onOpenChange={setShowErrorDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  {showErrorDetails ? 'Hide' : 'View'} Full Response <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64 whitespace-pre-wrap">{invoice.fbrErrorResponse}</pre>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}

      {invoice.fbrStatus === 'Pending' && (
        <div className="no-print flex items-start gap-3 p-4 bg-[hsl(var(--warning))]/10 rounded-lg border border-[hsl(var(--warning))]/30">
          <Clock className="w-5 h-5 text-[hsl(var(--warning))] mt-0.5 animate-pulse flex-shrink-0" />
          <p className="text-sm text-[hsl(var(--warning))] font-medium">🟡 Pending FBR Response...</p>
        </div>
      )}

      {invoice.fbrStatus === 'Not Sent' && (
        <div className="no-print flex items-start gap-3 p-4 bg-muted rounded-lg border">
          <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
          <p className="text-sm text-muted-foreground">This invoice has not been sent to FBR yet. Click 'Send to FBR' to submit.</p>
        </div>
      )}

      {/* Screen preview */}
      <div className="no-print bg-card border rounded-lg p-6 md:p-10 max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground">KHASKINS (PVT) LTD</h1>
          <p className="text-sm text-muted-foreground">Plot#179, Sector 7-A, Korangi Industrial Area Karachi - 74900</p>
          <p className="text-sm text-muted-foreground">S. Tax Reg No. 12-01-4203-283-46 | NTN No. 0709343-8</p>
        </div>

        <div className="border-t border-b py-2 mb-6">
          <h2 className="text-lg font-bold text-center underline">SALES TAX INVOICE</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invoice To:</p>
            <p className="font-semibold text-foreground">{invoice.customerName}</p>
            <p className="text-sm text-muted-foreground">NTN: {invoice.customerNtn}</p>
            <p className="text-sm text-muted-foreground">STRN: {invoice.customerStrn}</p>
            <p className="text-sm text-muted-foreground">{invoice.customerAddress}</p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <p className="text-sm"><span className="text-muted-foreground">Invoice No:</span> <span className="font-bold">{invoice.invoiceNo}</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Date:</span> {formatDateDMY(invoice.invoiceDate)}</p>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="text-center py-2 w-10">Sr</th>
                <th className="text-left py-2">Description</th>
                <th className="text-center py-2">HS Code</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-center py-2">UoM</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <>
                  <tr key={item.id} className="border-b border-border">
                    <td className="text-center py-2">{idx + 1}</td>
                    <td className="py-2 font-medium">{item.productName}</td>
                    <td className="text-center py-2">{item.hsCode}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-center py-2">{item.uom}</td>
                    <td className="text-right py-2 pkr-format">{formatAmount(item.rate)}</td>
                    <td className="text-right py-2 pkr-format font-medium">{formatAmount(item.amount)}</td>
                  </tr>
                  {item.subItems?.map(sub => (
                    <tr key={sub.id} className="border-b border-border/50 bg-muted/30 text-xs">
                      <td className="text-center py-1">↳</td>
                      <td className="py-1 pl-4" colSpan={2}>{sub.article} — {sub.color}</td>
                      <td className="text-right py-1">{sub.quantity}</td>
                      <td></td>
                      <td className="text-right py-1 pkr-format">{formatAmount(sub.rate)}</td>
                      <td className="text-right py-1 pkr-format">{formatAmount(sub.amount)}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal:</span><span className="pkr-format">{formatAmount(invoice.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST @ 18%:</span><span className="pkr-format">{formatAmount(invoice.gstAmount)}</span></div>
            {(invoice.cartage || 0) > 0 && (
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cartage:</span><span className="pkr-format">{formatAmount(invoice.cartage)}</span></div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Grand Total:</span><span className="pkr-format">PKR {formatAmount(invoice.grandTotal)}</span></div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground italic">{numberToWords(invoice.grandTotal)}</p>
        </div>

        <div className="mt-10 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground italic">This is a computer-generated document and does not require a signature.</p>
        </div>
      </div>

      {/* Print layout */}
      <div className="hidden print-show">
        <PrintInvoice invoice={invoice} />
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to FBR?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Send invoice <strong>{invoice.invoiceNo}</strong> to FBR?</p>
                <div className="bg-muted rounded p-3 text-sm space-y-1">
                  <p>Scenario: <strong>{scenarioLabel}</strong></p>
                  <p>Items: <strong>{fbrItemCount}</strong></p>
                  <p>Total Value: <strong>PKR {formatAmount(invoice.subtotal)}</strong></p>
                  <p>GST: <strong>PKR {formatAmount(invoice.gstAmount)}</strong></p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-primary hover:bg-primary/90" onClick={() => handleSendToFbr()}>Send to FBR</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoiceDetailPage;
