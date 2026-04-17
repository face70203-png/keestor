const PDFDocument = require('pdfkit');

function generateInvoicePDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            let buffers = [];
            
            doc.on('data', (buffer) => buffers.push(buffer));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData.toString('base64')); // Return base64 encoded string for attachments
            });

            // HEADER
            doc.fontSize(28).font('Helvetica-Bold').fillColor('#0f172a').text('KeeStore', 50, 50);
            doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Official Account Statement & Invoice', 50, 80);
            
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a');
            doc.text(`INVOICE UID: #${order._id.toString().slice(-12).toUpperCase()}`, 350, 50, { align: 'right' });
            doc.font('Helvetica').fillColor('#64748b');
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 65, { align: 'right' });
            doc.text(`Status: `, 450, 80);
            doc.font('Helvetica-Bold').fillColor('#10b981').text(`FULFILLED`, 490, 80, { align: 'right' });

            doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#e2e8f0').stroke();

            // ITEMS LIST
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Purchased Digital Assets', 50, 130);
            
            let y = 160;
            order.items.forEach(item => {
                doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(item.title, 50, y);
                doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`Qty: ${item.quantity}`, 400, y);
                doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(`$${(item.price * item.quantity).toFixed(2)}`, 450, y, { align: 'right' });
                
                y += 20;

                // License key
                doc.fontSize(9).font('Courier').fillColor('#2563eb');
                if (item.keys && item.keys.length > 0) {
                    item.keys.forEach(k => {
                        if (k && k.value) {
                            if (k.keyType === 'image') {
                                doc.text(`[Visual Asset / QR - Sent directly to Vault]`, 50, y);
                            } else {
                                doc.text(`${k.value}`, 50, y);
                            }
                            y += 15;
                        }
                    });
                } else if (order.deliveredKey) {
                    doc.text(`${order.deliveredKey}`, 50, y);
                    y += 15;
                }
                
                y += 10;
                doc.moveTo(50, y).lineTo(550, y).strokeColor('#f8fafc').stroke();
                y += 15;
                
                // pagination safeguard
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
            });

            // TOTALS
            y += 20;
            doc.moveTo(50, y).lineTo(550, y).strokeColor('#e2e8f0').stroke();
            y += 20;

            doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('Grand Total:', 350, y);
            doc.text(`$${Number(order.totalAmount || 0).toFixed(2)}`, 450, y, { align: 'right' });

            // PAYMENT METHOD
            y += 25;
            doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Payment Method:', 350, y);
            if (order.cardLast4) {
               doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${order.cardBrand?.toUpperCase() || 'Card'} **** ${order.cardLast4}`, 450, y, { align: 'right' });
            } else {
               doc.font('Helvetica-Bold').fillColor('#0f172a').text('KeeWallet (Interior)', 450, y, { align: 'right' });
            }

            // FOOTER
            doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('Thank you for choosing KeeStore. All purchases are final and digitally dispensed.', 50, 750, { align: 'center' });
            doc.text('This is an officially generated document serving as proof of purchase.', 50, 765, { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}
module.exports = generateInvoicePDF;
