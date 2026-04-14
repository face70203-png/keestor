const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Optimized Email Utility
 * Prioritizes Resend API for speed, falls back to Classic SMTP for reliability.
 */
const sendEmail = async (options) => {
    const resendKey = (process.env.RESEND_API_KEY || "").trim();
    const smtpUser = (process.env.SMTP_USER || "").trim();
    const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, '');

    const fromAddress = `${process.env.FROM_NAME || 'KeeStore'} <${process.env.FROM_EMAIL || smtpUser || 'onboarding@resend.dev'}>`;

    // --- MODE 1: RESEND API (Fast Mode) ---
    if (resendKey) {
        console.log(`[EMAIL] Attempting Resend API dispatch to: ${options.email}`);
        
        // Use onboarding sender for sandbox compatibility
        const resendSender = (resendKey.includes('_ox') || resendKey.startsWith('re_')) ? 'onboarding@resend.dev' : fromAddress;

        try {
            const response = await axios.post('https://api.resend.com/emails', {
                from: resendSender,
                to: options.email,
                subject: options.subject,
                html: options.message
            }, {
                headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`[EMAIL] Resend Success: ${response.data.id}`);
            return { success: true, messageId: response.data.id };
        } catch (apiError) {
            console.error(`[EMAIL] Resend API Failed, falling back to SMTP...`);
        }
    } 

    // --- MODE 2: CLASSIC SMTP (Reliability Mode) ---
    console.log(`[EMAIL] Attempting Classic SMTP dispatch to: ${options.email}`);
    
    if (!smtpUser || !smtpPass) {
        throw new Error("Missing credentials. Please check SMTP_USER and SMTP_PASS.");
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const mailOptions = {
            from: fromAddress,
            to: options.email,
            subject: options.subject,
            html: options.message,
        };

        // Standard send without artificial timeouts
        const info = await transporter.sendMail(mailOptions);

        console.log(`[EMAIL] SMTP Success: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (smtpError) {
        console.error(`[EMAIL] SMTP Error:`, smtpError.message);
        throw new Error(`Email delivery failure: ${smtpError.message}`);
    }
};

module.exports = sendEmail;
