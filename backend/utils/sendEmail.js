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
        
        const attemptSend = async (sender) => {
            return await axios.post('https://api.resend.com/emails', {
                from: sender,
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
        };

        try {
            // 🛡️ Phase 1: Try Official Sender
            console.log(`[EMAIL] Attempting dispatch via Official Sender: ${fromAddress}`);
            const response = await attemptSend(fromAddress);
            console.log(`[EMAIL] Resend Dispatch Successful (Official): ${response.data.id}`);
            return { success: true, messageId: response.data.id, method: 'resend-official' };
        } catch (apiError) {
            const status = apiError.response?.status;
            const errMsg = apiError.response?.data?.message || apiError.message;

            // 🔄 Phase 2: If unauthorized, retry with Sandbox Onboarding address
            if (status === 403 || status === 422 || status === 401) {
                console.warn(`[EMAIL] Official Sender rejected. Retrying with onboarding fallback...`);
                try {
                    const fallbackResponse = await attemptSend('onboarding@resend.dev');
                    console.log(`[EMAIL] Resend Dispatch Successful (Sandbox Fallback): ${fallbackResponse.data.id}`);
                    return { success: true, messageId: fallbackResponse.data.id, method: 'resend-sandbox' };
                } catch (fallbackError) {
                    console.error(`[EMAIL] Resend Sandbox Fallback also failed: ${fallbackError.message}`);
                }
            } else {
                console.error(`[EMAIL] Resend API Error (${status}): ${errMsg}`);
            }
            console.log(`[EMAIL] Proceeding to SMTP fallback...`);
        }
    } 

    // --- MODE 2: OPTIMIZED SMTP (Fallback) ---
    if (resendKey) {
       console.log(`[EMAIL] Using SMTP fallback as last resort...`);
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
