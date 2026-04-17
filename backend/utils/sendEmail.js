const axios = require('axios');
const nodemailer = require('nodemailer');
const generateInvoicePDF = require('./generateInvoicePDF');
const SystemLog = require('../models/SystemLog');

/**
 * Generates a high-end, premium HTML invoice/order success email.
 */
const generateInvoiceHTML = (order) => {
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 20px 0; vertical-align: top;">
                <p style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">${item.title}</p>
                <div style="margin-top: 12px; padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; color: #2563eb;">
                    <div style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Digital License Key</div>
                    ${item.keys && item.keys.length > 0 && item.keys.some(k => k && k.value) 
                        ? item.keys.filter(k => k && k.value).map(k => k.keyType === 'image' 
                            ? `<div style="margin-top:8px;"><img src="${k.value}" style="max-width:140px; border-radius:10px; border:2px solid #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" alt="Activation QR" /></div>` 
                            : `<span style="display:block; margin-top:4px; word-break:break-all; font-weight: 700;">${k.value}</span>`
                        ).join('') 
                        : (order.deliveredKey && order.deliveredKey !== 'Awaiting checkout...' ? `<span style="display:block; margin-top:4px; word-break:break-all; font-weight: 700;">${order.deliveredKey}</span>` : '<span style="color: #94a3b8;">Pending Generation...</span>')}
                </div>
            </td>
            <td style="padding: 20px 0; vertical-align: top; text-align: right;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">$${(item.price * item.quantity).toFixed(2)}</p>
                <p style="margin: 4px 0 0; font-size: 11px; color: #64748b; font-weight: 600;">Qty: ${item.quantity}</p>
            </td>
        </tr>
    `).join('');

    const activationSteps = order.items[0]?.activationSteps || 'Please check your dashboard for specialized activation instructions.';

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);">
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #0f172a; padding: 40px; text-align: center;">
                                <div style="display: inline-block; padding: 12px; background: rgba(37,38,66,0.5); border-radius: 16px; margin-bottom: 20px;">
                                    <span style="font-size: 32px;">📦</span>
                                </div>
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">Order Confirmed</h1>
                                <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px; font-weight: 500;">Your digital assets have been delivered.</p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                                    <tr>
                                        <td>
                                            <p style="margin: 0; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Invoice UID</p>
                                            <p style="margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #0f172a;">#${order._id.toString().slice(-12).toUpperCase()}</p>
                                        </td>
                                        <td style="text-align: right;">
                                            <p style="margin: 0; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Purchase Date</p>
                                            <p style="margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #0f172a;">${new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </td>
                                    </tr>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                    ${itemsHtml}
                                </table>

                                <!-- Total Card -->
                                <div style="background-color: #f8fafc; border-radius: 20px; padding: 24px; border: 1px solid #f1f5f9;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td style="font-size: 14px; font-weight: 600; color: #64748b;">Grand Total</td>
                                            <td style="text-align: right; font-size: 20px; font-weight: 900; color: #0f172a;">$${Number(order.totalAmount || 0).toFixed(2)}</td>
                                        </tr>
                                        ${order.cardLast4 ? `
                                        <tr>
                                            <td style="padding-top: 12px; font-size: 12px; font-weight: 500; color: #94a3b8;">Payment Method</td>
                                            <td style="padding-top: 12px; text-align: right; font-size: 12px; font-weight: 700; color: #0f172a;">${order.cardBrand?.toUpperCase() || 'Stripe'} •••• ${order.cardLast4}</td>
                                        </tr>
                                        ` : `
                                        <tr>
                                            <td style="padding-top: 12px; font-size: 12px; font-weight: 500; color: #94a3b8;">Payment Method</td>
                                            <td style="padding-top: 12px; text-align: right; font-size: 12px; font-weight: 700; color: #0f172a;">KeeWallet Interior Balance</td>
                                        </tr>
                                        `}
                                    </table>
                                </div>

                                <!-- Activation Content -->
                                <div style="margin-top: 40px; padding-top: 40px; border-top: 2px dashed #f1f5f9;">
                                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                                        Activation Protocol
                                    </h3>
                                    <div style="font-size: 14px; color: #475569; line-height: 1.7; font-weight: 500;">
                                        ${activationSteps}
                                    </div>
                                    <div style="margin-top: 32px; text-align: center;">
                                        <a href="${process.env.FRONTEND_URL || 'https://keestore.app'}/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 14px; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); margin-bottom: 12px;">Access Secure Dashboard</a>
                                        <br/>
                                        <a href="${process.env.API_URL || 'http://localhost:5000'}/api/orders/${order._id}/invoice" style="display: inline-block; background-color: #f8fafc; color: #475569; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 13px; transition: all 0.2s;">📄 Download Official PDF Invoice</a>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafc; padding: 32px; text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 600; line-height: 1.5;">This is a premium transactional receipt from KeeStore.<br/>Secure Digital Assets & Managed Services.</p>
                                <div style="margin-top: 16px; font-size: 11px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">© 2026 KeeStore Solutions Ltd.</div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

const sendEmail = async (options) => {
    // Determine final payload
    const finalMessage = options.order ? generateInvoiceHTML(options.order) : options.message;

    const resendKey = (process.env.RESEND_API_KEY || "").trim();
    const smtpUser = (process.env.SMTP_USER || "").trim();
    const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, '');
    const fromAddress = `${process.env.FROM_NAME || 'KeeStore Vault'} <${process.env.FROM_EMAIL || smtpUser || 'no-reply@keestore.com'}>`;

    // --- STRATEGY 1: RESEND API (Zero Latency) ---
    if (resendKey) {
        console.log(`[VAULT-MAIL] Initializing Resend Pipeline...`);
        try {
            const payload = {
                from: fromAddress,
                to: options.email,
                subject: options.subject,
                html: finalMessage
            };

            const response = await axios.post('https://api.resend.com/emails', payload, {
                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                timeout: 15000 
            });
            console.log(`[VAULT-MAIL] Delivered successfully via API: ${response.data.id}`);
            
            // 📝 Log Success
            await SystemLog.create({
                type: 'EMAIL_SUCCESS',
                level: 'info',
                module: 'Mailer',
                message: `Email delivered to ${options.email}`,
                metadata: {
                    recipient: options.email,
                    provider: 'Resend',
                    orderId: options.order ? options.order._id : null,
                    attachmentCount: 0
                }
            }).catch(e => console.error("Log Error:", e.message));

            return { success: true, method: 'API' };
        } catch (apiError) {
            console.warn(`[VAULT-MAIL] API Pipeline interrupted: ${apiError.message}. Switching to SMTP Fallback...`);
            
            // 📝 Log Warning/Failure for API
            await SystemLog.create({
                type: 'EMAIL_FAILURE',
                level: 'warn',
                module: 'Mailer (API)',
                message: `Resend API failed: ${apiError.message}`,
                details: apiError.response?.data || apiError.stack,
                metadata: {
                    recipient: options.email,
                    provider: 'Resend',
                    orderId: options.order ? options.order._id : null
                }
            }).catch(e => console.error("Log Error:", e.message));
        }
    } 

    // --- STRATEGY 2: SMTP FALLBACK (Redundant) ---
    if (!smtpUser || !smtpPass) {
        await SystemLog.create({
            type: 'EMAIL_FAILURE',
            level: 'error',
            module: 'Mailer',
            message: 'No SMTP credentials provided for fallback',
            metadata: { recipient: options.email }
        }).catch(e => console.error("Log Error:", e.message));

        throw new Error("Critical Failure: No valid mail providers configured (API/SMTP).");
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: true,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false }
        });

        const mailOptions = {
            from: fromAddress,
            to: options.email,
            subject: options.subject,
            html: finalMessage,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`[VAULT-MAIL] Delivered successfully via SMTP: ${info.messageId}`);
        
        // 📝 Log Success (SMTP)
        await SystemLog.create({
            type: 'EMAIL_SUCCESS',
            level: 'info',
            module: 'Mailer',
            message: `Email delivered to ${options.email} via SMTP fallback`,
            metadata: {
                recipient: options.email,
                provider: 'SMTP',
                orderId: options.order ? options.order._id : null
            }
        }).catch(e => console.error("Log Error:", e.message));

        return { success: true, method: 'SMTP' };
    } catch (smtpError) {
        console.error(`[VAULT-MAIL] SMTP Pipeline failed:`, smtpError.message);
        
        // 📝 Log Critical Failure
        await SystemLog.create({
            type: 'EMAIL_FAILURE',
            level: 'error',
            module: 'Mailer (SMTP)',
            message: `SMTP failed: ${smtpError.message}`,
            details: smtpError.stack,
            metadata: {
                recipient: options.email,
                provider: 'SMTP',
                orderId: options.order ? options.order._id : null
            }
        }).catch(e => console.error("Log Error:", e.message));

        throw new Error(`Global mail delivery failure: ${smtpError.message}`);
    }
};

module.exports = sendEmail;
