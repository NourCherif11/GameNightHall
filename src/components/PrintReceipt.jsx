import React from 'react'
import { formatPrice, formatDate, formatTime } from '@/lib/utils'

export default function PrintReceipt({ bill, billItems }) {
    const totalItems = billItems.reduce((sum, item) => sum + item.quantity, 0)
    const cashierName = bill.cashierName || 'N/A'

    return (
        <div className="print-receipt">
            <style>{`
                @media print {
                    /* Reset and hide everything first */
                    * {
                        visibility: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    /* Show only the receipt content */
                    .print-receipt,
                    .print-receipt * {
                        visibility: visible !important;
                    }
                    
                    /* Position receipt at page origin */
                    html, body {
                        width: 80mm !important;
                        height: auto !important;
                    }
                    
                    .print-receipt {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 80mm !important;
                        padding: 5mm !important;
                        font-family: 'Courier New', monospace !important;
                        font-size: 11pt !important;
                        line-height: 1.4 !important;
                        background: white !important;
                        color: black !important;
                    }
                    
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                }
                
                .print-receipt {
                    width: 80mm;
                    padding: 10px;
                    font-family: 'Courier New', monospace;
                    font-size: 11pt;
                    line-height: 1.4;
                    background: white;
                    color: black;
                }
                
                .receipt-header {
                    text-align: center;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 2px dashed #000;
                }
                
                .receipt-title {
                    font-size: 16pt;
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                
                .receipt-info {
                    font-size: 9pt;
                    margin: 2px 0;
                }
                
                .receipt-section {
                    margin: 10px 0;
                    padding: 8px 0;
                    border-bottom: 1px dashed #000;
                }
                
                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 4px 0;
                    font-size: 10pt;
                }
                
                .receipt-item {
                    margin: 6px 0;
                }
                
                .item-name {
                    font-size: 10pt;
                    margin-bottom: 2px;
                }
                
                .item-details {
                    display: flex;
                    justify-content: space-between;
                    font-size: 9pt;
                }
                
                .receipt-total {
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px solid #000;
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14pt;
                    font-weight: bold;
                    margin: 6px 0;
                }
                
                .receipt-footer {
                    text-align: center;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 2px dashed #000;
                    font-size: 9pt;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    background: ${bill.paid ? '#22c55e' : '#f59e0b'};
                    color: white;
                    border-radius: 4px;
                    font-size: 9pt;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .receipt-logo {
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 8px auto;
                    display: block;
                    filter: brightness(0) saturate(100%);
                }
            `}</style>

            <div className="receipt-header">
                <img src="https://zvxvjztilxoqmadhukwc.supabase.co/storage/v1/object/public/images/gameparklogo.png" alt="GamePark Logo" className="receipt-logo" />
                <div className="receipt-title">GAMEPARK</div>
                <div className="receipt-info">Gaming & Pool Club</div>
                <div className="receipt-info">--------------------------------</div>
                <div className="receipt-info">Facture #{bill.id.slice(-8).toUpperCase()}</div>
                <div className="receipt-info">{formatDate(bill.createdAt)} {formatTime(bill.createdAt)}</div>
            </div>

            <div className="receipt-section">
                <div className="receipt-row">
                    <span>Client:</span>
                    <span><strong>{bill.playerName}</strong></span>
                </div>
                {bill.tableNumber && (
                    <div className="receipt-row">
                        <span>Table:</span>
                        <span><strong>#{bill.tableNumber}</strong></span>
                    </div>
                )}
                <div className="receipt-row">
                    <span>Début:</span>
                    <span>{formatTime(bill.startTime)}</span>
                </div>
                <div className="receipt-row">
                    <span>Fin:</span>
                    <span>{formatTime(bill.endTime)}</span>
                </div>
            </div>

            <div className="receipt-section">
                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '11pt' }}>
                    ARTICLES ({totalItems})
                </div>
                {billItems.map((item, idx) => (
                    <div key={idx} className="receipt-item">
                        <div className="item-name">
                            {item.quantity > 1 && `${item.quantity}x `}
                            {item.itemName}
                        </div>
                        <div className="item-details">
                            <span>
                                {item.quantity > 1 && `${item.quantity} × ${formatPrice(item.unitPrice)}`}
                            </span>
                            <span><strong>{formatPrice(item.totalPrice)}</strong></span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="receipt-total">
                <div className="total-row">
                    <span>TOTAL:</span>
                    <span>{formatPrice(bill.price)}</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <span className="status-badge">
                        {bill.paid ? 'PAYÉE' : 'IMPAYÉE'}
                    </span>
                </div>
            </div>

            <div className="receipt-footer">
                <div className="receipt-row" style={{ marginBottom: '8px' }}>
                    <span>Caissier:</span>
                    <span><strong>{cashierName}</strong></span>
                </div>
                <div style={{ borderTop: '1px dashed #000', paddingTop: '8px' }}>Merci de votre visite!</div>
                <div style={{ marginTop: '5px' }}>À bientôt chez GamePark</div>
                <div style={{ marginTop: '10px', fontSize: '8pt' }}>
                    ================================
                </div>
            </div>
        </div>
    )
}
