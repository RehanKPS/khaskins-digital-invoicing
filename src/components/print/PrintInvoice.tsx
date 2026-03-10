import { Invoice } from '@/types';
import { formatAmount, formatDateDMY, numberToWords } from '@/lib/format';
import { QRCodeSVG } from 'qrcode.react';

const PrintInvoice = ({ invoice }: { invoice: Invoice }) => {
  const isAccepted = invoice.fbrStatus === 'Accepted' && !!invoice.fbrInvoiceNo;

  return (
    <div id="print-invoice" className="print-format" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#000', lineHeight: 1.4 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>KHASKINS (PVT) LTD.</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>Plot#179, Sector 7-A, Korangi Industrial Area Karachi - 74900</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>S. Tax Reg No. 12-01-4203-283-46</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>NTN No. 0709343-8</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="https://drive.google.com/uc?export=view&id=1zYdfZPagos8BBH0jskoaaDQII6Z4H1Nr"
            alt="FBR Digital Invoicing System"
            width={60}
            height={50}
            style={{ objectFit: 'contain' }}
            onError={(e: any) => { e.target.style.display = 'none'; }}
          />
          {isAccepted ? (
            <div className="fbr-qr">
              <QRCodeSVG value={invoice.fbrInvoiceNo!} size={50} />
            </div>
          ) : (
            <div style={{ width: '50px', height: '50px', border: '1px dashed #ccc' }} />
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '6px 0', marginBottom: '12px' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', margin: 0, textDecoration: 'underline' }}>SALES TAX INVOICE</h2>
      </div>

      {/* Invoice + Customer Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666', margin: '0 0 4px 0' }}>Invoice To:</p>
          <p style={{ fontWeight: 'bold', margin: '2px 0' }}>{invoice.customerName}</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>{invoice.customerAddress}</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>NTN: {invoice.customerNtn}</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>STRN: {invoice.customerStrn}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>Invoice No: <strong>{invoice.invoiceNo}</strong></p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>FBR Invoice No: <strong>{isAccepted ? invoice.fbrInvoiceNo : 'Pending'}</strong></p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>Invoice Date: <strong>{formatDateDMY(invoice.invoiceDate)}</strong></p>
        </div>
      </div>

      {/* Items Table */}
      <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #000' }}>
            <th style={{ textAlign: 'center', padding: '4px 2px', fontSize: '11px', width: '30px' }}>Sr</th>
            <th style={{ textAlign: 'left', padding: '4px 2px', fontSize: '11px' }}>Description</th>
            <th style={{ textAlign: 'center', padding: '4px 2px', fontSize: '11px', width: '70px' }}>HS Code</th>
            <th style={{ textAlign: 'right', padding: '4px 2px', fontSize: '11px', width: '50px' }}>Qty</th>
            <th style={{ textAlign: 'center', padding: '4px 2px', fontSize: '11px', width: '50px' }}>UoM</th>
            <th style={{ textAlign: 'right', padding: '4px 2px', fontSize: '11px', width: '70px' }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '4px 2px', fontSize: '11px', width: '80px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <>
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ textAlign: 'center', padding: '3px 2px', fontSize: '11px' }}>{idx + 1}</td>
                <td style={{ padding: '3px 2px', fontSize: '11px', fontWeight: 500 }}>{item.productName}</td>
                <td style={{ textAlign: 'center', padding: '3px 2px', fontSize: '11px' }}>{item.hsCode}</td>
                <td style={{ textAlign: 'right', padding: '3px 2px', fontSize: '11px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'center', padding: '3px 2px', fontSize: '11px' }}>{item.uom}</td>
                <td style={{ textAlign: 'right', padding: '3px 2px', fontSize: '11px' }}>{formatAmount(item.rate)}</td>
                <td style={{ textAlign: 'right', padding: '3px 2px', fontSize: '11px', fontWeight: 500 }}>{formatAmount(item.amount)}</td>
              </tr>
              {item.subItems?.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ textAlign: 'center', padding: '2px', fontSize: '10px', color: '#666' }}>↳</td>
                  <td colSpan={2} style={{ padding: '2px 2px 2px 16px', fontSize: '10px', color: '#444' }}>{sub.article} — {sub.color}</td>
                  <td style={{ textAlign: 'right', padding: '2px', fontSize: '10px', color: '#444' }}>{sub.quantity}</td>
                  <td></td>
                  <td style={{ textAlign: 'right', padding: '2px', fontSize: '10px', color: '#444' }}>{formatAmount(sub.rate)}</td>
                  <td style={{ textAlign: 'right', padding: '2px', fontSize: '10px', color: '#444' }}>{formatAmount(sub.amount)}</td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
            <span>Subtotal:</span><span>{formatAmount(invoice.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
            <span>GST (18%):</span><span>{formatAmount(invoice.gstAmount)}</span>
          </div>
          {(invoice.cartage || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
              <span>Cartage:</span><span>{formatAmount(invoice.cartage)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 3px', fontSize: '14px', fontWeight: 'bold', borderTop: '2px solid #000' }}>
            <span>Grand Total:</span><span>PKR {formatAmount(invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div style={{ background: '#f3f4f6', padding: '6px 10px', marginBottom: '16px', fontSize: '11px', textTransform: 'uppercase', fontStyle: 'italic' }}>
        {numberToWords(invoice.grandTotal)}
      </div>

      {/* Signature Lines */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', marginBottom: '20px' }}>
        {['Prepared By', 'Approved By', 'Received By'].map(label => (
          <div key={label} style={{ textAlign: 'center', width: '30%' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '4px', fontSize: '11px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="invoice-footer">
        KHASKINS (PVT) LTD — Plot#179, Sector 7-A, Korangi Industrial Area Karachi | S.Tax Reg No. 12-01-4203-283-46 | NTN: 0709343-8
      </div>
    </div>
  );
};

export default PrintInvoice;
