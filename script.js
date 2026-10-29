const app = {
    currentDocType: null,

    init() {
        // Add one initial row to each form on load
        this.addItemRow('invoice');
        this.addItemRow('receipt');
        
        // Listeners for auto-calculation via event delegation
        document.getElementById('inv-items-container').addEventListener('input', () => this.calculateTotal('invoice'));
        document.getElementById('rec-items-container').addEventListener('input', () => this.calculateTotal('receipt'));
    },

    showView(viewId) {
        // Hide all views completely
        document.querySelectorAll('.view').forEach(el => {
            el.classList.remove('active');
        });
        
        // Ensure scrolling strictly goes to the top to avoid empty screen gaps
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Small delay to allow the CSS animation to trigger properly from display:block
        setTimeout(() => {
            document.getElementById(viewId).classList.add('active');
        }, 10);

        if (viewId !== 'review-page') {
            this.currentDocType = null;
        }
    },

    addItemRow(type) {
        const prefix = type === 'invoice' ? 'inv' : 'rec';
        const container = document.getElementById(`${prefix}-items-container`);
        const rowId = `row-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        
        const html = `
            <div class="item-row" id="${rowId}">
                <div class="form-group mb-0">
                    <label class="mobile-only-label" style="display:none;">Description</label>
                    <input type="text" class="item-name" placeholder="Item Name" required>
                </div>
                <div class="form-group mb-0">
                    <label class="mobile-only-label" style="display:none;">Qty</label>
                    <input type="number" class="item-qty" value="1" min="1" step="any" required>
                </div>
                <div class="form-group mb-0">
                    <label class="mobile-only-label" style="display:none;">Rate</label>
                    <input type="number" class="item-price" placeholder="0.00" min="0" step="0.01" required>
                </div>
                <div class="form-group mb-0">
                    <label class="mobile-only-label" style="display:none;">Total</label>
                    <input type="text" class="item-subtotal" value="0.00" readonly disabled>
                </div>
                <button type="button" class="btn btn-danger" onclick="app.removeItemRow('${rowId}', '${type}')" title="Remove Item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        
        // Add dynamic CSS logic for mobile labels
        const labels = container.lastElementChild.querySelectorAll('.mobile-only-label');
        if(window.innerWidth <= 768) {
            labels.forEach(l => l.style.display = 'block');
        }
    },

    removeItemRow(rowId, type) {
        document.getElementById(rowId).remove();
        this.calculateTotal(type);
    },

    calculateTotal(type) {
        const prefix = type === 'invoice' ? 'inv' : 'rec';
        const rows = document.querySelectorAll(`#${prefix}-items-container .item-row`);
        let grandTotal = 0;

        rows.forEach(row => {
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const subtotal = qty * price;
            row.querySelector('.item-subtotal').value = subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            grandTotal += subtotal;
        });

        const formattedTotal = grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById(`${prefix}-grand-total`).innerText = formattedTotal;
    },

    generateDocument(event, type) {
        event.preventDefault();
        this.currentDocType = type;
        const data = this.gatherFormData(type);
        this.renderPreview(data, type);
        this.showView('review-page');
    },

    gatherFormData(type) {
        const prefix = type === 'invoice' ? 'inv' : 'rec';
        const formData = {
            bizName: document.getElementById(`${prefix}-biz-name`).value,
            bizPhone: document.getElementById(`${prefix}-biz-phone`).value,
            bizEmail: document.getElementById(`${prefix}-biz-email`).value,
            bizAddress: document.getElementById(`${prefix}-biz-address`).value,
            cusName: document.getElementById(`${prefix}-cus-name`).value,
            cusPhone: document.getElementById(`${prefix}-cus-phone`).value,
            cusEmail: document.getElementById(`${prefix}-cus-email`) ? document.getElementById(`${prefix}-cus-email`).value : '',
            cashier: document.getElementById(`${prefix}-cashier`).value,
            notes: document.getElementById(`${prefix}-notes`).value,
            items: [],
            grandTotal: document.getElementById(`${prefix}-grand-total`).innerText,
            template: document.querySelector(`input[name="${prefix}-template"]:checked`).value
        };

        let totalQty = 0;
        const rows = document.querySelectorAll(`#${prefix}-items-container .item-row`);
        rows.forEach(row => {
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            totalQty += qty;
            formData.items.push({
                name: row.querySelector('.item-name').value,
                qty: qty,
                price: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                subtotal: (qty * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            });
        });
        formData.totalQty = totalQty;

        if (type === 'invoice') {
            formData.number = document.getElementById('inv-number').value;
            formData.date = document.getElementById('inv-date').value;
            formData.due = document.getElementById('inv-due').value;
            formData.bankName = document.getElementById('inv-bank-name').value;
            formData.accName = document.getElementById('inv-acc-name').value;
            formData.accNumber = document.getElementById('inv-acc-number').value;
        } else {
            formData.number = document.getElementById('rec-number').value;
            formData.method = document.getElementById('rec-method').value;
            formData.date = document.getElementById('rec-date').value;
            formData.time = document.getElementById('rec-time').value;
        }

        return formData;
    },

    renderPreview(data, type) {
        // Escape all user-controlled strings before inserting preview HTML.
        const safe = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        data = {...data, ...Object.fromEntries(Object.entries(data).filter(([k,v]) => typeof v === 'string' && k !== 'template').map(([k,v]) => [k,safe(v)])), items: data.items.map(item => ({...item, name:safe(item.name)}))};
        const preview = document.getElementById('document-preview');
        preview.className = `template-${data.template}`;
        
        // ----------------------------------------------------
        // POS THERMAL RECEIPT LOGIC
        // ----------------------------------------------------
        if (data.template === 'thermal') {
            let thermalItems = '';
            data.items.forEach(item => {
                thermalItems += `
                    <tr>
                        <td class="col-desc">${item.name}</td>
                        <td class="col-qty">${item.qty}</td>
                        <td class="col-rate">${item.price}</td>
                        <td class="col-amt">${item.subtotal}</td>
                    </tr>
                `;
            });

            const headerTitle = type === 'invoice' ? 'Invoice' : 'Receipt';
            const dateTime = type === 'receipt' ? `${data.date} ${data.time}` : data.date;

            preview.innerHTML = `
                <div class="pos-header">
                    <div class="pos-logo">${data.bizName.split(' ')[0]}</div>
                    <div class="pos-sub">${data.bizName}</div>
                    <div class="pos-sub">${data.bizAddress}</div>
                </div>
                
                <div class="pos-divider"></div>
                <div class="pos-meta">Date: ${dateTime}</div>
                <div class="pos-meta">${headerTitle} #: ${data.number}</div>
                <div class="pos-meta">Customer: ${data.cusName}</div>
                <div class="pos-divider"></div>
                
                <div class="pos-title">${headerTitle}</div>
                
                <table class="pos-table">
                    <thead>
                        <tr>
                            <th class="col-desc">Product</th>
                            <th class="col-qty">Qty</th>
                            <th class="col-rate">Rate</th>
                            <th class="col-amt">Amount</th>
                        </tr>
                    </thead>
                    <tbody>${thermalItems}</tbody>
                </table>
                
                <div class="pos-divider"></div>
                
                <div class="pos-total-row">
                    <span>Total:</span>
                    <span>#${data.grandTotal}</span>
                </div>
                
                <div class="pos-method-row" style="margin-top: 15px;">
                    <span>${data.method || (data.bankName ? 'Bank Transfer' : 'Cash')}</span>
                    <span style="text-align: right;">
                        <span style="font-size: 10px; display:block;"># 0.00</span>
                        <span>${data.grandTotal}</span>
                    </span>
                </div>
                
                <div class="pos-divider"></div>
                <div class="pos-method-row">
                    <span>Total Quantity</span>
                    <span>${data.totalQty}</span>
                </div>
                <div class="pos-divider"></div>
                
                ${data.cashier ? `
                    <div class="pos-method-row">
                        <span>Served by: ${data.cashier.toUpperCase()}</span>
                    </div>
                    <div class="pos-divider"></div>
                ` : ''}

                <div class="pos-footer">
                    Thank you for choosing ${data.bizName.split(' ')[0]}
                </div>
                
                ${data.notes ? `
                    <div class="pos-notes">
                        **${data.notes.toUpperCase()}**
                    </div>
                ` : ''}

                <div class="pos-barcode">
                    <svg id="barcode"></svg>
                    <div style="font-size: 11px; margin-top: 5px; letter-spacing: 2px;">${data.number}</div>
                </div>
            `;

            setTimeout(() => {
                if (!window.JsBarcode) return;
                JsBarcode("#barcode", data.number, { 
                    format: "CODE128", width: 1.8, height: 40, 
                    displayValue: false, margin: 0, background: "transparent" 
                });
            }, 100);

            return;
        }

        // ----------------------------------------------------
        // PREMIUM A4 & HALF-A4 LOGIC (EMERALD & GOLD)
        // ----------------------------------------------------
        let stdItems = '';
        data.items.forEach(item => {
            stdItems += `
                <tr>
                    <td class="col-desc"><strong>${item.name}</strong></td>
                    <td class="col-qty">${item.qty}</td>
                    <td class="col-price">${item.price}</td>
                    <td class="col-amt"><strong>${item.subtotal}</strong></td>
                </tr>
            `;
        });

        const docTitle = type === 'invoice' ? 'INVOICE' : 'RECEIPT';
        const dateBlock = type === 'receipt' ? `${data.date} ${data.time}` : data.date;

        preview.innerHTML = `
            <div class="std-header">
                <div class="std-logo">
                    <h2>${data.bizName}</h2>
                    <p>${data.bizAddress} <br> ${data.bizPhone} | ${data.bizEmail}</p>
                </div>
                <div class="text-right">
                    <h1>${docTitle}</h1>
                    <div style="font-size: 1.2rem; margin-top: 10px; font-weight: 600; color: #f9fafb;"># ${data.number}</div>
                </div>
            </div>

            <div class="std-body">
                <div class="std-meta-grid">
                    <div class="std-info-card">
                        <h4>${type === 'invoice' ? 'Billed To' : 'Received From'}</h4>
                        <p style="font-size: 1.3rem; font-weight: 800;">${data.cusName}</p>
                        ${data.cusPhone ? `<p style="color:#64748b;">${data.cusPhone}</p>` : ''}
                        ${data.cusEmail ? `<p style="color:#64748b;">${data.cusEmail}</p>` : ''}
                        ${data.cusAddress ? `<p style="margin-top: 8px;">${data.cusAddress}</p>` : ''}
                    </div>
                    <div class="std-info-card text-right" style="border-left: none; border-right: 4px solid var(--doc-accent);">
                        <h4>Date Issued</h4>
                        <p>${dateBlock}</p>
                        ${data.due ? `<h4 style="margin-top: 15px;">Due Date</h4><p>${data.due}</p>` : ''}
                        ${data.cashier ? `<h4 style="margin-top: 15px;">Cashier</h4><p>${data.cashier}</p>` : ''}
                    </div>
                </div>

                <div class="std-table-wrapper">
                    <table class="std-table">
                        <thead>
                            <tr>
                                <th class="col-desc">Description</th>
                                <th class="col-qty">Qty</th>
                                <th class="col-price right">Unit Price</th>
                                <th class="col-amt right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>${stdItems}</tbody>
                    </table>
                </div>

                <div class="std-summary">
                    <div class="std-summary-box">
                        <div class="std-summary-row"><span>Subtotal</span><span>${data.grandTotal}</span></div>
                        <div class="std-summary-row grand"><span>Total ${type === 'receipt' ? 'Paid' : 'Due'}</span><span>#${data.grandTotal}</span></div>
                    </div>
                </div>
            </div>

            <div class="std-footer">
                <div class="std-footer-notes">
                    ${data.bankName && data.accNumber ? `
                        <strong>Payment Details:</strong><br>
                        Bank: ${data.bankName}<br>
                        Account Name: ${data.accName}<br>
                        Account Number: ${data.accNumber}<br><br>
                    ` : ''}
                    ${data.method ? `<strong>Payment Method:</strong> ${data.method}<br><br>` : ''}
                    ${data.notes ? `<strong>Notes:</strong><br>${data.notes}` : ''}
                </div>
                <div class="std-qr">
                    <div id="qr-code"></div>
                </div>
            </div>
        `;

        setTimeout(() => {
            const qrTarget = document.getElementById("qr-code");
            if (qrTarget && window.QRCode) {
                const qrText = type === 'invoice' 
                    ? `INV: ${data.number} | Total: ${data.grandTotal} | Bank: ${data.bankName || 'N/A'}`
                    : `REC: ${data.number} | Paid: ${data.grandTotal}`;
                // Using the exact Emerald Green hex for the QR code color
                new QRCode(qrTarget, { text: qrText, width: 100, height: 100, colorDark: "#064E3B", colorLight: "#ffffff" });
            }
        }, 100);
    },

    editDocument() {
        if (this.currentDocType === 'invoice') this.showView('invoice-form');
        else if (this.currentDocType === 'receipt') this.showView('receipt-form');
    },

    printDocument() {
        window.print();
    },

    async downloadPNG() {
        const preview = document.getElementById('document-preview');
        
        // Force true width for capture to prevent mobile cutoff
        const isThermal = preview.classList.contains('template-thermal');
        const originalWidth = preview.style.width;
        const originalMaxWidth = preview.style.maxWidth;
        
        if (!isThermal) {
            preview.style.width = '800px'; 
            preview.style.maxWidth = '800px';
        }

        if (!window.html2canvas) { alert('PNG export needs the optional image library. Use Print instead.'); return; }
        try {
            const canvas = await html2canvas(preview, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const link = document.createElement('a');
            link.download = `${this.currentDocType}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } finally {
            // Restore original responsiveness
            preview.style.width = originalWidth;
            preview.style.maxWidth = originalMaxWidth;
        }
    },

    async downloadPDF() {
        const preview = document.getElementById('document-preview');
        
        // Force true width for capture to prevent mobile cutoff
        const isThermal = preview.classList.contains('template-thermal');
        const originalWidth = preview.style.width;
        const originalMaxWidth = preview.style.maxWidth;
        
        if (!isThermal) {
            preview.style.width = '800px';
            preview.style.maxWidth = '800px';
        }

        if (!window.html2canvas || !window.jspdf) { alert('PDF export libraries are unavailable. Use Print → Save as PDF.'); window.print(); return; }
        try {
            const canvas = await html2canvas(preview, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            
            let pdf;
            if (isThermal) {
                const width = 80;
                const height = (canvas.height * width) / canvas.width;
                pdf = new jsPDF('p', 'mm', [width, height]);
                pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            } else {
                const isHalf = preview.classList.contains('template-half-a4');
                const format = isHalf ? 'a5' : 'a4';
                pdf = new jsPDF('p', 'mm', format);
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save(`${this.currentDocType}-${Date.now()}.pdf`);
        } finally {
            // Restore original responsiveness
            preview.style.width = originalWidth;
            preview.style.maxWidth = originalMaxWidth;
        }
    }
};

// Auto-display labels on mobile for item rows dynamically
window.addEventListener('resize', () => {
    const labels = document.querySelectorAll('.mobile-only-label');
    if (window.innerWidth <= 768) {
        labels.forEach(l => l.style.display = 'block');
    } else {
        labels.forEach(l => l.style.display = 'none');
    }
});

// Initialize App
document.addEventListener('DOMContentLoaded', () => app.init());
