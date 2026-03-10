import { Invoice } from '@/types';
import { formatAmount, formatDateDMY, numberToWords } from '@/lib/format';
import { QRCodeSVG } from 'qrcode.react';

const PrintInvoice = ({ invoice }: { invoice: Invoice }) => {
  const isAccepted = invoice.fbrStatus === 'Accepted' && !!invoice.fbrInvoiceNo;
  const qrValue = isAccepted ? invoice.fbrInvoiceNo! : 'PENDING';

  return (
    <div id="print-invoice" className="print-format" style={{
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#000',
      lineHeight: 1.4,
      padding: '18px 22px',
      boxSizing: 'border-box',
      width: '100%',
    }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>

        {/* Left: Company Info */}
        <div>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>KHASKINS (PVT) LTD.</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>Plot#179, Sector 7-A, Korangi Industrial Area Karachi - 74900</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>S. Tax Reg No. 12-01-4203-283-46 &nbsp;|&nbsp; NTN No. 0709343-8</p>
        </div>

        {/* Right: Khaskins Logo placeholder */}
        <div style={{ width: '100px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <img
            src="/logos/khaskins_logo.png"
            alt="Khaskins Logo"
            style={{ maxWidth: '100px', maxHeight: '60px', objectFit: 'contain' }}
            onError={(e: any) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* ── TITLE BAR ── */}
      <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '5px 0', marginBottom: '10px' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px', margin: 0, textDecoration: 'underline', letterSpacing: '1px' }}>
          SALES TAX INVOICE
        </h2>
      </div>

      {/* ── CUSTOMER + FBR QR SECTION ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>

        {/* Left: Invoice To */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666', margin: '0 0 3px 0' }}>Invoice To:</p>
          <p style={{ fontWeight: 'bold', margin: '2px 0', fontSize: '12px' }}>{invoice.customerName}</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>{invoice.customerAddress}</p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>NTN: {invoice.customerNtn} &nbsp;|&nbsp; STRN: {invoice.customerStrn}</p>
        </div>

        {/* Right: FBR Logo + QR (same size, side by side) then invoice details below */}
        <div style={{ textAlign: 'right', minWidth: '220px' }}>

          {/* FBR logo + QR code — same size, side by side */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <img
              src="/logos/fbr.png"
              alt="FBR Digital Invoicing"
              width={60}
              height={60}
              style={{ objectFit: 'contain', border: '1px solid #ddd' }}
              onError={(e: any) => {
                // Show FBR text box on error
                e.target.replaceWith(Object.assign(document.createElement('div'), {
                  style: 'width:60px;height:60px;border:1px solid #000;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:bold;text-align:center;',
                  innerText: 'FBR\nDIGITAL\nINVOICING'
                }));
              }}
            />
            <div style={{ width: '60px', height: '60px', border: isAccepted ? 'none' : '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QRCodeSVG value={qrValue} size={60} />
            </div>
          </div>

          {/* Invoice Details */}
          <table style={{ marginLeft: 'auto', fontSize: '11px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ paddingRight: '6px', color: '#555' }}>Invoice No:</td>
                <td style={{ fontWeight: 'bold' }}>{invoice.invoiceNo}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: '6px', color: '#555' }}>FBR Invoice No:</td>
                <td style={{ fontWeight: 'bold' }}>{isAccepted ? invoice.fbrInvoiceNo : 'Pending'}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: '6px', color: '#555' }}>Invoice Date:</td>
                <td style={{ fontWeight: 'bold' }}>{formatDateDMY(invoice.invoiceDate)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ITEMS TABLE ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
        <thead>
          <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8f8f8' }}>
            <th style={{ textAlign: 'center', padding: '5px 3px', fontSize: '11px', width: '28px' }}>Sr</th>
            <th style={{ textAlign: 'left', padding: '5px 3px', fontSize: '11px' }}>Description</th>
            <th style={{ textAlign: 'left', padding: '5px 3px', fontSize: '11px', width: '80px' }}>Article</th>
            <th style={{ textAlign: 'left', padding: '5px 3px', fontSize: '11px', width: '70px' }}>Color</th>
            <th style={{ textAlign: 'right', padding: '5px 3px', fontSize: '11px', width: '45px' }}>Qty</th>
            <th style={{ textAlign: 'center', padding: '5px 3px', fontSize: '11px', width: '50px' }}>UoM</th>
            <th style={{ textAlign: 'right', padding: '5px 3px', fontSize: '11px', width: '70px' }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '5px 3px', fontSize: '11px', width: '80px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <>
              {/* Parent Row */}
              <tr key={item.id} style={{ borderBottom: item.subItems?.length ? 'none' : '1px solid #ddd' }}>
                <td style={{ textAlign: 'center', padding: '4px 3px', fontSize: '11px', verticalAlign: 'top' }}>{idx + 1}</td>
                <td style={{ padding: '4px 3px', fontSize: '11px', fontWeight: 600, verticalAlign: 'top' }}>{item.productName}</td>
                <td style={{ padding: '4px 3px', fontSize: '11px', verticalAlign: 'top' }}></td>
                <td style={{ padding: '4px 3px', fontSize: '11px', verticalAlign: 'top' }}></td>
                <td style={{ textAlign: 'right', padding: '4px 3px', fontSize: '11px', verticalAlign: 'top' }}>{item.subItems?.length ? '' : item.quantity}</td>
                <td style={{ textAlign: 'center', padding: '4px 3px', fontSize: '11px', verticalAlign: 'top' }}>{item.uom}</td>
                <td style={{ textAlign: 'right', padding: '4px 3px', fontSize: '11px', verticalAlign: 'top' }}>{item.subItems?.length ? '' : formatAmount(item.rate)}</td>
                <td style={{ textAlign: 'right', padding: '4px 3px', fontSize: '11px', fontWeight: 600, verticalAlign: 'top' }}>{formatAmount(item.amount)}</td>
              </tr>

              {/* Sub-item Rows */}
              {item.subItems?.map((sub, sIdx) => (
                <tr key={sub.id} style={{ borderBottom: sIdx === (item.subItems!.length - 1) ? '1px solid #ddd' : '1px solid #eee' }}>
                  <td style={{ textAlign: 'center', padding: '3px 3px', fontSize: '10px', color: '#888' }}>↳</td>
                  <td style={{ padding: '3px 3px 3px 16px', fontSize: '10px', color: '#444' }}></td>
                  <td style={{ padding: '3px 3px', fontSize: '10px', color: '#333' }}>{sub.article}</td>
                  <td style={{ padding: '3px 3px', fontSize: '10px', color: '#333' }}>{sub.color}</td>
                  <td style={{ textAlign: 'right', padding: '3px 3px', fontSize: '10px', color: '#333' }}>{sub.quantity}</td>
                  <td></td>
                  <td style={{ textAlign: 'right', padding: '3px 3px', fontSize: '10px', color: '#333' }}>{formatAmount(sub.rate)}</td>
                  <td style={{ textAlign: 'right', padding: '3px 3px', fontSize: '10px', color: '#333' }}>{formatAmount(sub.amount)}</td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>

      {/* ── HS CODES BELOW TABLE (LEFT) ── */}
      {invoice.items.some(i => i.hsCode) && (
        <div style={{ fontSize: '10px', color: '#555', marginBottom: '10px' }}>
          <strong>HS Code(s):</strong>{' '}
          {invoice.items.filter(i => i.hsCode).map((i, idx) => (
            <span key={i.id}>{idx > 0 ? ' | ' : ''}{i.productName}: <strong>{i.hsCode}</strong></span>
          ))}
        </div>
      )}

      {/* ── TOTALS ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <div style={{ width: '260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px', borderBottom: '1px solid #eee' }}>
            <span>Subtotal:</span><span>{formatAmount(invoice.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px', borderBottom: '1px solid #eee' }}>
            <span>GST (18%):</span><span>{formatAmount(invoice.gstAmount)}</span>
          </div>
          {(invoice.cartage || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px', borderBottom: '1px solid #eee' }}>
              <span>Cartage:</span><span>{formatAmount(invoice.cartage)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 3px', fontSize: '14px', fontWeight: 'bold', borderTop: '2px solid #000' }}>
            <span>Grand Total:</span><span>PKR {formatAmount(invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* ── AMOUNT IN WORDS ── */}
      <div style={{ background: '#f3f4f6', padding: '5px 10px', marginBottom: '20px', fontSize: '11px', textTransform: 'uppercase', fontStyle: 'italic', borderLeft: '3px solid #000' }}>
        {numberToWords(invoice.grandTotal)}
      </div>

      {/* ── SIGNATURES — STUCK TO BOTTOM ── */}
      <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #ccc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {['Prepared By', 'Approved By', 'Received By'].map(label => (
            <div key={label} style={{ textAlign: 'center', width: '30%' }}>
              <div style={{ height: '40px' }} />
              <div style={{ borderTop: '1px solid #000', paddingTop: '4px', fontSize: '11px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PrintInvoice;
