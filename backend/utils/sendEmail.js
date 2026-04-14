const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * High-Speed Email Utility
 * Prioritizes Resend API (HTTP) for speed, falls back to optimized SMTP.
 */
const sendEmail = async (options) => {
    const resendKey = (process.env.RESEND_API_KEY || "").trim();
    const smtpUser = (process.env.SMTP_USER || "").trim();
    const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, '');
    const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
    const smtpPort = parseInt(process.env.SMTP_PORT) || 465;

    const fromAddress = `${process.env.FROM_NAME || 'KeeStore'} <${process.env.FROM_EMAIL || smtpUser || 'onboarding@resend.dev'}>`;

    // --- MODE 1: RESEND API (Preferred for Speed) ---
    if (resendKey) {
        console.log(`[EMAIL] Detecting Resend Key: ${resendKey.substring(0, 6)}...`);
        
        // 🛡️ Fix for Sandbox: Resend ONLY allows 'onboarding@resend.dev' as sender until domain is verified.
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
                },
                timeout: 25000 
            });
            console.log(`[EMAIL] Resend Dispatch Successful: ${response.data.id}`);
            return { success: true, messageId: response.data.id, method: 'resend' };
        } catch (apiError) {
            const errMsg = apiError.response?.data?.message || apiError.message;
            console.error(`[EMAIL] Resend API Failed (${apiError.response?.status}): ${errMsg}`);
            console.log(`[EMAIL] Falling back to SMTP (Recipients outside of sandbox/verified domains)...`);
        }
    } 

    // --- MODE 2: OPTIMIZED SMTP (Fallback) ---
    if (resendKey) {
       console.log(`[EMAIL] Proceeding with SMTP fallback...`);
    } else {
       console.log(`[EMAIL] Resend Key NOT detected. Using SMTP legacy mode.`);
    }
    
    console.log(`[EMAIL] Attempting direct SMTP dispatch to: ${options.email}`);
    
    if (!smtpUser || !smtpPass) {
        throw new Error("Missing Credentials: No RESEND_API_KEY and No SMTP_USER/PASS found in Environment Variables.");
    }

    try {
        const transportConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL/TLS
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                rejectUnauthorized: false // Bypass SSL handshake hangs on some cloud proxies
            }
        };

        const transporter = nodemailer.createTransport(transportConfig);

        const mailOptions = {
            from: fromAddress,
            to: options.email,
            subject: options.subject,
            html: options.message,
        };

        // Execute sendMail with a strict timeout
        const info = await Promise.race([
            transporter.sendMail(mailOptions),
            new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP Timeout - Check Credentials/Network")), 20000))
        ]);

        console.log(`[EMAIL] SMTP Dispatch Successful: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (smtpError) {
        console.error(`[EMAIL] SMTP Dispatch Failed:`, smtpError.message);
        throw new Error(`Email delivery failure: ${smtpError.message} (${smtpError.code || 'TIMEOUT'})`);
    }
};

module.exports = sendEmail;
