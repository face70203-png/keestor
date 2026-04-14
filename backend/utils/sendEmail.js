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
        console.log(`[EMAIL] Attempting high-speed dispatch via Resend API to: ${options.email}`);
        try {
            const response = await axios.post('https://api.resend.com/emails', {
                from: fromAddress,
                to: options.email,
                subject: options.subject,
                html: options.message
            }, {
                headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10s timeout for API
            });
            console.log(`[EMAIL] Resend Dispatch Successful: ${response.data.id}`);
            return { success: true, messageId: response.data.id };
        } catch (apiError) {
            console.error(`[EMAIL] Resend API Failed: ${apiError.response?.data?.message || apiError.message}`);
            console.log(`[EMAIL] Falling back to SMTP...`);
            // Continue to SMTP mode
        }
    }

    // --- MODE 2: OPTIMIZED SMTP (Fallback) ---
    console.log(`[EMAIL] Attempting direct SMTP dispatch to: ${options.email}`);
    
    if (!smtpUser || !smtpPass) {
        throw new Error("No mail credentials found (RESEND_API_KEY or SMTP_USER/PASS).");
    }

    try {
        const transportConfig = smtpHost.includes('gmail') ? {
            service: 'gmail',
            auth: { user: smtpUser, pass: smtpPass }
        } : {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false } // Avoid handshake hangs on shared hosting
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
